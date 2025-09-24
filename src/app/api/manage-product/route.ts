
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';

export const runtime = 'nodejs'; // Forzar el entorno de ejecución a Node.js

export async function POST(request: NextRequest) {
  // Clave de API interna incrustada directamente para evitar problemas de entorno.
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  const providedApiKey = authHeader?.split(' ')[1];

  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const { sku, action, pause_duration_minutes } = await request.json();

  if (!sku || !action) {
    return NextResponse.json({ error: 'Faltan los parámetros sku o action' }, { status: 400 });
  }

  const supabase = createClient();
  
  // Buscar producto por SKU dentro del array
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, visible')
    .contains('sku', [sku]) 
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: `Producto con SKU ${sku} no encontrado` }, { status: 404 });
  }

  let updatePayload: { visible: boolean; scheduled_republish_at?: string[] | null };
  let successMessage = '';

  switch (action) {
    case 'unpublish':
      updatePayload = { visible: false, scheduled_republish_at: null };
      successMessage = `Producto ${sku} despublicado correctamente.`;
      break;
    case 'pause':
      const duration = pause_duration_minutes ? parseInt(pause_duration_minutes, 10) : 0;
      if (duration > 0) {
        const republishTime = addMinutes(new Date(), duration);
        updatePayload = { visible: false, scheduled_republish_at: [republishTime.toISOString()] };
        successMessage = `Producto ${sku} pausado por ${duration} minutos. Se republicará automáticamente a las ${republishTime.toLocaleTimeString()}.`;
      } else {
        updatePayload = { visible: false, scheduled_republish_at: null };
        successMessage = `Producto ${sku} pausado (despublicado) indefinidamente.`;
      }
      break;
    case 'republish':
      updatePayload = { visible: true, scheduled_republish_at: null };
      successMessage = `Producto ${sku} republicado correctamente.`;
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
