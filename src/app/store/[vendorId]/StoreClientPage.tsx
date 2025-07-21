'use client';
import type { Profile, Catalog, Product } from '@/types';
import * as React from 'react';
import { StoreClientContent } from '@/components/StoreClientContent';
import { createClient } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

type CatalogWithProducts = Omit<Catalog, 'product_ids' | 'user_id' | 'created_at' | 'is_public'> & {
    products: Product[];
};

type StoreClientPageProps = {
    profile: Profile;
}

const getFontFamily = (fontName: string | null | undefined): string => {
    if (!fontName) return '"PT Sans", sans-serif';
    switch (fontName) {
        case 'Roboto': return '"Roboto", sans-serif';
        case 'Lato': return '"Lato", sans-serif';
        case 'Merriweather': return '"Merriweather", serif';
        case 'Inconsolata': return '"Inconsolata", monospace';
        default: return '"PT Sans", sans-serif';
    }
};

export function StoreClientPage({ profile }: StoreClientPageProps) {
    const [catalogsWithProducts, setCatalogsWithProducts] = React.useState<CatalogWithProducts[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchStoreData = async () => {
            setLoading(true);
            setError(null);
            const supabase = createClient();

            try {
                // 1. Fetch public catalogs for the given user
                const { data: publicCatalogs, error: catalogsError } = await supabase
                    .from('catalogs')
                    .select('id, name')
                    .eq('user_id', profile.id)
                    .eq('is_public', true);

                if (catalogsError) throw new Error(`Error fetching catalogs: ${catalogsError.message}`);
                
                if (!publicCatalogs || publicCatalogs.length === 0) {
                    // No public catalogs, so we can stop here.
                    setCatalogsWithProducts([]);
                    setLoading(false);
                    return;
                }

                const publicCatalogIds = publicCatalogs.map(c => c.id);

                // 2. Fetch all visible products that belong to any of the public catalogs
                const { data: catalogProducts, error: productsError } = await supabase
                    .from('catalog_products')
                    .select('catalog_id, products(*)')
                    .in('catalog_id', publicCatalogIds)
                    .not('products', 'is', null) // Ensure product relation exists
                    .eq('products.visible', true);

                if (productsError) throw new Error(`Error fetching products: ${productsError.message}`);
                
                // 3. Organize the data into the desired structure
                const catalogProductMap = new Map<string, Product[]>();
                (catalogProducts || []).forEach(cp => {
                    // The 'products' field can be an object, not an array, from the query.
                    const product = cp.products as unknown as Product; 
                    if (product) {
                        if (!catalogProductMap.has(cp.catalog_id)) {
                            catalogProductMap.set(cp.catalog_id, []);
                        }
                        catalogProductMap.get(cp.catalog_id)?.push(product);
                    }
                });

                const finalData = publicCatalogs
                    .map(catalog => ({
                        id: catalog.id,
                        name: catalog.name,
                        products: catalogProductMap.get(catalog.id) || []
                    }))
                    .filter(c => c.products.length > 0); // Only show catalogs that have visible products

                setCatalogsWithProducts(finalData);

            } catch (err: any) {
                console.error("Failed to fetch store data:", err);
                setError("No se pudo cargar la información de la tienda. Por favor, intenta de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        if (profile.id) {
            fetchStoreData();
        }
    }, [profile.id]);

    const storeStyle = {
        '--store-bg': profile.store_bg_color || '#FFFFFF',
        '--store-primary': profile.store_primary_color || '#111827',
        '--store-accent': profile.store_accent_color || '#F3F4F6',
        '--store-font-family': getFontFamily(profile.store_font_family),
    } as React.CSSProperties;

    return (
        <div style={storeStyle} className="min-h-screen">
           <style jsx global>{`
                body { background-color: var(--store-bg); }
                .store-bg { background-color: var(--store-bg); }
                .store-text { color: var(--store-primary); font-family: var(--store-font-family); }
                .store-primary-text { color: var(--store-primary); font-family: var(--store-font-family); }
                .store-secondary-text { color: #6b7280; font-family: var(--store-font-family); }
                .store-primary-bg { background-color: var(--store-primary); color: var(--store-bg); font-family: var(--store-font-family); }
                .store-accent-bg { background-color: var(--store-accent); }
                .store-font { font-family: var(--store-font-family); }
            `}</style>
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 store-bg">
            {loading ? (
                 <div className="flex h-[60vh] w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <ShoppingBag className="h-12 w-12 animate-pulse text-[color:var(--store-primary)]" />
                        <p className="text-[color:var(--store-primary)] opacity-80 store-font">Cargando tienda...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex h-[60vh] w-full items-center justify-center text-center">
                    <p className="text-red-500 store-font">{error}</p>
                </div>
            ) : (
                <StoreClientContent 
                    profile={profile}
                    initialCatalogsWithProducts={catalogsWithProducts}
                />
            )}
            <footer className="mt-12 text-center text-sm text-gray-500 store-font">
                <p>Potenciado por VentaRapida</p>
            </footer>
          </main>
        </div>
    );
}
