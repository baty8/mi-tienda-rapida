
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type VendorProfile = {
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export default function PublicCatalogPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        setError("No se proporcionó un ID de vendedor.");
        return;
    };

    const fetchCatalogData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch vendor info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url, phone')
          .eq('id', userId)
          .single();

        if (profileError || !profileData) {
          console.error('Profile fetch error:', profileError || 'No profile data found for this user ID.');
          setVendor(null);
        } else {
            setVendor(profileData as VendorProfile);
        }

        // Fetch products that are visible and selected for the catalog
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .eq('visible', true)
          .eq('in_catalog', true)
          .order('created_at', { ascending: false });

        if (productError) {
          throw new Error('No se pudieron cargar los productos.');
        }

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
          in_catalog: p.in_catalog,
        }));
        setProducts(formattedProducts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [userId]);

  const getWhatsAppLink = (product: Product) => {
    const sellerPhoneNumber = vendor?.phone || '';
    if (!sellerPhoneNumber) {
        return '#';
    }
    const message = `Hola, estoy interesado en el producto "${product.name}". ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
        <ShoppingBag className="h-16 w-16 animate-bounce text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando catálogo...</p>
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

  const showEmptyState = !vendor || products.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-800">
      <main className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <Avatar className="mx-auto h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={vendor?.avatar_url || 'https://placehold.co/100x100.png'} alt={vendor?.name || 'Vendedor'} data-ai-hint="logo business" />
            <AvatarFallback>{vendor?.name?.charAt(0) || 'V'}</AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-4xl font-bold font-headline text-primary">{vendor?.name || 'Nuestro Catálogo'}</h1>
          <p className="text-muted-foreground">Explora nuestros productos seleccionados</p>
        </header>

        {!showEmptyState && (
            <div className="space-y-6">
            {products.map((product) => (
                <div key={product.id} className="transform transition-transform duration-300 hover:scale-[1.02]">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
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
                        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                        {product.description && <p className="mt-2 text-muted-foreground">{product.description}</p>}
                        <div className="mt-4 flex-grow"></div>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <p className="text-3xl font-extrabold text-primary">${product.price.toFixed(2)}</p>
                        <Button asChild size="lg" className="w-full bg-green-500 text-lg text-white hover:bg-green-600 sm:w-auto" disabled={!vendor?.phone}>
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
                <h3 className="mt-4 text-xl font-semibold">Este catálogo está vacío</h3>
                <p className="mt-2 text-muted-foreground">El vendedor aún no ha añadido productos o el enlace es incorrecto.</p>
            </div>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Potenciado por VentaRapida</p>
        </footer>
      </main>
    </div>
  );
}
