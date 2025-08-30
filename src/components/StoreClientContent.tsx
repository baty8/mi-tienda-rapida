
'use client';

import { useState, useMemo } from 'react';
import type { Product, Catalog, Profile } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, Search, X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
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
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

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

// Helper to determine if a color is light or dark
const isColorLight = (hexColor: string): boolean => {
  const color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
  let r, g, b;
  if (color.length === 3) {
    [r, g, b] = color.split('').map(c => parseInt(c + c, 16));
  } else if (color.length === 6) {
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  } else {
    return true; // Default for invalid hex codes
  }
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

// Helper to get contrasting text color (black or white)
const getContrastingTextColor = (bgColor: string): '#FFFFFF' | '#000000' => {
  return isColorLight(bgColor) ? '#000000' : '#FFFFFF';
};

export function StoreClientContent({ profile, initialCatalogsWithProducts }: StoreClientContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatalogId, setActiveCatalogId] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);


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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} añadido al carrito`, {
      action: {
        label: "Ver Carrito",
        onClick: () => setIsCartOpen(true),
      },
    });
  }

  const getCartWhatsAppLink = () => {
    const sellerPhoneNumber = profile?.phone || '';
    if (!sellerPhoneNumber) return '#';
    const messageLines = [
        `Hola ${profile.name || 'Tienda'}, quisiera hacer el siguiente pedido:`,
        ...cart.map(item => `- ${item.product.name} (x${item.quantity})`),
        `\n*Total: $${totalPrice.toLocaleString('es-AR', {minimumFractionDigits: 2})}*`
    ];
    const message = messageLines.join('\n');
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
  const getSingleProductWhatsAppLink = (product: Product) => {
    const sellerPhoneNumber = profile?.phone || '';
    if (!sellerPhoneNumber) return '#';
    const message = `Hola ${profile.name || 'Tienda'}, estoy interesado/a en el producto: ${product.name}.`;
    return `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
  const showEmptyState = initialCatalogsWithProducts.length === 0 && allProducts.length === 0;

  const storePrimaryColor = profile.store_primary_color || '#111827';
  const storeAccentColor = profile.store_accent_color || '#F3F4F6';
  
  const storeStyle = {
    '--store-bg': profile.store_bg_color || '#FFFFFF',
    '--store-primary': storePrimaryColor,
    '--store-primary-foreground': getContrastingTextColor(storePrimaryColor),
    '--store-accent': storeAccentColor,
    '--store-card-text': getContrastingTextColor(storeAccentColor),
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
            .store-secondary-text { color: ${isColorLight(profile.store_bg_color || '#FFFFFF') ? '#6b7280' : '#d1d5db'}; }
            .store-primary-bg { background-color: var(--store-primary); color: var(--store-primary-foreground); }
            .store-card { background-color: var(--store-accent); }
            .store-font { font-family: var(--store-font-family); }
            .store-primary-bg:hover { opacity: 0.9; }
        `}</style>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 store-bg">
        <header 
          className="relative mb-8 h-56 md:h-72 w-full overflow-hidden rounded-xl flex items-center justify-center text-center"
          style={headerStyle}
        >
            {profile.store_banner_url && (
                <Image src={profile.store_banner_url} alt="Banner de la tienda" fill style={{objectFit: 'cover'}} className="z-0" data-ai-hint="product lifestyle" />
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
                        className="pl-10 w-full store-font border-gray-200/50"
                        style={{ backgroundColor: 'var(--store-accent)', color: 'var(--store-card-text)'}}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={activeCatalogId} onValueChange={setActiveCatalogId} disabled={initialCatalogsWithProducts.length === 0}>
                    <SelectTrigger 
                      className="w-full sm:w-[250px] store-font border-gray-200/50"
                      style={{ backgroundColor: 'var(--store-accent)', color: 'var(--store-card-text)'}}
                    >
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
                <ShoppingBag className="mx-auto h-12 w-12" style={{ color: 'var(--store-secondary-text)'}} />
                <h3 className="mt-4 text-xl font-semibold store-text">
                    Esta tienda aún no tiene productos públicos.
                </h3>
                <p className="mt-2 store-font" style={{ color: 'var(--store-secondary-text)'}}>
                    Añade productos a un catálogo público para que aparezcan aquí.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => product && (
                <div key={product.id} className="group flex flex-col overflow-hidden rounded-xl border border-black/10 transition-transform duration-300 store-card">
                    <div onClick={() => openModal(product)} className="aspect-[4/3] w-full overflow-hidden relative cursor-pointer">
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
                           <h2 onClick={() => openModal(product)} className="text-lg font-bold store-text truncate cursor-pointer">{product.name}</h2>
                            {product.description && <p className="mt-1 text-sm line-clamp-2 store-secondary-text">{product.description}</p>}
                        </div>
                        <div className="mt-4 space-y-2">
                             <p className="text-2xl font-extrabold store-primary-text">${product.price.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                            <Button
                              style={{
                                backgroundColor: storePrimaryColor,
                                color: getContrastingTextColor(storePrimaryColor),
                              }}
                              className="w-full"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart
                                className="mr-2 h-4 w-4"
                              />
                              Añadir al carrito
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full"
                              style={{
                                borderColor: storePrimaryColor,
                                color: storePrimaryColor,
                                backgroundColor: 'transparent',
                              }}
                            >
                              <a
                                href={getSingleProductWhatsAppLink(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle
                                  className="mr-2 h-4 w-4"
                                />
                                Consultar
                              </a>
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
        
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
                 <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl store-primary-bg z-20">
                    <ShoppingCart className="h-7 w-7" />
                    {totalItems > 0 && <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{totalItems}</span>}
                    <span className="sr-only">Ver carrito de compras</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle className="text-2xl">Carrito de Compras</SheetTitle>
                </SheetHeader>
                {cart.length > 0 ? (
                    <>
                    <ScrollArea className="flex-grow pr-4 -mr-6">
                        <div className="divide-y">
                        {cart.map(item => (
                            <div key={item.product.id} className="flex items-center gap-4 py-4">
                                <Image src={item.product.image_urls[0]} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="product image" />
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">${item.product.price.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeFromCart(item.product.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <div className="border-t pt-4 mt-auto">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>${totalPrice.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                        </div>
                        <Button asChild size="lg" className="w-full mt-4 store-primary-bg" disabled={!profile?.phone}>
                            <a href={getCartWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Finalizar Compra por WhatsApp
                            </a>
                        </Button>
                        {!profile?.phone && <p className="text-xs text-center text-destructive mt-2">El vendedor no ha configurado un número de contacto.</p>}
                    </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Tu carrito está vacío</h3>
                        <p className="text-sm text-muted-foreground mt-1">Añade productos para empezar.</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>


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
                            <div className="flex flex-col flex-grow">
                                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                <div className="mt-2 text-muted-foreground flex-grow max-h-40 overflow-y-auto pr-2">
                                <p>{selectedProduct.description}</p>
                                </div>
                                <div className="mt-6 flex flex-col items-start gap-2">
                                    <p className="text-3xl font-extrabold store-primary-text">${selectedProduct.price.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { handleAddToCart(selectedProduct); closeModal(); }}>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Añadir al carrito
                                    </Button>
                                     <Button asChild size="lg" className="w-full" variant="outline">
                                        <a href={getSingleProductWhatsAppLink(selectedProduct)} target="_blank" rel="noopener noreferrer" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
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
        <footer className="mt-12 text-center text-sm store-font" style={{ color: 'var(--store-secondary-text)'}}>
            <p>Potenciado por ey mi tienda web!</p>
        </footer>
      </main>
    </div>
  );
}
