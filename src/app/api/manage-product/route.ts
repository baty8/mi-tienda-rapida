
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
  const providedApiKey = authHeader?.split(' ')[1];

  // Si la clave no está configurada en el servidor O la clave proporcionada no coincide, se rechaza.
  if (!expectedApiKey || !providedApiKey || providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // Si la autorización es exitosa, se devuelve un mensaje de confirmación.
  return NextResponse.json({ message: '¡Éxito! La API de gestión de productos está funcionando y la autorización es correcta.' });
}


export async function POST(request: NextRequest) {
  // CLAVE INCRUSTADA PARA EVITAR PROBLEMAS CON VARIABLES DE ENTORNO EN VERCEL
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  const providedApiKey = authHeader?.split(' ')[1];

  // Si la clave no está configurada en el servidor O la clave proporcionada no coincide, se rechaza.
  if (!expectedApiKey || !providedApiKey || providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const { sku, action, email, pause_duration_minutes } = await request.json();

  // Ahora, 'email' es obligatorio.
  if (!sku || !action || !email) {
    return NextResponse.json({ error: 'Faltan los parámetros sku, action o email' }, { status: 400 });
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
  const filterDescription = `SKU: ${sku}, Email: ${email}`;
  
  // Construir la consulta del producto, ahora siempre filtrando por user_id
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, visible')
    .contains('sku', [sku])
    .eq('user_id', userId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: `Producto con ${filterDescription} no encontrado` }, { status: 404 });
  }

  let updatePayload: { visible: boolean; scheduled_republish_at?: string | null };
  let successMessage = '';

  switch (action) {
    case 'unpublish':
      updatePayload = { visible: false, scheduled_republish_at: null };
      successMessage = `Producto ${sku} despublicado correctamente para ${email}.`;
      break;
    case 'pause':
      const duration = pause_duration_minutes ? parseInt(pause_duration_minutes, 10) : 0;
      if (duration > 0) {
        const republishTime = addMinutes(new Date(), duration);
        updatePayload = { visible: false, scheduled_republish_at: republishTime.toISOString() };
        successMessage = `Producto ${sku} pausado por ${duration} minutos para ${email}. Se republicará automáticamente a las ${republishTime.toLocaleTimeString()}.`;
      } else {
        updatePayload = { visible: false, scheduled_republish_at: null };
        successMessage = `Producto ${sku} pausado (despublicado) indefinidamente para ${email}.`;
      }
      break;
    case 'republish':
      updatePayload = { visible: true, scheduled_republish_at: null };
      successMessage = `Producto ${sku} republicado correctamente para ${email}.`;
      break;
    default:
      return NextResponse.json({ error: `Acción '${action}' no válida. Las acciones válidas son: unpublish, pause, republish.` }, { status: 400 });
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
