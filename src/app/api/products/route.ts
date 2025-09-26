
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const generateSkuFromName = (name: string): string => {
    return name.trim();
};

/**
 * Método POST para crear o actualizar (Upsert) un producto.
 * Genera un SKU a partir del nombre y lo usa para buscar el producto en el campo 'sku' (array).
 * - Si existe, lo actualiza.
 * - Si no existe, lo crea.
 * Este endpoint es ideal para integraciones con n8n y Google Sheets.
 */
export async function POST(request: NextRequest) {
    // CLAVE INCRUSTADA PARA GARANTIZAR FUNCIONAMIENTO
    const expectedApiKey = 'ey_tienda_sk_prod_9f8e7d6c5b4a3210';
    
    const authHeader = request.headers.get('authorization');
    const providedApiKey = authHeader?.split('Bearer ')[1];

    if (providedApiKey !== expectedApiKey) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, price, cost, stock, description, visible } = body;

    // Validaciones básicas
    if (!email || !name || price === undefined) {
        return NextResponse.json({ error: 'Faltan parámetros requeridos: email, name, y price' }, { status: 400 });
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
    const generatedSku = generateSkuFromName(name);
    
    // 2. Construir el objeto del producto con los datos recibidos
    const productPayload: any = {
        name,
        price: parseFloat(price),
        sku: [generatedSku], // El SKU se guarda como un array
        user_id: userId,
    };
    if (cost !== undefined) productPayload.cost = parseFloat(cost);
    if (stock !== undefined) productPayload.stock = parseInt(stock, 10);
    if (description !== undefined) productPayload.description = description;
    if (visible !== undefined) productPayload.visible = visible;
    if (productPayload.image_urls === undefined) {
        productPayload.image_urls = ['https://placehold.co/600x400.png'];
    }

    // 3. Buscar un producto existente por el SKU en el array 'sku'
    const { data: existingProducts, error: findError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', userId)
        .contains('sku', [generatedSku]);

    if (findError) {
        return NextResponse.json({ error: `Error buscando el producto: ${findError.message}` }, { status: 500 });
    }

    if (existingProducts && existingProducts.length > 1) {
        return NextResponse.json({ error: `Conflicto: Múltiples productos encontrados con SKU '${generatedSku}'. El SKU debe ser único.` }, { status: 409 });
    }
    
    const existingProduct = existingProducts?.[0];

    if (existingProduct) {
        // --- ACTUALIZAR PRODUCTO ---
        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update(productPayload)
            .eq('id', existingProduct.id)
            .select()
            .single();
        
        if (updateError) {
            return NextResponse.json({ error: `Error al actualizar el producto: ${updateError.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'Producto actualizado correctamente.', product: updatedProduct }, { status: 200 });

    } else {
        // --- CREAR PRODUCTO ---
        const { data: newProduct, error: createError } = await supabase
            .from('products')
            .insert(productPayload)
            .select()
            .single();
        
        if (createError) {
            return NextResponse.json({ error: `Error al crear el producto: ${createError.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'Producto creado correctamente.', product: newProduct }, { status: 201 });
    }
}
