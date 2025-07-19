
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/ui/sidebar';
import type { Profile, Product, Catalog } from '@/types';
import { ShoppingBag } from 'lucide-react';
import { ProductProvider } from '@/context/ProductContext';
import { format } from 'date-fns';

export default function VendorPagesLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [initialCatalogs, setInitialCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    const fetchInitialData = async (userId: string) => {
      try {
        const profilePromise = supabase.from('profiles').select('*').eq('id', userId).single();
        const productsPromise = supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        const catalogsPromise = supabase.from('catalogs').select('id, name, created_at, is_public, user_id').eq('user_id', userId).order('name', { ascending: true });

        const [{ data: profileData, error: profileError }, { data: productData, error: productError }, { data: catalogData, error: catalogError }] = await Promise.all([profilePromise, productsPromise, catalogsPromise]);

        if (profileError) throw new Error('No se pudo cargar el perfil.');
        if (productError) throw new Error('No se pudieron cargar los productos.');
        if (catalogError) throw new Error('No se pudieron cargar los catálogos.');
        
        const userEmail = (await supabase.auth.getUser()).data.user?.email || null;
        setProfile({ ...profileData, email: userEmail });

        const formattedProducts: Product[] = (productData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          cost: p.cost || 0,
          stock: p.stock || 0,
          visible: p.visible,
          image: p.image_url || 'https://placehold.co/300x200.png',
          createdAt: format(new Date(p.created_at), 'yyyy-MM-dd'),
          tags: p.stock > 0 ? [] : ['Out of Stock'],
          category: 'General',
          in_catalog: p.in_catalog || false,
          user_id: p.user_id,
        }));
        setInitialProducts(formattedProducts);
        
        const catalogIds = catalogData.map(c => c.id);
        const { data: catalogProductsData, error: catalogProductsError } = await supabase
            .from('catalog_products')
            .select('catalog_id, product_id')
            .in('catalog_id', catalogIds);

        if (catalogProductsError) throw new Error('Error al cargar la relación de productos y catálogos.');

        const formattedCatalogs = catalogData.map(c => {
            const product_ids = catalogProductsData
                ?.filter(cp => cp.catalog_id === c.id)
                .map(cp => cp.product_id) || [];
            return { ...c, product_ids };
        });

        setInitialCatalogs(formattedCatalogs as Catalog[]);

      } catch (error: any) {
        console.error('Error al cargar datos iniciales:', error.message);
        await supabase.auth.signOut();
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setLoading(true);
          fetchInitialData(session.user.id);
          // If the user is signed in and on the landing page, redirect them.
          if (pathname === '/') {
            router.push('/products');
          }
        } else {
          setLoading(false);
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando tu tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
      <ProductProvider initialProducts={initialProducts} initialCatalogs={initialCatalogs}>
        <div className="flex min-h-screen w-full bg-muted/40">
            <Sidebar profile={profile} />
            <div className="flex flex-1 flex-col">
                {children}
            </div>
        </div>
      </ProductProvider>
    </ThemeProvider>
  );
}
