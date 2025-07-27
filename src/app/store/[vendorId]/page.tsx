
import { createClient } from '@/lib/supabase/server';
import type { Profile, Product, Catalog } from '@/types';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { StoreClientContent } from '@/components/StoreClientContent';
import type { Metadata } from 'next';

type CatalogWithProducts = Omit<Catalog, 'product_ids' | 'user_id' | 'created_at' | 'is_public'> & {
    products: Product[];
};

// Let Next.js infer the props type for dynamic pages
type StorePageProps = {
  params: { vendorId: string };
};

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', params.vendorId)
    .single();

  if (!profile) {
    return {
      title: 'Tienda no encontrada',
    };
  }

  return {
    title: profile.name || 'Tienda',
    icons: {
        // Usa el avatar del vendedor como favicon, con un fallback si no existe.
        icon: profile.avatar_url || "/favicon.ico",
    }
  };
}

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
        .select('catalog_id, products!inner(*)')
        .in('catalog_id', publicCatalogIds)
        .eq('products.visible', true);
    
    if (productsError) {
        console.error(`Error fetching products for catalogs:`, productsError.message);
    }

    const catalogProductMap = new Map<string, Product[]>();
    (catalogProducts || []).forEach(cp => {
        if (cp.products) {
            const product = cp.products as unknown as Product; // Cast to unknown first
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
        profile: profileData as Profile,
        catalogsWithProducts: finalData
    };
}

export default async function StorePage({ params }: StorePageProps) {
  const { vendorId } = params;
  const storeData = await getStoreData(vendorId);

  if (!storeData) {
      notFound();
  }
  
  return <StoreClientContent profile={storeData.profile} initialCatalogsWithProducts={storeData.catalogsWithProducts} />;
}
