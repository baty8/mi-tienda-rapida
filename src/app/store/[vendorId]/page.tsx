
import { createClient } from '@/lib/utils';
import type { Profile, Product, Catalog } from '@/types';
import { notFound } from 'next/navigation';
import { StoreClientContent } from '@/components/StoreClientContent';
import * as React from 'react';

// This is a Server Component, responsible for fetching data.
// It's the most robust way to get data from the database.

// We create a specific type for the data structure we will pass to the client
type CatalogWithProducts = Omit<Catalog, 'product_ids' | 'user_id' | 'created_at' | 'is_public'> & {
    products: Product[];
};

type StorePageData = {
    profile: Profile;
    catalogsWithProducts: CatalogWithProducts[];
};

async function getStoreData(vendorId: string): Promise<StorePageData | null> {
    const supabase = createClient();

    // Step 1: Fetch the vendor's profile.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vendorId)
        .single();
    
    if (profileError || !profile) {
        console.error('Error fetching profile or profile not found:', profileError?.message);
        return null; // Return null if profile doesn't exist.
    }

    // Step 2: Fetch all public catalogs for this vendor.
    const { data: publicCatalogs, error: catalogsError } = await supabase
        .from('catalogs')
        .select('id, name')
        .eq('user_id', vendorId)
        .eq('is_public', true);
    
    if (catalogsError) {
        console.error('Error fetching public catalogs:', catalogsError.message);
        return { profile, catalogsWithProducts: [] }; // Return what we have
    }

    if (!publicCatalogs || publicCatalogs.length === 0) {
        return { profile, catalogsWithProducts: [] }; // No public catalogs to show
    }

    const publicCatalogIds = publicCatalogs.map(c => c.id);

    // Step 3: Fetch all products that are visible AND belong to any of the public catalogs.
    const { data: catalogProducts, error: productsError } = await supabase
        .from('catalog_products')
        .select('product_id, products(*)') // Efficiently join and fetch product details
        .in('catalog_id', publicCatalogIds)
        .eq('products.visible', true);

    if (productsError) {
        console.error('Error fetching products for catalogs:', productsError.message);
        return { profile, catalogsWithProducts: [] }; // Return what we have
    }

    // Step 4: Organize the data in a structured way for the client component.
    const productsById = new Map();
    const catalogProductMap = new Map<string, Product[]>();

    catalogProducts?.forEach(cp => {
        if (cp.products) {
            // Add product to its catalog list
            const product = cp.products as Product;
            if (!catalogProductMap.has(cp.catalog_id)) {
                catalogProductMap.set(cp.catalog_id, []);
            }
            catalogProductMap.get(cp.catalog_id)?.push(product);
        }
    });

    const catalogsWithProducts = publicCatalogs
        .map(catalog => ({
            id: catalog.id,
            name: catalog.name,
            products: catalogProductMap.get(catalog.id) || []
        }))
        .filter(c => c.products.length > 0); // Only include catalogs that have visible products
        

    return { profile, catalogsWithProducts };
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

export default async function StorePage({ params }: { params: { vendorId: string }}) {
  const { vendorId } = params;

  // Fetch data on the server. If this fails, the whole page build fails,
  // but our logic above is simple and robust.
  const data = await getStoreData(vendorId);

  if (!data || !data.profile) {
      notFound(); // Triggers the not-found page if the vendor doesn't exist
  }

  const { profile, catalogsWithProducts } = data;

  // Set up CSS variables for styling, passed to the client.
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
        {/* Pass the server-fetched data as props to the Client Component */}
        <StoreClientContent 
            profile={profile}
            initialCatalogsWithProducts={catalogsWithProducts}
        />
        <footer className="mt-12 text-center text-sm text-gray-500 store-font">
            <p>Potenciado por VentaRapida</p>
        </footer>
      </main>
    </div>
  );
}
