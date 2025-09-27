import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ok = (data: any, status = 200) => NextResponse.json(data, { status });
const err = (message: string, status = 500, meta?: any) =>
  NextResponse.json({ error: message, ...meta }, { status });

// slug seguro (por si mandás name o un sku con espacios/mayúsculas)
const toSlug = (s: string) =>
  (s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sku-sin-nombre';

// ---------- GET (health) ----------
export async function GET() {
  return ok({ ok: true, hint: 'usa PATCH para ajustar stock' });
}

/**
 * PATCH /api/products/stock
 * Body (tolerante):
 * {
 *   "userEmail" | "email": "user@mail.com",
 *   "sku" | "name" | "productName": "...",   // acepta sku == name o slug
 *   "adjustment" | "amount" | "qty" | "delta": -3   // entero (positivo o negativo)
 * }
 */
export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  // --- API KEY ---
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  const providedApiKey = request.headers.get('authorization')?.split('Bearer ')[1];
  if (providedApiKey !== expectedApiKey) return err('No autorizado', 401);

  // --- ENVS ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !srk) {
    return err('Faltan envs de Supabase', 500, {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!srk,
    });
  }
  const supabase = createClient(supabaseUrl, srk);

  // --- BODY (tolerante) ---
  let raw: any = {};
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      raw = await request.json();
    } else if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      raw = Object.fromEntries(new URLSearchParams(text));
    } else {
      const text = await request.text();
      try { raw = JSON.parse(text); } catch { raw = {}; }
    }
  } catch {
    return err('Body JSON inválido', 400);
  }

  // Unwrap común ({data},{record},{body})
  const candidate = { ...raw, ...raw?.data, ...raw?.record, ...raw?.body };
  const pick = (obj: any, aliases: string[]) => {
    for (const k of Object.keys(obj ?? {})) {
      if (aliases.some(a => a.toLowerCase() === String(k).toLowerCase())) return obj[k];
    }
    return undefined;
  };

  const userEmail = pick(candidate, ['userEmail', 'email', 'user_email']);
  const skuIn = pick(candidate, ['sku', 'SKU', 'Sku']);
  const nameIn = pick(candidate, ['name', 'productName', 'product_name', 'nombre']);
  const adjIn = pick(candidate, ['adjustment', 'amount', 'qty', 'quantity', 'delta', 'value']);

  const rawSku = skuIn != null ? String(skuIn).trim() : undefined;
  const rawName = nameIn != null ? String(nameIn).trim() : undefined;
  const slug = toSlug(rawSku ?? rawName ?? '');

  const skuCandidates = Array.from(
    new Set([rawSku, rawName, slug, rawSku?.toLowerCase(), rawName?.toLowerCase()].filter(Boolean) as string[])
  );

  if (!userEmail || skuCandidates.length === 0) {
    return err('Faltan parámetros: sku o name, y userEmail', 400, debug ? { received: candidate } : undefined);
  }

  // adjustment entero (puede ser negativo o positivo; 0 = no-op permitido)
  const adjustment = typeof adjIn === 'number' ? adjIn : parseInt(String(adjIn ?? ''), 10);
  if (!Number.isFinite(adjustment)) {
    return err('El valor de "adjustment" debe ser un número entero', 400, debug ? { received: adjIn } : undefined);
  }

  // --- OWNER ---
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', String(userEmail))
    .maybeSingle();

  if (profileError || !profile?.id) {
    return err(`Usuario con email ${userEmail} no encontrado`, 404, debug ? { profileError: profileError?.message } : undefined);
  }
  const ownerId = profile.id;

  // --- PRODUCTO (por overlap en sku[], fallback por name) ---
  let { data: rows, error: findError } = await supabase
    .from('products')
    .select('id, name, sku, stock')
    .eq('user_id', ownerId)
    .overlaps('sku', skuCandidates);

  if (findError) return err('Error buscando el producto', 500, debug ? { findError: findError.message } : undefined);

  if (rawName && (!rows || rows.length === 0)) {
    const byName = await supabase
      .from('products')
      .select('id, name, sku, stock')
      .eq('user_id', ownerId)
      .ilike('name', rawName); // igualdad case-insensitive
    if (byName.error) return err('Error buscando por name', 500, debug ? { error: byName.error.message } : undefined);
    rows = byName.data ?? [];
  }

  if (!rows || rows.length === 0) {
    return err(`Producto con candidatos [${skuCandidates.join(', ')}] no encontrado`, 404);
  }
  if (rows.length > 1) {
    return err('Conflicto: múltiples productos coinciden con ese SKU/Name', 409, debug ? {
      matches: rows.map(r => ({ id: r.id, name: r.name, sku: r.sku }))
    } : undefined);
  }

  const product = rows[0];
  const current = Number.isInteger(product.stock)
    ? product.stock
    : parseInt(String(product.stock ?? 0), 10) || 0;

  const newStock = current + adjustment;
  if (newStock < 0) {
    return err(`El ajuste resultaría en stock negativo (${newStock}). Stock actual: ${current}.`, 409);
  }

  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', product.id)
    .select('id, name, sku, stock')
    .single();

  if (updateError) {
    return err('Error al actualizar el stock', 500, debug ? { updateError: updateError.message } : undefined);
  }

  return ok({
    message: 'Stock actualizado correctamente.',
    productId: updatedProduct?.id,
    name: updatedProduct?.name,
    sku: updatedProduct?.sku,
    previous: current,
    adjustment,
    current: updatedProduct?.stock,
    product: updatedProduct
  });
}