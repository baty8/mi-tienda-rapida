
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';

export const runtime = 'nodejs'; // Forzar el entorno de ejecución a Node.js

/**
 * Método GET para verificar la conectividad y autorización de la API.
 */
export async function GET(request: NextRequest) {
  // CLAVE INCRUSTADA PARA EVITAR PROBLEMAS CON VARIABLES DE ENTORNO EN VERCEL
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Encabezado de autorización ausente o malformado' }, { status: 401 });
  }
  const providedApiKey = authHeader.substring(7); // Extrae la clave después de "Bearer "

  if (providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // Si la autorización es exitosa, se devuelve un mensaje de confirmación.
  return NextResponse.json({ message: '¡Éxito! La API de gestión de productos está funcionando y la autorización es correcta.' });
}


export async function POST(request: NextRequest) {
  // CLAVE INCRUSTADA PARA EVITAR PROBLEMAS CON VARIABLES DE ENTORNO EN VERCEL
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Encabezado de autorización ausente o malformado' }, { status: 401 });
  }
  const providedApiKey = authHeader.substring(7);

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
  
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, visible')
    .contains('sku', [sku])
    .eq('user_id', userId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: `Producto con SKU ${sku} para el usuario ${email} no encontrado` }, { status: 404 });
  }

  let updatePayload: { visible: boolean; scheduled_republish_at?: string | null };
  let successMessage = '';

  // Si visible es true, siempre hacemos visible el producto y limpiamos cualquier republicación programada.
  if (visible === true) {
      updatePayload = { visible: true, scheduled_republish_at: null };
      successMessage = `Producto ${sku} para ${email} ahora está visible.`;
  } 
  // Si visible es false, comprobamos si es una pausa temporal o indefinida.
  else if (visible === false) {
      const duration = pause_duration_minutes ? parseInt(pause_duration_minutes, 10) : 0;
      if (duration > 0) {
        const republishTime = addMinutes(new Date(), duration);
        updatePayload = { visible: false, scheduled_republish_at: republishTime.toISOString() };
        successMessage = `Producto ${sku} pausado por ${duration} minutos para ${email}. Se republicará automáticamente a las ${republishTime.toLocaleTimeString()}.`;
      } else {
        updatePayload = { visible: false, scheduled_republish_at: null };
        successMessage = `Producto ${sku} pausado (oculto) indefinidamente para ${email}.`;
      }
  } else {
      return NextResponse.json({ error: `El valor de 'visible' no es válido.` }, { status: 400 });
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

