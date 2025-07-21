
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type CatalogWithProducts = Omit<Catalog, 'product_ids' | 'user_id' | 'created_at' | 'is_public'> & {
    products: Product[];
}

type StoreClientContentProps = {
    profile: Profile;
    initialCatalogsWithProducts: CatalogWithProducts[];
}

// This is a Client Component. It receives data from the server and handles user interactions.
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
  
  const showEmptyState = allProducts.length === 0;

  return (
    <>
      <header className="mb-8 text-center">
            <Avatar className="mx-auto h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'Vendedor'} data-ai-hint="logo business" />
                <AvatarFallback>{profile.name?.charAt(0) || 'V'}</AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold store-primary-text">{profile.name || 'Nuestra Tienda'}</h1>
      </header>

      <div className="sticky top-0 z-10 py-4 store-bg flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                  placeholder="Buscar producto..." 
                  className="pl-10 w-full store-font bg-white/80 dark:bg-black/20" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={activeCatalogId} onValueChange={setActiveCatalogId} disabled={initialCatalogsWithProducts.length === 0}>
              <SelectTrigger className="w-full sm:w-[250px] store-font bg-white/80 dark:bg-black/20">
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

      {!showEmptyState ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => product && (
              <div key={product.id} className="group flex transform flex-col overflow-hidden rounded-xl border border-gray-200/50 shadow-lg transition-transform duration-300 hover:scale-[1.02] store-accent-bg">
                  <Carousel className="w-full" opts={{ loop: product.image_urls.length > 1 }}>
                      <CarouselContent>
                          {(product.image_urls && product.image_urls.length > 0 ? product.image_urls : ['https://placehold.co/600x400.png']).map((url, index) => (
                              <CarouselItem key={index} onClick={() => openModal(product)} className="cursor-pointer">
                                  <div className="aspect-square w-full overflow-hidden relative">
                                      <Image
                                          src={url}
                                          alt={`${product.name} - imagen ${index + 1}`}
                                          fill
                                          sizes="(max-width: 768px) 100vw, 50vw"
                                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                                          data-ai-hint="product image"
                                      />
                                  </div>
                              </CarouselItem>
                          ))}
                      </CarouselContent>
                        {product.image_urls && product.image_urls.length > 1 && (
                          <>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 transform text-white bg-black/30 hover:bg-black/50 border-none" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 transform text-white bg-black/30 hover:bg-black/50 border-none" />
                          </>
                      )}
                  </Carousel>
                  <div className="flex flex-1 flex-col p-4">
                      <div className="flex-1" onClick={() => openModal(product)} >
                          <h2 className="text-lg font-bold store-text truncate cursor-pointer">{product.name}</h2>
                          {product.description && <p className="mt-1 text-sm line-clamp-2 store-secondary-text">{product.description}</p>}
                      </div>
                      <div className="mt-4 flex w-full items-end justify-between gap-2">
                          <p className="text-2xl font-extrabold store-primary-text whitespace-nowrap">${product.price.toFixed(2)}</p>
                          <Button asChild size="sm" className="shrink-0 store-primary-bg hover:opacity-90" disabled={!profile?.phone}>
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
              <h3 className="mt-4 text-xl font-semibold store-text">
                  Esta tienda aún no tiene productos públicos.
              </h3>
              <p className="mt-2 text-gray-500 store-font">
                  Añade productos a un catálogo público para que aparezcan aquí.
              </p>
          </div>
      )}
      
      <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && closeModal()}>
            <DialogContent className="max-w-lg w-full p-0">
              <DialogHeader className="sr-only">
                  <DialogTitle>{selectedProduct?.name}</DialogTitle>
                  <DialogDescription>{selectedProduct?.description || 'Detalles del producto'}</DialogDescription>
              </DialogHeader>
              {selectedProduct && (
                  <div className="relative w-full rounded-xl bg-white p-6 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <DialogClose asChild>
                          <button className="absolute top-3 right-3 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 z-10">
                              <X className="h-5 w-5" />
                              <span className="sr-only">Cerrar</span>
                          </button>
                      </DialogClose>
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
                          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-3xl font-extrabold text-blue-600">${selectedProduct.price.toFixed(2)}</p>
                              <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700" disabled={!profile?.phone}>
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
    </>
  );
}
