
'use client';

import { useState, useMemo } from 'react';
import type { Product, Catalog, Profile } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type CatalogWithProducts = Omit<Catalog, 'product_ids' | 'user_id' | 'created_at' | 'is_public'> & {
    products: Product[];
}

type StoreClientContentProps = {
    profile: Profile;
    initialCatalogsWithProducts: CatalogWithProducts[];
}

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

// Simple helper to determine if a color is light or dark
const isColorLight = (hex: string) => {
    const color = hex.substring(1); // remove #
    const rgb = parseInt(color, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma > 128;
}


export function StoreClientContent({ profile, initialCatalogsWithProducts }: StoreClientContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatalogId, setActiveCatalogId] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const allProducts = useMemo(() => {
    const productMap = new Map<string, Product>();
    initialCatalogsWithProducts.forEach(catalog => {
        catalog.products.forEach(product => {
            if (!productMap.has(product.id)) {
                productMap.set(product.id, product);
            }
        });
    });
    return Array.from(productMap.values());
  }, [initialCatalogsWithProducts]);

  const filteredProducts = useMemo(() => {
    let productsToFilter = activeCatalogId === 'all'
        ? allProducts
        : initialCatalogsWithProducts.find(c => c.id === activeCatalogId)?.products || [];
    
    if (searchQuery) {
        return productsToFilter.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return productsToFilter;
  }, [allProducts, initialCatalogsWithProducts, activeCatalogId, searchQuery]);

  const openModal = (product: Product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const getWhatsAppLink = (product: Product) => {
    const sellerPhoneNumber = profile?.phone || '';
    if (!sellerPhoneNumber) return '#';
    const message = `Hola, estoy interesado en el producto "${product.name}". ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
  const showEmptyState = initialCatalogsWithProducts.length === 0 && allProducts.length === 0;

  const storePrimaryColor = profile.store_primary_color || '#111827';
  const storeAccentColor = profile.store_accent_color || '#F3F4F6';
  const cardTextColor = isColorLight(storeAccentColor) ? '#111827' : '#FFFFFF';
  const buttonTextColor = isColorLight(storePrimaryColor) ? '#111827' : '#FFFFFF';

  const storeStyle = {
    '--store-bg': profile.store_bg_color || '#FFFFFF',
    '--store-primary': storePrimaryColor,
    '--store-primary-foreground': buttonTextColor,
    '--store-accent': storeAccentColor,
    '--store-card-text': cardTextColor,
    '--store-font-family': getFontFamily(profile.store_font_family),
  } as React.CSSProperties;
  
  const headerStyle = profile.store_banner_url ? {} : {
      background: `linear-gradient(45deg, ${storePrimaryColor}, ${storeAccentColor})`
  };

  return (
    <div style={storeStyle} className="min-h-screen store-font">
       <style jsx global>{`
            body { background-color: var(--store-bg); color: var(--store-primary); }
            .store-bg { background-color: var(--store-bg); }
            .store-text { color: var(--store-card-text); }
            .store-primary-text { color: var(--store-primary); }
            .store-secondary-text { color: ${isColorLight(storeAccentColor) ? '#6b7280' : '#d1d5db'}; }
            .store-primary-bg { background-color: var(--store-primary); color: var(--store-primary-foreground); }
            .store-card { background-color: var(--store-accent); color: var(--store-card-text); }
            .store-font { font-family: var(--store-font-family); }
        `}</style>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 store-bg">
        <header 
          className="relative mb-8 h-56 md:h-72 w-full overflow-hidden rounded-xl shadow-lg flex items-center justify-center text-center"
          style={headerStyle}
        >
            {profile.store_banner_url && (
                <Image src={profile.store_banner_url} alt="Banner de la tienda" fill objectFit="cover" className="z-0" data-ai-hint="product lifestyle" />
            )}
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <div className="relative z-20 p-6 flex flex-col items-center text-white">
                <Avatar className="h-20 w-20 border-4 border-white/50 shadow-lg mb-2">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'Vendedor'} data-ai-hint="logo business" />
                    <AvatarFallback>{profile.name?.charAt(0) || 'V'}</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl md:text-4xl font-bold">{profile.name || 'Nuestra Tienda'}</h1>
                <p className="mt-2 text-md max-w-md text-white/90">{profile.store_description || 'Catálogo de productos'}</p>
            </div>
        </header>

        <div className="sticky top-0 z-10 py-4 store-bg flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Buscar producto..." 
                        className="pl-10 w-full store-font store-card border-gray-200/50" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={activeCatalogId} onValueChange={setActiveCatalogId} disabled={initialCatalogsWithProducts.length === 0}>
                    <SelectTrigger className="w-full sm:w-[250px] store-font store-card border-gray-200/50">
                        <SelectValue placeholder="Seleccionar un catálogo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="store-font">Todos los Productos</SelectItem>
                        {initialCatalogsWithProducts.map(catalog => (
                            <SelectItem key={catalog.id} value={catalog.id} className="store-font">{catalog.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
        </div>

        {showEmptyState ? (
            <div className="py-16 text-center store-card rounded-xl">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold store-text">
                    Esta tienda aún no tiene productos públicos.
                </h3>
                <p className="mt-2 text-gray-500 store-font">
                    Añade productos a un catálogo público para que aparezcan aquí.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => product && (
                <div key={product.id} onClick={() => openModal(product)} className="group flex cursor-pointer transform flex-col overflow-hidden rounded-xl border border-black/10 shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl store-card">
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="product image"
                        />
                    </div>
                    <div className="flex flex-1 flex-col p-4 justify-between">
                        <div>
                            <h2 className="text-lg font-bold store-text truncate">{product.name}</h2>
                            {product.description && <p className="mt-1 text-sm line-clamp-2 store-secondary-text">{product.description}</p>}
                        </div>
                        <div className="mt-4 space-y-2">
                             <p className="text-2xl font-extrabold store-primary-text">${product.price.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                            <Button asChild className="w-full store-primary-bg hover:opacity-90" disabled={!profile?.phone} onClick={(e) => e.stopPropagation()}>
                                <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Consultar
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
        
        <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                <DialogContent className="max-w-lg w-full p-0">
                    {selectedProduct && (
                        <div className="relative w-full p-6 flex flex-col">
                             <DialogHeader>
                                <DialogTitle className="sr-only">{selectedProduct.name}</DialogTitle>
                                <DialogDescription className="sr-only">
                                    Vista detallada del producto: {selectedProduct.description}
                                </DialogDescription>
                            </DialogHeader>
                            <Carousel className="w-full max-w-md mx-auto mb-4">
                                <CarouselContent>
                                    {(selectedProduct.image_urls && selectedProduct.image_urls.length > 0 ? selectedProduct.image_urls : ['https://placehold.co/600x400.png']).map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-square w-full max-h-80 overflow-hidden relative rounded-lg">
                                                <Image
                                                    src={url}
                                                    alt={`${selectedProduct.name} - imagen ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    className="object-contain"
                                                    data-ai-hint="product image"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                                    <>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                    </>
                                )}
                            </Carousel>
                            <div className="flex flex-col flex-grow text-black">
                                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                <div className="mt-2 text-gray-600 flex-grow max-h-40 overflow-y-auto pr-2">
                                <p>{selectedProduct.description}</p>
                                </div>
                                <div className="mt-6 flex flex-col items-start gap-4">
                                    <p className="text-3xl font-extrabold text-blue-600">${selectedProduct.price.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                    <Button asChild size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={!profile?.phone}>
                                    <a href={getWhatsAppLink(selectedProduct)} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        Consultar por WhatsApp
                                    </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
        </Dialog>
        <footer className="mt-12 text-center text-sm text-gray-500 store-font">
            <p>Potenciado por VentaRapida</p>
        </footer>
      </main>
    </div>
  );
}
