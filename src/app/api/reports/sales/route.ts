
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Método GET para obtener un informe financiero general del inventario.
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

  // Obtener todos los productos para calcular los totales
  const { data: products, error } = await supabase
    .from('products')
    .select('cost, price, stock');

  if (error) {
    return NextResponse.json({ error: `Error al obtener los productos: ${error.message}` }, { status: 500 });
  }

  if (!products) {
    return NextResponse.json({
        total_inventory_cost: 0,
        total_potential_revenue: 0,
        total_potential_profit: 0,
        product_count: 0,
    });
  }
  
  // Calcular métricas financieras
  const totalInventoryCost = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  const totalPotentialRevenue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const totalPotentialProfit = totalPotentialRevenue - totalInventoryCost;
  
  const report = {
    total_inventory_cost: parseFloat(totalInventoryCost.toFixed(2)),
    total_potential_revenue: parseFloat(totalPotentialRevenue.toFixed(2)),
    total_potential_profit: parseFloat(totalPotentialProfit.toFixed(2)),
    product_count: products.length,
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json(report);
}
