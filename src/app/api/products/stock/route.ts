
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Método PATCH para ajustar el stock de un producto específico.
 * Se utiliza para registrar ventas offline o ajustes manuales de inventario.
 */
export async function PATCH(request: NextRequest) {
    // CLAVE INCRUSTADA PARA GARANTIZAR FUNCIONAMIENTO
    const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
    
    const authHeader = request.headers.get('authorization');
    const providedApiKey = authHeader?.split('Bearer ')[1];

    if (providedApiKey !== expectedApiKey) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { userEmail, sku, adjustment } = body;

    if (!userEmail || !sku || adjustment === undefined) {
        return NextResponse.json({ error: 'Faltan los parámetros requeridos en el body: userEmail, sku, y adjustment' }, { status: 400 });
    }

    const adjustmentValue = parseInt(adjustment, 10);
    if (isNaN(adjustmentValue)) {
        return NextResponse.json({ error: 'El valor de "adjustment" debe ser un número entero' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Encontrar al usuario por su email
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: `Usuario con email ${userEmail} no encontrado` }, { status: 404 });
    }

    const userId = profile.id;

    // 2. Buscar el producto por SKU en el array 'sku'.
    const { data: products, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, stock, name')
        .eq('user_id', userId)
        .contains('sku', [sku.trim()]);

    if (productError) {
        return NextResponse.json({ error: `Error buscando el producto: ${productError.message}` }, { status: 500 });
    }
    if (!products || products.length === 0) {
        return NextResponse.json({ error: `Producto con SKU '${sku}' para el usuario '${userEmail}' no encontrado.` }, { status: 404 });
    }
    if (products.length > 1) {
        return NextResponse.json({ error: `Conflicto: Múltiples productos encontrados con SKU '${sku}' para el usuario '${userEmail}'. El SKU debe ser único.` }, { status: 409 });
    }

    const product = products[0];

    // 3. Calcular el nuevo stock y actualizar
    const newStock = product.stock + adjustmentValue;

    if (newStock < 0) {
        return NextResponse.json({ error: `El ajuste resultaría en stock negativo (${newStock}). Stock actual: ${product.stock}.` }, { status: 409 });
    }

    const { data: updatedProduct, error: updateError } = await supabaseAdmin
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id)
        .select('name, sku, stock')
        .single();

    if (updateError) {
        return NextResponse.json({ error: `Error al actualizar el stock: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({
        message: 'Stock actualizado correctamente.',
        product: updatedProduct
    });
}
