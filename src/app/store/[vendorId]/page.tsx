

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
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
        const publicCatalogs = catalogData as Catalog[];
        setCatalogs(publicCatalogs);

        const publicCatalogIds = publicCatalogs.map(c => c.id);

        if (publicCatalogIds.length > 0) {
            // 3. Fetch all products linked to these public catalogs
            const { data: catalogProductsData, error: catalogProductsError } = await supabase
                .from('catalog_products')
                .select('product_id, catalog_id')
                .in('catalog_id', publicCatalogIds);

            if (catalogProductsError) throw new Error('Error al cargar productos del catálogo.');
            
            const productIdsInPublicCatalogs = [...new Set(catalogProductsData.map(p => p.product_id))];

            if (productIdsInPublicCatalogs.length > 0) {
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', productIdsInPublicCatalogs)
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
                  image: p.image_url || 'https://placehold.co/300x300.png',
                  createdAt: '',
                  tags: [],
                  category: 'General',
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
  
  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCatalog = activeCatalogId === 'all' || (product as any).catalog_ids.includes(activeCatalogId);
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
                        className="pl-10 w-full" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Select value={activeCatalogId} onValueChange={setActiveCatalogId}>
                    <SelectTrigger className="w-full sm:w-[250px]">
                        <SelectValue placeholder="Seleccionar un catálogo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Productos</SelectItem>
                        {catalogs.map(catalog => (
                            <SelectItem key={catalog.id} value={catalog.id}>{catalog.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


            {!showEmptyState ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {filteredProducts.map((product) => (
                    <div key={product.id} onClick={() => openModal(product)} className="group flex cursor-pointer transform flex-col overflow-hidden rounded-xl border border-gray-200 shadow-lg transition-transform duration-300 hover:scale-[1.02] store-accent-bg">
                        <div className="aspect-square w-full overflow-hidden">
                            <Image
                            src={product.image}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="product image"
                            />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                            <div className="flex-1">
                                <h2 className="text-lg font-bold store-text truncate">{product.name}</h2>
                                {product.description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>}
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
                    <p className="mt-2 text-gray-500">Intenta cambiar los filtros o el término de búsqueda.</p>
                </div>
            )}
            
            {selectedProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in-0" onClick={closeModal}>
                <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <button onClick={closeModal} className="absolute top-3 right-3 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Cerrar</span>
                    </button>
                    <div className="w-full aspect-video overflow-hidden rounded-lg mb-4">
                        <Image
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        width={500}
                        height={281}
                        className="h-full w-full object-cover"
                        data-ai-hint="product image"
                        />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <h2 className="text-2xl font-bold store-text">{selectedProduct.name}</h2>
                        <div className="mt-2 text-gray-600 flex-grow max-h-40 overflow-y-auto pr-2">
                          <p>{selectedProduct.description}</p>
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


            <footer className="mt-12 text-center text-sm text-gray-500">
                <p>Potenciado por VentaRapida</p>
            </footer>
        </main>
    </div>
  );
}
