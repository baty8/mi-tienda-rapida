
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';

export const runtime = 'nodejs'; // Forzar el entorno de ejecución a Node.js

export async function PATCH(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // CLAVE INCRUSTADA PARA GARANTIZAR FUNCIONAMIENTO
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  const providedApiKey = authHeader?.split('Bearer ')[1];

  if (providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const body = await request.json();
  const { userEmail, sku, visible, pause_duration_minutes } = body;

  if (!sku || !userEmail || visible === undefined) {
    return NextResponse.json({ error: 'Faltan los parámetros requeridos: sku, userEmail, y visible (true/false)' }, { status: 400 });
  }
  
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: `Usuario con email ${userEmail} no encontrado` }, { status: 404 });
  }
  
  const userId = profile.id;
  
  const { data: products, error: productError } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('user_id', userId)
    .contains('sku', [sku.trim()]);

  if (productError) {
      return NextResponse.json({ error: `Error buscando el producto: ${productError.message}` }, { status: 500 });
  }
  if (!products || products.length === 0) {
    return NextResponse.json({ error: `Producto con SKU '${sku}' para el usuario '${userEmail}' no encontrado.` }, { status: 404 });
  }
  if (products.length > 1) {
    return NextResponse.json({ error: `Conflicto: Múltiples productos encontrados con SKU '${sku}' para el usuario '${userEmail}'. El SKU debe ser único por usuario.` }, { status: 409 });
  }

  const product = products[0];

  let updatePayload: { visible: boolean; scheduled_republish_at?: string | null };
  let successMessage = '';

  if (visible === true) {
      updatePayload = { visible: true, scheduled_republish_at: null };
      successMessage = `Producto ${sku} para ${userEmail} ahora está visible (habilitado).`;
  } 
  else { // visible === false
      const duration = pause_duration_minutes ? parseInt(pause_duration_minutes, 10) : 0;
      if (duration > 0) {
        const republishTime = addMinutes(new Date(), duration);
        updatePayload = { visible: false, scheduled_republish_at: republishTime.toISOString() };
        successMessage = `Producto ${sku} pausado temporalmente por ${duration} minutos para ${userEmail}. Se republicará automáticamente.`;
      } else {
        updatePayload = { visible: false, scheduled_republish_at: null };
        successMessage = `Producto ${sku} pausado indefinidamente para ${userEmail}.`;
      }
  }

  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update(updatePayload)
    .eq('id', product.id);

  if (updateError) {
    return NextResponse.json({ error: `Error al actualizar el producto: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: successMessage });
}
