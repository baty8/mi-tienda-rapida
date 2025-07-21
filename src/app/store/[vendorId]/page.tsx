
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Product, Catalog, Profile } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, AlertCircle, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Head from 'next/head';

type VendorFullProfile = Profile & {
    store_bg_color?: string;
    store_primary_color?: string;
    store_accent_color?: string;
    store_font_family?: string;
};

type CatalogWithProducts = Catalog & {
    products: Product[];
}

const fontMap: { [key: string]: string } = {
  'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
  'Inconsolata': 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
  'PT Sans': 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
};

export default function StorePage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorFullProfile | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogWithProducts[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatalogId, setActiveCatalogId] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
        // Fetch all data in parallel
        const [profileRes, catalogsRes, productsRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', vendorId).single(),
            supabase.from('catalogs').select('*, catalog_products(product_id)').eq('user_id', vendorId).eq('is_public', true),
            supabase.from('products').select('*').eq('user_id', vendorId).eq('visible', true)
        ]);

        if (profileRes.error || !profileRes.data) {
             throw new Error('No se pudo encontrar la tienda de este vendedor.');
        }
        setVendor(profileRes.data as VendorFullProfile);

        if (productsRes.error) {
            console.error("Error fetching products:", productsRes.error);
            throw new Error('Hubo un problema al cargar los productos.');
        }
        const visibleProducts = productsRes.data as Product[];
        const visibleProductsMap = new Map(visibleProducts.map(p => [p.id, p]));

        if (catalogsRes.error) {
            console.error("Error fetching catalogs:", catalogsRes.error);
            throw new Error('Hubo un problema al cargar los catálogos.');
        }
        
        const fetchedCatalogs = (catalogsRes.data || []).map(catalog => {
            const productIdsInCatalog = (catalog.catalog_products as { product_id: string }[]).map(cp => cp.product_id);
            const productsInCatalog = productIdsInCatalog
                .map(id => visibleProductsMap.get(id))
                .filter((p): p is Product => p !== undefined);
            
            return {
                ...catalog,
                products: productsInCatalog,
            };
        });

        setCatalogs(fetchedCatalogs as CatalogWithProducts[]);
        setAllProducts(visibleProducts);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [vendorId, supabase]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };


  const getWhatsAppLink = (product: Product) => {
    const sellerPhoneNumber = vendor?.phone || '';
    if (!sellerPhoneNumber) return '#';
    const message = `Hola, estoy interesado en el producto "${product.name}". ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
  const filteredProducts = allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCatalog = true;
      if (activeCatalogId !== 'all') {
          const activeCatalog = catalogs.find(c => c.id === activeCatalogId);
          matchesCatalog = activeCatalog ? activeCatalog.products.some(p => p.id === product.id) : false;
      }

      return matchesSearch && matchesCatalog;
  });

  const fontUrl = vendor?.store_font_family ? fontMap[vendor.store_font_family] : null;

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


  const storeStyle = {
    '--store-bg': vendor?.store_bg_color || '#FFFFFF',
    '--store-primary': vendor?.store_primary_color || '#111827',
    '--store-accent': vendor?.store_accent_color || '#F3F4F6',
    '--store-text-on-primary': '#FFFFFF', // Assuming white text on primary color for contrast
    '--store-text-on-bg': vendor?.store_primary_color || '#111827',
    '--store-font-family': getFontFamily(vendor?.store_font_family),
  } as React.CSSProperties;


  return (
    <div style={storeStyle} className="min-h-screen" >
        <Head>
            <title>{vendor?.name || 'Tienda'}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            {fontUrl && <link href={fontUrl} rel="stylesheet" />}
        </Head>
        <style jsx global>{`
            .store-bg { background-color: var(--store-bg); }
            .store-text { color: var(--store-text-on-bg); font-family: var(--store-font-family); }
            .store-primary-text { color: var(--store-primary); font-family: var(--store-font-family); }
            .store-primary-bg { background-color: var(--store-primary); color: var(--store-text-on-primary); font-family: var(--store-font-family); }
            .store-accent-bg { background-color: var(--store-accent); }
            .store-border-primary { border-color: var(--store-primary); }
            .store-font { font-family: var(--store-font-family); }
        `}</style>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 store-bg">
            <header className="mb-8 text-center">
                <Avatar className="mx-auto h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={vendor?.avatar_url || 'https://placehold.co/100x100.png'} alt={vendor?.name || 'Vendedor'} data-ai-hint="logo business" />
                    <AvatarFallback>{vendor?.name?.charAt(0) || 'V'}</AvatarFallback>
                </Avatar>
                <h1 className="mt-4 text-3xl sm:text-4xl font-bold store-primary-text">{vendor?.name || 'Nuestra Tienda'}</h1>
            </header>

            <div className="sticky top-0 z-10 py-4 store-bg flex flex-col sm:flex-row gap-4 mb-8">
                 <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Buscar producto..." 
                        className="pl-10 w-full store-font" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Select value={activeCatalogId} onValueChange={setActiveCatalogId}>
                    <SelectTrigger className="w-full sm:w-[250px] store-font">
                        <SelectValue placeholder="Seleccionar un catálogo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="store-font">Todos los Productos</SelectItem>
                        {catalogs.map(catalog => (
                            <SelectItem key={catalog.id} value={catalog.id} className="store-font">{catalog.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


            {!showEmptyState ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group flex transform flex-col overflow-hidden rounded-xl border border-gray-200 shadow-lg transition-transform duration-300 hover:scale-[1.02] store-accent-bg">
                        <Carousel className="w-full" opts={{ loop: true }}>
                            <CarouselContent>
                                {product.image_urls.map((url, index) => (
                                    <CarouselItem key={index} onClick={() => openModal(product)} className="cursor-pointer">
                                        <div className="aspect-square w-full overflow-hidden">
                                            <Image
                                                src={url}
                                                alt={`${product.name} - imagen ${index + 1}`}
                                                width={300}
                                                height={300}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint="product image"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                             {product.image_urls.length > 1 && (
                                <>
                                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 transform text-white bg-black/30 hover:bg-black/50 border-none" />
                                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 transform text-white bg-black/30 hover:bg-black/50 border-none" />
                                </>
                            )}
                        </Carousel>
                        <div className="flex flex-1 flex-col p-4">
                            <div className="flex-1" onClick={() => openModal(product)} >
                                <h2 className="text-lg font-bold store-text truncate cursor-pointer">{product.name}</h2>
                                {product.description && <p className="mt-1 text-sm text-gray-600 line-clamp-2 store-font">{product.description}</p>}
                            </div>
                            <div className="mt-4 flex w-full items-end justify-between gap-2">
                                <p className="text-2xl font-extrabold store-primary-text whitespace-nowrap">${product.price.toFixed(2)}</p>
                                <Button asChild size="sm" className="shrink-0 store-primary-bg hover:opacity-90" disabled={!vendor?.phone}>
                                    <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Consultar
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold store-text">No se encontraron productos</h3>
                    <p className="mt-2 text-gray-500 store-font">Intenta cambiar los filtros o el término de búsqueda.</p>
                </div>
            )}
            
            {selectedProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in-0" onClick={closeModal}>
                <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <button onClick={closeModal} className="absolute top-3 right-3 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 z-10">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Cerrar</span>
                    </button>
                    <Carousel className="w-full max-w-md mx-auto mb-4">
                        <CarouselContent>
                             {selectedProduct.image_urls.map((url, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-square w-full max-h-80 overflow-hidden rounded-lg">
                                        <Image
                                            src={url}
                                            alt={`${selectedProduct.name} - imagen ${index + 1}`}
                                            width={500}
                                            height={500}
                                            className="h-full w-full object-contain"
                                            data-ai-hint="product image"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                         {selectedProduct.image_urls.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                        )}
                    </Carousel>
                    <div className="flex flex-col flex-grow">
                        <h2 className="text-2xl font-bold store-text">{selectedProduct.name}</h2>
                        <div className="mt-2 text-gray-600 flex-grow max-h-40 overflow-y-auto pr-2">
                          <p className="store-font">{selectedProduct.description}</p>
                        </div>
                        <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-3xl font-extrabold store-primary-text">${selectedProduct.price.toFixed(2)}</p>
                            <Button asChild size="lg" className="w-full sm:w-auto store-primary-bg hover:opacity-90" disabled={!vendor?.phone}>
                            <a href={getWhatsAppLink(selectedProduct)} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Consultar
                            </a>
                            </Button>
                        </div>
                    </div>
                </div>
              </div>
            )}


            <footer className="mt-12 text-center text-sm text-gray-500 store-font">
                <p>Potenciado por VentaRapida</p>
            </footer>
        </main>
    </div>
  );
}
