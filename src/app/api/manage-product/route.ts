import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';

export const runtime = 'nodejs';

const ok = (data: any, status = 200) => NextResponse.json(data, { status });
const err = (message: string, status = 500, meta?: any) =>
  NextResponse.json({ error: message, ...meta }, { status });

const toSlug = (s: string) =>
  (s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sku-sin-nombre';

const scheduleIsArray = (process.env.SCHEDULE_IS_ARRAY ?? '').toString().trim() === '1';

export async function GET() {
  return ok({ ok: true, hint: 'usa PATCH para pausar/activar y programar re-publicación' });
}

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  // API key
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  const providedApiKey = request.headers.get('authorization')?.split('Bearer ')[1];
  if (providedApiKey !== expectedApiKey) return err('No autorizado', 401);

  // ENVs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !srk) {
    return err('Faltan envs de Supabase', 500, {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!srk,
    });
  }
  const supabase = createClient(supabaseUrl, srk);

  // Body (tolerante) + alias
  let raw: any = {};
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      raw = await request.json();
    } else {
      const text = await request.text();
      try { raw = JSON.parse(text); } catch { raw = {}; }
    }
  } catch { return err('Body JSON inválido', 400); }

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
  const visibleIn = pick(candidate, ['visible', 'isVisible']);
  const pauseIn = pick(candidate, ['pause_duration_minutes', 'pause', 'pauseMinutes', 'resume_in']);

  const rawSku = skuIn != null ? String(skuIn).trim() : undefined;
  const rawName = nameIn != null ? String(nameIn).trim() : undefined;
  const slug = toSlug(rawSku ?? rawName ?? '');

  const skuCandidates = Array.from(
    new Set(
      [rawSku, rawName, slug, rawSku?.toLowerCase(), rawName?.toLowerCase()]
        .filter(Boolean) as string[]
    )
  );

  if (!userEmail || skuCandidates.length === 0) {
    return err('Faltan parámetros: sku o name, y userEmail', 400, debug ? { received: candidate } : undefined);
  }

  // parse visible
  const hasVisible =
    typeof visibleIn === 'boolean' ||
    ['true', 'false', '1', '0'].includes(String(visibleIn).toLowerCase());
  const visible =
    hasVisible ? (String(visibleIn).toLowerCase() === 'true' || String(visibleIn) === '1') : undefined;

  // parse pause minutes
  let pauseMins: number | null = null;
  if (pauseIn !== undefined) {
    const n = typeof pauseIn === 'number' ? pauseIn : parseInt(String(pauseIn), 10);
    if (!Number.isFinite(n) || n < 0) {
      return err('pause_duration_minutes debe ser entero >= 0', 400, debug ? { received: pauseIn } : undefined);
    }
    pauseMins = n;
  }

  // Owner
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', String(userEmail))
    .maybeSingle();

  if (profileError || !profile?.id) {
    return err(`Usuario con email ${userEmail} no encontrado en profiles`, 404, debug ? { profileError: profileError?.message } : undefined);
  }
  const ownerId = profile.id;

  // Buscar por overlap en sku[]
  let { data: rows, error: findError } = await supabase
    .from('products')
    .select('id, name, sku, visible, scheduled_republish_at')
    .eq('user_id', ownerId)
    .overlaps('sku', skuCandidates);

  if (findError) return err('Error buscando producto', 500, debug ? { findError: findError.message } : undefined);

  // ✅ Fallback por name exacto case-insensitive SOLO si tenemos rawName
  if (rawName && (!rows || rows.length === 0)) {
    const byName = await supabase
      .from('products')
      .select('id, name, sku, visible, scheduled_republish_at')
      .eq('user_id', ownerId)
      .ilike('name', rawName); // sin % => igualdad case-insensitive
    if (byName.error) return err('Error buscando por name', 500, debug ? { error: byName.error.message } : undefined);
    rows = byName.data ?? [];
  }

  if (!rows || rows.length === 0) {
    return err(`Producto no encontrado (candidatos: ${skuCandidates.join(', ')})`, 404);
  }
  if (rows.length > 1) {
    return err('Conflicto: múltiples productos coinciden con ese SKU/Name', 409, debug ? {
      matches: rows.map(r => ({ id: r.id, name: r.name, sku: r.sku }))
    } : undefined);
  }

  const product = rows[0];

  // Build update
  const updatePayload: Record<string, any> = {};
  let successMessage = `Producto actualizado para ${userEmail}.`;

  if (typeof visible !== 'undefined') {
    updatePayload.visible = visible;
    if (visible) {
      updatePayload.scheduled_republish_at = null;
      successMessage = `Producto activado (visible=true).`;
    } else {
      if (pauseMins && pauseMins > 0) {
        const republishAt = addMinutes(new Date(), pauseMins);
        updatePayload.scheduled_republish_at = scheduleIsArray
          ? [republishAt.toISOString()]
          : republishAt.toISOString();
        successMessage = `Producto pausado ${pauseMins} min (se republicará automáticamente).`;
      } else {
        updatePayload.scheduled_republish_at = null;
        successMessage = `Producto pausado indefinidamente.`;
      }
    }
  }

  if (typeof visible === 'undefined' && pauseMins !== null) {
    if (pauseMins === 0) {
      updatePayload.scheduled_republish_at = null;
      successMessage = `Programación cancelada.`;
    } else {
      const republishAt = addMinutes(new Date(), pauseMins);
      updatePayload.scheduled_republish_at = scheduleIsArray
        ? [republishAt.toISOString()]
        : republishAt.toISOString();
      successMessage = `Re-publicación en ${pauseMins} min programada.`;
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return err('No se enviaron cambios (visible o pause_duration_minutes)', 400);
  }

  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', product.id)
    .select()
    .single();

  if (updateError) return err('Error al actualizar el producto', 500, debug ? { updateError: updateError.message } : undefined);

  return ok({ message: successMessage, product: updated }, 200);
}