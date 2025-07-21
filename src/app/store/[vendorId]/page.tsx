
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

// Esta es ahora una función de servidor asíncrona.
async function getStoreData(vendorId: string) {
    const supabase = createClient();

    // Las consultas se ejecutan en paralelo para máxima eficiencia
    const [profileRes, catalogsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', vendorId).single(),
        supabase.from('catalogs').select('*, products!inner(*)') // Usamos !inner para asegurar que solo vengan catálogos con productos
            .eq('user_id', vendorId)
            .eq('is_public', true)
            .eq('products.visible', true)
    ]);

    if (profileRes.error || !profileRes.data) {
        return { error: 'No se pudo encontrar la tienda de este vendedor.' };
    }

    if (catalogsRes.error) {
        console.error("Error fetching catalogs with products:", catalogsRes.error);
        return { error: 'Hubo un problema al cargar los catálogos.' };
    }
    
    // Extraer todos los productos únicos de los catálogos cargados para la vista "Todos los Productos"
    const allProducts = catalogsRes.data.reduce((acc: Product[], catalog) => {
        (catalog.products || []).forEach((product: Product) => {
            // Añadir solo si el producto no está ya en la lista
            if (!acc.some(p => p.id === product.id)) {
                acc.push(product);
            }
        });
        return acc;
    }, [] as Product[]);


    return {
        vendor: profileRes.data as VendorFullProfile,
        catalogs: catalogsRes.data as CatalogWithProducts[],
        allProducts: allProducts,
    };
}


// Este es el componente de servidor principal
export default async function StorePage({ params }: { params: { vendorId: string } }) {
  const { vendorId } = params;
  const { error, vendor, catalogs, allProducts } = await getStoreData(vendorId);

  // Pasamos los datos obtenidos del servidor a un componente de cliente que maneja la interactividad.
  return (
    <StorePageComponent 
        error={error} 
        vendor={vendor} 
        catalogs={catalogs} 
        allProducts={allProducts}
    />
  );
}
