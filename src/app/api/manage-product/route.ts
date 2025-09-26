
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';

export const runtime = 'nodejs'; // Forzar el entorno de ejecución a Node.js

export async function PATCH(request: NextRequest) {
  // CLAVE INCRUSTADA PARA GARANTIZAR FUNCIONAMIENTO
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  const providedApiKey = authHeader?.split('Bearer ')[1];

  if (providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const body = await request.json();
  const { sku, email, visible, pause_duration_minutes } = body;

  if (!sku || !email || visible === undefined) {
    return NextResponse.json({ error: 'Faltan los parámetros requeridos: sku, email, y visible (true/false)' }, { status: 400 });
  }
  
  const supabase = createClient();
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: `Usuario con email ${email} no encontrado` }, { status: 404 });
  }
  
  const userId = profile.id;
  
  // CORRECCIÓN: Usar .contains() porque el campo 'sku' es un array de texto (text[])
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .contains('sku', [sku]) 
    .eq('user_id', userId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: `Producto con SKU ${sku} para el usuario ${email} no encontrado. Error: ${productError?.message}` }, { status: 404 });
  }

  let updatePayload: { visible: boolean; scheduled_republish_at?: string | null };
  let successMessage = '';

  if (visible === true) {
      updatePayload = { visible: true, scheduled_republish_at: null };
      successMessage = `Producto ${sku} para ${email} ahora está visible (habilitado).`;
  } 
  else { // visible === false
      const duration = pause_duration_minutes ? parseInt(pause_duration_minutes, 10) : 0;
      if (duration > 0) {
        const republishTime = addMinutes(new Date(), duration);
        updatePayload = { visible: false, scheduled_republish_at: republishTime.toISOString() };
        successMessage = `Producto ${sku} pausado temporalmente por ${duration} minutos para ${email}. Se republicará automáticamente.`;
      } else {
        updatePayload = { visible: false, scheduled_republish_at: null };
        successMessage = `Producto ${sku} pausado indefinidamente para ${email}.`;
      }
  }

  const { error: updateError } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', product.id);

  if (updateError) {
    return NextResponse.json({ error: `Error al actualizar el producto: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: successMessage });
}
