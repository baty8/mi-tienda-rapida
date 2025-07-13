
'use client';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  BookOpen,
  Share2,
  Check,
  Smartphone,
  Copy,
  MessageCircle,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProduct } from '@/context/ProductContext';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { VendorLayout } from '@/components/vendor-layout';

const templates = [
  { id: 'modern', name: 'Moderno', bg: 'bg-slate-900', text: 'text-white' },
  { id: 'classic', name: 'Clásico', bg: 'bg-white', text: 'text-gray-800' },
  { id: 'vibrant', name: 'Vibrante', bg: 'bg-blue-500', text: 'text-white' },
];

export default function CatalogPage() {
  const { products, fetchProducts, updateProduct } = useProduct();
  const [selectedTemplate, setSelectedTemplate] = React.useState(templates[0]);
  const [catalogLink, setCatalogLink] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
        } else {
            setUserId(session.user.id);
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            setCatalogLink(`${origin}/catalog/${session.user.id}`);
            fetchProducts();
        }
    };
    checkSession();
  }, [router, fetchProducts]);

  const handleToggleProductInCatalog = async (productId: string, inCatalog: boolean) => {
    await updateProduct(productId, { in_catalog: inCatalog });
  };
  
  const productsInCatalog = products.filter(p => p.in_catalog);

  return (
    <VendorLayout>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-2xl font-bold font-headline md:hidden">
          Catálogo Digital
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={!catalogLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir Catálogo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comparte tu Catálogo</DialogTitle>
                <DialogDescription>
                  Cualquiera con este enlace puede ver tu catálogo digital.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    Enlace
                  </Label>
                  <Input id="link" value={catalogLink} readOnly />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(catalogLink);
                    toast({
                      title: '¡Copiado al portapapeles!',
                      description:
                        'Ya puedes compartir el enlace de tu catálogo.',
                    });
                  }}
                >
                  <span className="sr-only">Copiar</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                  <Button variant="outline" asChild>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`¡Mira mi catálogo de productos! ${catalogLink}`)}`} target="_blank" rel="noopener noreferrer">Compartir en WhatsApp</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(catalogLink)}`} target="_blank" rel="noopener noreferrer">Compartir en Facebook</a>
                  </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold font-headline">
              Catálogo Digital
            </h2>
            <p className="text-muted-foreground">
              Crea, previsualiza y comparte un hermoso catálogo de tus productos.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Selecciona Productos</CardTitle>
                <CardDescription>
                  Elige qué productos incluir en tu catálogo. Los productos marcados como 'ocultos' en la tabla de productos no aparecerán aquí.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {products
                  .filter((p) => p.visible)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted"
                    >
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={product.in_catalog}
                        onCheckedChange={(checked) =>
                          handleToggleProductInCatalog(
                            product.id,
                            checked as boolean
                          )
                        }
                      />
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md"
                        data-ai-hint="product image"
                      />
                      <label
                        htmlFor={`product-${product.id}`}
                        className="flex-1 font-medium cursor-pointer"
                      >
                        {product.name}
                      </label>
                      <div className="text-sm text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {products.filter(p => p.visible).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No tienes productos visibles para mostrar.</p>
                  )}
              </CardContent>
               <CardFooter>
                  <div className="text-xs text-muted-foreground">
                      Seleccionados {productsInCatalog.length} de {products.filter(p => p.visible).length} productos.
                  </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Elige una Plantilla</CardTitle>
                <CardDescription>
                  Selecciona un tema visual para tu catálogo. (Próximamente)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      'relative rounded-lg border-2 p-4 cursor-pointer',
                      selectedTemplate.id === template.id
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/20'
                    )}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div
                      className={cn(
                        'w-full h-20 rounded-md flex items-center justify-center',
                        template.bg
                      )}
                    >
                      <span className={cn('font-bold', template.text)}>
                        Aa
                      </span>
                    </div>
                    <h3 className="mt-2 text-center font-semibold">
                      {template.name}
                    </h3>
                    {selectedTemplate.id === template.id && (
                      <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Vista Previa Móvil
                      </CardTitle>
                      <CardDescription>Así es como tus clientes verán el catálogo.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-[2.5rem] border-[14px] border-gray-800 shadow-xl overflow-hidden">
                          <div className="w-full h-[568px] overflow-y-auto">
                              <div className={cn("p-4", selectedTemplate.bg, selectedTemplate.text)}>
                                  <div className="text-center mb-6">
                                      <ShoppingBag className="mx-auto h-12 w-12" />
                                      <h1 className="text-2xl font-bold font-headline mt-2">VentaRapida</h1>
                                      <p className="text-sm opacity-80">Nuestros Productos</p>
                                  </div>
                                  <div className="space-y-4">
                                      {productsInCatalog.map(product => (
                                           <div key={product.id} className="bg-background/10 dark:bg-white/10 p-3 rounded-lg space-y-3">
                                              <div className="flex items-center gap-4">
                                                  <Image src={product.image} alt={product.name} width={64} height={64} className="w-16 h-16 rounded-md object-cover" data-ai-hint="product image" />
                                                  <div className="flex-1">
                                                      <h3 className="font-semibold">{product.name}</h3>
                                                      <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                                                  </div>
                                              </div>
                                              <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white">
                                                  <MessageCircle className="mr-2 h-4 w-4" />
                                                  Contactar por WhatsApp
                                              </Button>
                                           </div>
                                      ))}
                                      {productsInCatalog.length === 0 && (
                                          <p className="text-center opacity-70 py-10">Selecciona productos para verlos aquí.</p>
                                      )}
                                  </div>
                                  <div className="text-center mt-8 text-xs opacity-60">
                                      <p>Potenciado por VentaRapida</p>
                                  </div>
                               </div>
                          </div>
                      </div>
                  </CardContent>
               </Card>
          </div>
        </div>
      </main>
    </VendorLayout>
  );
}
