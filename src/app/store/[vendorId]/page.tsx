import { createClient } from '@/lib/utils';
import type { Profile, Product, Catalog } from '@/types';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { StoreClientPage } from './StoreClientPage';

// This is a Server Component, responsible for fetching data.
// It's the most robust way to get data from the database.
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
    // This is a more robust way to do it.
    const { data: catalogProducts, error: productsError } = await supabase
        .from('catalog_products')
        .select(`
            catalog_id,
            product_id,
            products (
                id,
                name,
                description,
                price,
                cost,
                stock,
                visible,
                image_urls,
                created_at,
                tags,
                category,
                in_catalog,
                user_id
            )
        `)
        .in('catalog_id', publicCatalogIds)
        .eq('products.visible', true);

    if (productsError) {
        console.error('Error fetching products for catalogs:', productsError.message);
        return { profile, catalogsWithProducts: [] }; // Return what we have
    }

    // Step 4: Organize the data in a structured way for the client component.
    const catalogProductMap = new Map<string, Product[]>();

    catalogProducts?.forEach(cp => {
        if (cp.products) {
            const product = cp.products as unknown as Product; // Cast because Supabase types can be tricky
            if (!catalogProductMap.has(cp.catalog_id)) {
                catalogProductMap.set(cp.catalog_id, []);
            }
            // Add product to its catalog list, ensuring no duplicates if a product is in the list twice
            const productList = catalogProductMap.get(cp.catalog_id)!;
            if (!productList.some(p => p.id === product.id)) {
                 productList.push(product);
            }
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

export default async function StorePage({ params }: { params: { vendorId: string }}) {
  const { vendorId } = params;
  const data = await getStoreData(vendorId);

  if (!data || !data.profile) {
      notFound();
  }
  
  return <StoreClientPage profile={data.profile} catalogsWithProducts={data.catalogsWithProducts} />;
}
