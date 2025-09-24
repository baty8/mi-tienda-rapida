
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Define el umbral para considerar el stock como bajo.
const LOW_STOCK_THRESHOLD = 10;

/**
 * Método GET para obtener productos con bajo stock.
 * Ideal para alertas en n8n o sistemas de monitoreo.
 */
export async function GET(request: NextRequest) {
  // CLAVE INCRUSTADA PARA GARANTIZAR FUNCIONAMIENTO
  const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
  
  const authHeader = request.headers.get('authorization');
  const providedApiKey = authHeader?.split('Bearer ')[1];

  if (!expectedApiKey || !providedApiKey || providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createClient();

  // Consulta para obtener productos con stock bajo (mayor que 0 y menor o igual al umbral)
  const { data: lowStockProducts, error } = await supabase
    .from('products')
    .select('name, sku, stock')
    .gt('stock', 0)
    .lte('stock', LOW_STOCK_THRESHOLD)
    .order('stock', { ascending: true });
    
  if (error) {
    return NextResponse.json({ error: `Error al consultar productos: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json(lowStockProducts);
}
