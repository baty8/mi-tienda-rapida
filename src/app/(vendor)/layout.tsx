
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/ui/sidebar';
import type { Profile, Product, Catalog } from '@/types';
import { Menu, ShoppingBag } from 'lucide-react';
import { ProductProvider } from '@/context/ProductContext';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function VendorPagesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [initialCatalogs, setInitialCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    const supabase = getSupabase();
    const fetchInitialData = async () => {
      setLoading(true);
      if (!supabase) {
        setLoading(false);
        router.push('/');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        setLoading(false);
        return;
      }

      try {
        const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single();
        const productsPromise = supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        const catalogsPromise = supabase.from('catalogs').select('id, name, created_at, is_public, user_id').eq('user_id', user.id).order('name', { ascending: true });

        const [{ data: profileData, error: profileError }, { data: productData, error: productError }, { data: catalogData, error: catalogError }] = await Promise.all([profilePromise, productsPromise, catalogsPromise]);
        
        if (profileError) console.error(`No se pudo cargar el perfil: ${profileError.message}`);
        if (productError) console.error(`No se pudieron cargar los productos: ${productError.message}`);
        if (catalogError) console.error(`No se pudieron cargar los catálogos: ${catalogError.message}`);
        
        if (profileData) {
          setProfile({ ...profileData, email: user.email || null });
        }

        const formattedProducts: Product[] = (productData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          cost: p.cost || 0,
          stock: p.stock || 0,
          visible: p.visible,
          image_urls: p.image_urls && p.image_urls.length > 0 ? p.image_urls : ['https://placehold.co/600x400.png'],
          createdAt: format(new Date(p.created_at), 'yyyy-MM-dd'),
          tags: p.stock > 0 ? [] : ['Out of Stock'],
          category: 'General',
          in_catalog: p.in_catalog || false,
          user_id: p.user_id,
        }));
        setInitialProducts(formattedProducts);
        
        const catalogIds = (catalogData || []).map(c => c.id);
        if (catalogIds.length > 0) {
          const { data: catalogProductsData, error: catalogProductsError } = await supabase
              .from('catalog_products')
              .select('catalog_id, product_id')
              .in('catalog_id', catalogIds);

          if (catalogProductsError) throw new Error('Error al cargar la relación de productos y catálogos.');

          const formattedCatalogs = (catalogData || []).map(c => {
              const product_ids = catalogProductsData
                  ?.filter(cp => cp.catalog_id === c.id)
                  .map(cp => cp.product_id) || [];
              return { ...c, product_ids };
          });

          setInitialCatalogs(formattedCatalogs as Catalog[]);
        } else {
          setInitialCatalogs([]);
        }


      } catch (error: any) {
        console.error('Error al cargar datos iniciales:', error.message);
      } finally {
        setLoading(false);
      }
    };

    const authListener = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (event === 'SIGNED_IN') {
        fetchInitialData();
      }
    });

    fetchInitialData();

    return () => {
      authListener?.data.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando tu tienda...
</p>
        </div>
      </div>
    );
  }

  return (
    <ProductProvider initialProducts={initialProducts} initialCatalogs={initialCatalogs}>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-muted/40">
          <Sidebar profile={profile} className="hidden lg:block" />
          <div className="flex flex-1 flex-col">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="lg:hidden p-0 w-full max-w-sm">
                     <SheetHeader className="sr-only">
                       <SheetTitle>Menú Principal</SheetTitle>
                     </SheetHeader>
                     <Sidebar profile={profile} />
                  </SheetContent>
                </Sheet>
              </header>
              {children}
          </div>
      </div>
    </ProductProvider>
  );
}
