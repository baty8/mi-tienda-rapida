
import type { Product, Catalog, Profile } from '@/types';
import { createClient } from '@/lib/utils';
import { StorePageComponent } from '@/components/StorePageComponent';

type VendorFullProfile = Profile & {
    store_bg_color?: string;
    store_primary_color?: string;
    store_accent_color?: string;
    store_font_family?: string;
};

type CatalogWithProducts = Catalog & {
    products: Product[];
}

async function getStoreData(vendorId: string) {
    const supabase = createClient();

    // 1. Fetch vendor profile and public products in parallel
    const [profileResult, productsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', vendorId).single(),
        supabase
            .from('products')
            .select('*, catalogs!inner(id, name)')
            .eq('user_id', vendorId)
            .eq('visible', true)
            .eq('catalogs.is_public', true)
    ]);
    
    const { data: vendor, error: profileError } = profileResult;
    if (profileError || !vendor) {
        console.error("Profile fetch error:", profileError);
        return { error: 'No se pudo encontrar la tienda de este vendedor.' };
    }

    const { data: publicProducts, error: productsError } = productsResult;
    if (productsError) {
        console.error("Products fetch error:", productsError);
        return { error: 'Hubo un problema al cargar los productos.' };
    }

    // 2. Process the fetched data
    const allProducts: Product[] = publicProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        cost: p.cost || 0,
        stock: p.stock || 0,
        visible: p.visible,
        image_urls: (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) ? p.image_urls : ['https://placehold.co/600x400.png'],
        createdAt: p.created_at,
        tags: p.stock > 0 ? [] : ['Out of Stock'],
        category: 'General',
        in_catalog: true,
        user_id: p.user_id,
    }));
    
    const catalogsMap = new Map<string, CatalogWithProducts>();

    for (const product of publicProducts) {
        // Handle cases where a product is in multiple catalogs
        if (Array.isArray(product.catalogs)) {
             for (const catalog of product.catalogs) {
                if (!catalogsMap.has(catalog.id)) {
                    catalogsMap.set(catalog.id, {
                        id: catalog.id,
                        name: catalog.name,
                        user_id: vendorId,
                        created_at: '', // Not needed
                        is_public: true,
                        product_ids: [], // Not needed
                        products: [],
                    });
                }
                const formattedProduct = allProducts.find(p => p.id === product.id);
                if(formattedProduct && !catalogsMap.get(catalog.id)!.products.some(p => p.id === formattedProduct.id)) {
                    catalogsMap.get(catalog.id)!.products.push(formattedProduct);
                }
            }
        } else if (product.catalogs) { // Handle case where product.catalogs is a single object
             const catalog = product.catalogs;
             if (!catalogsMap.has(catalog.id)) {
                    catalogsMap.set(catalog.id, {
                        id: catalog.id,
                        name: catalog.name,
                        user_id: vendorId,
                        created_at: '', // Not needed
                        is_public: true,
                        product_ids: [], // Not needed
                        products: [],
                    });
                }
                const formattedProduct = allProducts.find(p => p.id === product.id);
                 if(formattedProduct && !catalogsMap.get(catalog.id)!.products.some(p => p.id === formattedProduct.id)) {
                    catalogsMap.get(catalog.id)!.products.push(formattedProduct);
                }
        }
    }
    
    const catalogs = Array.from(catalogsMap.values());

    return {
        vendor: vendor as VendorFullProfile,
        catalogs: catalogs,
        allProducts: allProducts,
    };
}


// This is the main server component
export default async function StorePage({ params }: { params: { vendorId: string } }) {
  const { vendorId } = params;
  const { error, vendor, catalogs, allProducts } = await getStoreData(vendorId);

  // We pass the data fetched on the server to a client component that handles interactivity.
  return (
    <StorePageComponent 
        error={error} 
        vendor={vendor} 
        catalogs={catalogs} 
        allProducts={allProducts}
    />
  );
}
