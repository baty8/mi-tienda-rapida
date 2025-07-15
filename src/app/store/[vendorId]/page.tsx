
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { Product, Catalog } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, AlertCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

type VendorProfile = {
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export default function PublicStorePage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      setError("No se proporcionó un ID de vendedor.");
      return;
    }

    const fetchStoreData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url, phone')
          .eq('id', vendorId)
          .single();

        if (profileError || !profileData) {
          throw new Error('No se pudo encontrar la información del vendedor.');
        }
        setVendor(profileData);

        const { data: publicCatalogs, error: catalogError } = await supabase
          .from('catalogs')
          .select('id, name, catalog_products!inner(product_id)')
          .eq('user_id', vendorId)
          .eq('is_public', true);

        if (catalogError) throw new Error('Error al cargar catálogos.');
        
        const productIds = [...new Set(publicCatalogs.flatMap(c => c.catalog_products.map(p => p.product_id)))];
        
        setCatalogs(publicCatalogs.map(c => ({...c, product_ids: c.catalog_products.map(p => p.product_id)} as unknown as Catalog)));

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
            stock: p.stock || 0,
            image: p.image_url || 'https://placehold.co/300x200.png',
            user_id: p.user_id,
          })) as Product[];
          setAllProducts(formattedProducts);
        } else {
          setAllProducts([]);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [vendorId]);

  const filteredProducts = useMemo(() => {
    let productsToShow = allProducts;
    
    if (activeTab !== 'all') {
        const activeCatalog = catalogs.find(c => c.id === activeTab);
        if (activeCatalog) {
            productsToShow = allProducts.filter(p => activeCatalog.product_ids.includes(p.id));
        }
    }
    
    if (searchTerm) {
        productsToShow = productsToShow.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return productsToShow;
  }, [allProducts, catalogs, activeTab, searchTerm]);
  
  const getWhatsAppLink = (productName: string, catalogName?: string) => {
    const sellerPhoneNumber = vendor?.phone || '';
    if (!sellerPhoneNumber) return '#';
    const message = `Hola, estoy interesado en el producto "${productName}"${catalogName ? ` del catálogo "${catalogName}"` : ''}. ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

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

  const showEmptyState = !vendor || allProducts.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-800">
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                        <AvatarImage src={vendor?.avatar_url || 'https://placehold.co/100x100.png'} alt={vendor?.name || 'Vendedor'} data-ai-hint="logo business" />
                        <AvatarFallback>{vendor?.name?.charAt(0) || 'V'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold font-headline text-primary">{vendor?.name || 'Nuestra Tienda'}</h1>
                        <p className="text-muted-foreground">Explora todos nuestros productos seleccionados</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                        type="search"
                        placeholder="Buscar producto..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
            </div>
        </header>

        {showEmptyState ? (
             <div className="py-16 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold">Esta tienda está vacía</h3>
                <p className="mt-2 text-muted-foreground">El vendedor aún no ha añadido productos a sus catálogos públicos.</p>
            </div>
        ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <TabsTrigger value="all">Todos los Productos</TabsTrigger>
                    {catalogs.map(catalog => (
                        <TabsTrigger key={catalog.id} value={catalog.id}>{catalog.name}</TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value={activeTab} className="mt-6">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="group overflow-hidden rounded-lg border bg-white shadow-md transition-shadow hover:shadow-xl">
                                    <div className="relative h-56 w-full">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint="product image"
                                        />
                                    </div>
                                    <div className="flex flex-col p-4">
                                        <h3 className="flex-grow font-semibold text-gray-800">{product.name}</h3>
                                        <p className="mt-2 text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                                        <Button asChild size="sm" className="mt-4 w-full bg-green-500 text-white hover:bg-green-600" disabled={!vendor?.phone}>
                                            <a href={getWhatsAppLink(product.name)} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                Consultar
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <Search className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-xl font-semibold">No se encontraron productos</h3>
                            <p className="mt-2 text-muted-foreground">Intenta con otra búsqueda o selecciona otra categoría.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        )}
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Potenciado por VentaRapida</p>
        </footer>
      </main>
    </div>
  );
}
