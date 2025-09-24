
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Define el umbral para considerar el stock como bajo.
const LOW_STOCK_THRESHOLD = 10;

/**
 * Método GET para obtener productos con bajo stock.
 * Acepta un parámetro opcional `userEmail` para filtrar por vendedor.
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
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('userEmail');
  let userId: string | null = null;
  let filterDescription = 'global';

  if (userEmail) {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
    
    if (profileError || !profile) {
        return NextResponse.json({ error: `Usuario con email ${userEmail} no encontrado` }, { status: 404 });
    }
    userId = profile.id;
    filterDescription = `userEmail: ${userEmail}`;
  }


  let query = supabase
    .from('products')
    .select('name, sku, stock')
    .gt('stock', 0)
    .lte('stock', LOW_STOCK_THRESHOLD)
    .order('stock', { ascending: true });

  // Si se encontró un userId a partir del email, se añade el filtro a la consulta.
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: lowStockProducts, error } = await query;
    
  if (error) {
    return NextResponse.json({ error: `Error al consultar productos: ${error.message}` }, { status: 500 });
  }

  const response = {
    count: lowStockProducts.length,
    filter: filterDescription,
    products: lowStockProducts,
    generated_at: new Date().toISOString()
  };

  return NextResponse.json(response);
}
