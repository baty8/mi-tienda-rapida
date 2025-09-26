
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Método PATCH para ajustar el stock de un producto específico.
 * Se utiliza para registrar ventas offline o ajustes manuales de inventario.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { sku: string } }
) {
    // CLAVE INCRUSTADA PARA GARANTIZAR FUNCIONAMIENTO
    const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
    
    const authHeader = request.headers.get('authorization');
    const providedApiKey = authHeader?.split('Bearer ')[1];

    if (providedApiKey !== expectedApiKey) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { sku } = params;
    if (!sku) {
        return NextResponse.json({ error: 'Falta el SKU del producto en la URL' }, { status: 400 });
    }

    const body = await request.json();
    const { email, adjustment } = body;

    if (!email || adjustment === undefined) {
        return NextResponse.json({ error: 'Faltan los parámetros requeridos: email y adjustment' }, { status: 400 });
    }

    const adjustmentValue = parseInt(adjustment, 10);
    if (isNaN(adjustmentValue)) {
        return NextResponse.json({ error: 'El valor de "adjustment" debe ser un número entero' }, { status: 400 });
    }

    const supabase = createClient();

    // 1. Encontrar al usuario por su email
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: `Usuario con email ${email} no encontrado` }, { status: 404 });
    }

    const userId = profile.id;

    // 2. Encontrar el producto por SKU y usuario
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock')
        .contains('sku', [sku])
        .eq('user_id', userId)
        .single();

    if (productError || !product) {
        return NextResponse.json({ error: `Producto con SKU ${sku} para el usuario ${email} no encontrado` }, { status: 404 });
    }

    // 3. Calcular el nuevo stock y actualizar
    const newStock = product.stock + adjustmentValue;

    if (newStock < 0) {
        return NextResponse.json({ error: `El ajuste resultaría en stock negativo (${newStock}). Stock actual: ${product.stock}.` }, { status: 409 });
    }

    const { data: updatedProduct, error: updateError } = await supabase
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
