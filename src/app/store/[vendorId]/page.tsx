
import { createClient } from '@/lib/supabase/server';
import type { Profile, Product, Catalog } from '@/types';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { StoreClientContent } from '@/components/StoreClientContent';

type CatalogWithProducts = Omit<Catalog, 'product_ids' | 'user_id' | 'created_at' | 'is_public'> & {
    products: Product[];
};

async function getStoreData(vendorId: string): Promise<{ profile: Profile; catalogsWithProducts: CatalogWithProducts[] } | null> {
    const supabase = createClient();

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vendorId)
        .single();
    
    if (profileError || !profileData) {
        console.error('Error fetching profile or profile not found:', profileError?.message);
        return null;
    }

    const { data: publicCatalogs, error: catalogsError } = await supabase
      .from('catalogs')
      .select('id, name')
      .eq('user_id', vendorId)
      .eq('is_public', true);
    
    if (catalogsError) {
      console.error('Error fetching public catalogs:', catalogsError.message);
      return { profile: profileData, catalogsWithProducts: [] };
    }

    if (!publicCatalogs || publicCatalogs.length === 0) {
      return { profile: profileData, catalogsWithProducts: [] };
    }

    const publicCatalogIds = publicCatalogs.map(c => c.id);

    const { data: catalogProducts, error: productsError } = await supabase
        .from('catalog_products')
        .select('catalog_id, products(*)')
        .in('catalog_id', publicCatalogIds)
        .not('products', 'is', null)
        .eq('products.visible', true);
    
    if (productsError) {
        console.error(`Error fetching products for catalogs:`, productsError.message);
    }

    const catalogProductMap = new Map<string, Product[]>();
    (catalogProducts || []).forEach(cp => {
        const product = cp.products as unknown as Product;
        if (product) {
            if (!catalogProductMap.has(cp.catalog_id)) {
                catalogProductMap.set(cp.catalog_id, []);
            }
            const formattedProduct: Product = {
                ...product,
                image_urls: (product.image_urls && product.image_urls.length > 0) ? product.image_urls : ['https://placehold.co/600x400.png']
            };
            catalogProductMap.get(cp.catalog_id)?.push(formattedProduct);
        }
    });

    const finalData: CatalogWithProducts[] = publicCatalogs
        .map(catalog => ({
            id: catalog.id,
            name: catalog.name,
            products: catalogProductMap.get(catalog.id) || []
        }))
        .filter(c => c.products.length > 0);

    return {
        profile: profileData,
        catalogsWithProducts: finalData
    };
}

export default async function StorePage({ params }: { params: { vendorId: string }}) {
  const { vendorId } = params;
  const storeData = await getStoreData(vendorId);

  if (!storeData || !storeData.profile) {
      notFound();
  }
  
  return <StoreClientContent profile={storeData.profile} initialCatalogsWithProducts={storeData.catalogsWithProducts} />;
}
