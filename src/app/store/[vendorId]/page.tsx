
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import type { Product, Catalog, Profile } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type VendorFullProfile = Profile & {
    store_bg_color?: string;
    store_primary_color?: string;
    store_accent_color?: string;
};

export default function StorePage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorFullProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!vendorId) {
        setLoading(false);
        setError("No se proporcionó un ID de vendedor.");
        return;
    };

    const fetchStoreData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch vendor info (including style colors)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', vendorId)
          .single();

        if (profileError || !profileData) {
          throw new Error('No se pudo encontrar la tienda de este vendedor.');
        }
        setVendor(profileData as VendorFullProfile);
        
        // 2. Fetch all public catalogs for this vendor
        const { data: catalogData, error: catalogError } = await supabase
          .from('catalogs')
          .select('id, name')
          .eq('user_id', vendorId)
          .eq('is_public', true);
        
        if (catalogError) throw new Error('Error al cargar los catálogos.');
        setCatalogs(catalogData as Catalog[]);

        const catalogIds = catalogData.map(c => c.id);

        if (catalogIds.length > 0) {
            // 3. Fetch all products linked to these public catalogs
            const { data: catalogProductsData, error: catalogProductsError } = await supabase
                .from('catalog_products')
                .select('product_id')
                .in('catalog_id', catalogIds);

            if (catalogProductsError) throw new Error('Error al cargar productos del catálogo.');
            
            const productIds = [...new Set(catalogProductsData.map(p => p.product_id))];

            if (productIds.length > 0) {
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', productIds)
                    .eq('visible', true);

                if (productError) throw new Error('No se pudieron cargar los productos.');

                const formattedProducts = productData.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  description: p.description || '',
                  price: p.price,
                  cost: 0,
                  stock: p.stock || 0,
                  visible: p.visible,
                  image: p.image_url || 'https://placehold.co/300x200.png',
                  createdAt: '',
                  tags: [],
                  category: 'General',
                  in_catalog: true, 
                  user_id: p.user_id,
                  catalog_ids: catalogProductsData.filter(cp => cp.product_id === p.id).map(cp => cp.catalog_id)
                }));
                setProducts(formattedProducts);
            } else {
                setProducts([]);
            }
        } else {
            setProducts([]);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [vendorId]);

  const getWhatsAppLink = (product: Product) => {
    const sellerPhoneNumber = vendor?.phone || '';
    if (!sellerPhoneNumber) return '#';
    const message = `Hola, estoy interesado en el producto "${product.name}". ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCatalog = activeTab === 'all' || (product as any).catalog_ids.includes(activeTab);
      return matchesSearch && matchesCatalog;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
        <ShoppingBag className="h-16 w-16 animate-bounce text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando tienda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold">¡Ups! Algo salió mal</h2>
        <p className="mt-2 text-center text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">Intentar de nuevo</Button>
      </div>
    );
  }

  const showEmptyState = filteredProducts.length === 0;

  const storeStyle = {
    '--store-bg': vendor?.store_bg_color || '#FFFFFF',
    '--store-primary': vendor?.store_primary_color || '#111827',
    '--store-accent': vendor?.store_accent_color || '#F3F4F6',
    '--store-text-on-primary': '#FFFFFF', // Assuming white text on primary color for contrast
    '--store-text-on-bg': vendor?.store_primary_color || '#111827'
  } as React.CSSProperties;


  return (
    <div style={storeStyle} className="min-h-screen font-sans" >
        <style jsx global>{`
            .store-bg { background-color: var(--store-bg); }
            .store-text { color: var(--store-text-on-bg); }
            .store-primary-text { color: var(--store-primary); }
            .store-primary-bg { background-color: var(--store-primary); color: var(--store-text-on-primary) }
            .store-accent-bg { background-color: var(--store-accent); }
            .store-border-primary { border-color: var(--store-primary); }
        `}</style>
        <main className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 store-bg">
            <header className="mb-8 text-center">
                <Avatar className="mx-auto h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={vendor?.avatar_url || 'https://placehold.co/100x100.png'} alt={vendor?.name || 'Vendedor'} data-ai-hint="logo business" />
                    <AvatarFallback>{vendor?.name?.charAt(0) || 'V'}</AvatarFallback>
                </Avatar>
                <h1 className="mt-4 text-4xl font-bold store-primary-text">{vendor?.name || 'Nuestra Tienda'}</h1>
            </header>

            <div className="sticky top-0 z-10 py-4 store-bg">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Buscar producto..." 
                        className="pl-10 w-full" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="overflow-x-auto whitespace-nowrap justify-start">
                        <TabsTrigger value="all">Todos los Productos</TabsTrigger>
                        {catalogs.map(catalog => (
                            <TabsTrigger key={catalog.id} value={catalog.id}>{catalog.name}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>


            {!showEmptyState && (
                <div className="space-y-6 mt-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="transform transition-transform duration-300 hover:scale-[1.02]">
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg store-accent-bg">
                        <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <Image
                            src={product.image}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="h-full w-full object-cover"
                            data-ai-hint="product image"
                            />
                        </div>
                        <div className="flex flex-col p-6 md:col-span-2">
                            <h2 className="text-2xl font-bold store-text">{product.name}</h2>
                            {product.description && <p className="mt-2 text-gray-600">{product.description}</p>}
                            <div className="mt-4 flex-grow"></div>
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <p className="text-3xl font-extrabold store-primary-text">${product.price.toFixed(2)}</p>
                            <Button asChild size="lg" className="w-full sm:w-auto store-primary-bg hover:opacity-90" disabled={!vendor?.phone}>
                                <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Consultar
                                </a>
                            </Button>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
            
            {showEmptyState && (
                <div className="py-16 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold store-text">No se encontraron productos</h3>
                    <p className="mt-2 text-gray-500">Intenta cambiar los filtros o el término de búsqueda.</p>
                </div>
            )}

            <footer className="mt-12 text-center text-sm text-gray-500">
            <p>Potenciado por VentaRapida</p>
            </footer>
        </main>
    </div>
  );
}

    