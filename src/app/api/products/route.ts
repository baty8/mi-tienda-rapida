// src/app/api/products/route.ts
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ---------- Utils ----------
const generateSkuFromName = (name: string): string =>
  (name.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')) || 'sku-sin-nombre';

const toNumberOrNull = (v: unknown) =>
  typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(',', '.')) : null;

const ok = (data: any, status = 200) => NextResponse.json(data, { status });
const err = (message: string, status = 500, meta?: any) =>
  NextResponse.json({ error: message, ...meta }, { status });

// ---------- GET (healthcheck) ----------
export async function GET() {
  return NextResponse.json({ ok: true, hint: 'usa POST para upsert' });
}

// ---------- POST (upsert de producto) ----------
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !srk) {
    return err('Faltan envs de Supabase', 500, {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!srk,
    });
  }
  if (supabaseUrl.includes('localhost') || supabaseUrl.startsWith('http://')) {
    return err('NEXT_PUBLIC_SUPABASE_URL invalida (localhost/http). Usa https://<proyecto>.supabase.co', 500, { supabaseUrl });
  }

  const supabase = createClient(supabaseUrl, srk);

  // API Key simple
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  const providedApiKey = request.headers.get('authorization')?.split('Bearer ')[1];
  if (providedApiKey !== expectedApiKey) return err('No autorizado', 401);

  // Body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return err('Body JSON inválido', 400);
  }

  const { userEmail, name, price, cost, stock, description, visible, image_urls } = body ?? {};
  if (!userEmail || !name || price === undefined) {
    return err('Faltan parámetros: userEmail, name, price', 400);
  }

  // Números
  const priceNum = toNumberOrNull(price);
  const costNum = cost === undefined ? null : toNumberOrNull(cost);
  const stockNum =
    stock === undefined ? null : (typeof stock === 'number' ? stock : parseInt(String(stock), 10));
  if (!Number.isFinite(priceNum as number)) return err('price debe ser numérico', 400, debug ? { price } : undefined);
  if (cost !== undefined && !Number.isFinite(costNum as number)) return err('cost debe ser numérico', 400, debug ? { cost } : undefined);
  if (stock !== undefined && !Number.isInteger(stockNum as number)) return err('stock debe ser entero', 400, debug ? { stock } : undefined);

  // Buscar user en profiles por email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();

  if (profileError || !profile?.id) {
    return err(`Usuario con email ${userEmail} no encontrado en profiles`, 404, debug ? { profileError: profileError?.message } : undefined);
  }
  const ownerId = profile.id;

  const generatedSku = generateSkuFromName(name);

  const basePayload: Record<string, any> = {
    name,
    price: priceNum,
    user_id: ownerId,
    sku: [generatedSku],
  };
  if (costNum !== null) basePayload.cost = costNum;
  if (stockNum !== null) basePayload.stock = stockNum;
  if (typeof description === 'string') basePayload.description = description;
  if (typeof visible === 'boolean') basePayload.visible = visible;

  const hasIncomingImages = Array.isArray(image_urls) && image_urls.length > 0;
  const updatePayload = hasIncomingImages
    ? { ...basePayload, image_urls: image_urls.map(String) }
    : { ...basePayload };
  const insertPayload = hasIncomingImages
    ? { ...basePayload, image_urls: image_urls.map(String) }
    : { ...basePayload, image_urls: ['https://placehold.co/600x400.png'] };

  // Buscar existente por sku para ese user
  const { data: existing, error: findError } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', ownerId)
    .contains('sku', [generatedSku]);

  if (findError) return err('Error buscando producto', 500, debug ? { findError: findError.message } : undefined);

  if (existing && existing.length > 1) {
    return err(`Conflicto: múltiples productos con SKU '${generatedSku}'. Debe ser único por usuario.`, 409, debug ? { count: existing.length } : undefined);
  }

  const found = existing?.[0];

  if (found) {
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', found.id)
      .select()
      .single();

    if (updateError) return err('Error al actualizar', 500, debug ? { updateError: updateError.message } : undefined);
    return ok({ message: 'Producto actualizado', product: updated }, 200);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) return err('Error al crear', 500, debug ? { insertError: insertError.message } : undefined);
    return ok({ message: 'Producto creado', product: inserted }, 201);
  }
}