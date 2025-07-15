
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
  Save,
  PlusCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const templates = [
  { id: 'modern', name: 'Moderno', bg: 'bg-slate-900', text: 'text-white' },
  { id: 'classic', name: 'Clásico', bg: 'bg-white', text: 'text-gray-800' },
  { id: 'vibrant', name: 'Vibrante', bg: 'bg-blue-500', text: 'text-white' },
];

export default function CatalogPage() {
  const { products, fetchProducts, catalogs, activeCatalog, setActiveCatalog, saveCatalog, createCatalog } = useProduct();
  const [newCatalogName, setNewCatalogName] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();

  const catalogLink = activeCatalog ? `${window.location.origin}/catalog/${activeCatalog.id}` : '';

  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
        } else {
            fetchProducts();
        }
    };
    checkSession();
  }, [router, fetchProducts]);
  
  const handleToggleProductInCatalog = (productId: number) => {
    if (!activeCatalog) return;

    const isProductInCatalog = activeCatalog.product_ids.includes(productId);
    const updatedProductIds = isProductInCatalog
        ? activeCatalog.product_ids.filter(id => id !== productId)
        : [...activeCatalog.product_ids, productId];

    setActiveCatalog({ ...activeCatalog, product_ids: updatedProductIds });
  };

  const handleSaveCatalog = async () => {
    if (!activeCatalog) return;
    await saveCatalog(activeCatalog.id, activeCatalog);
    toast({ title: '¡Catálogo guardado!', description: 'Tus cambios han sido guardados.' });
  };

  const handleCreateCatalog = async () => {
    if (!newCatalogName.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'El nombre del catálogo no puede estar vacío.' });
        return;
    }
    await createCatalog(newCatalogName);
    setNewCatalogName('');
    setCreateDialogOpen(false);
  };
  
  const productsInCatalog = activeCatalog ? products.filter(p => activeCatalog.product_ids.includes(p.id)) : [];
  const selectedTemplate = templates.find(t => t.id === activeCatalog?.template_id) || templates[0];
  const availableProducts = products.filter(p => p.visible);

  return (
    <VendorLayout>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:justify-end">
        <h2 className="text-2xl font-bold font-headline md:hidden">
          Catálogo Digital
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={handleSaveCatalog} disabled={!activeCatalog}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Catálogo
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={!catalogLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
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
                  <Label htmlFor="link" className="sr-only">Enlace</Label>
                  <Input id="link" value={catalogLink} readOnly />
                </div>
                <Button type="submit" size="icon" onClick={() => {
                  navigator.clipboard.writeText(catalogLink);
                  toast({ title: '¡Copiado!' });
                }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold font-headline">Catálogos Digitales</h2>
            <p className="text-muted-foreground">Crea, personaliza y comparte catálogos para tus productos.</p>
          </div>
        </div>
        
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Gestionar Catálogos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <Select
                    value={activeCatalog?.id || ''}
                    onValueChange={(catalogId) => {
                        const newActiveCatalog = catalogs.find(c => c.id === catalogId);
                        if(newActiveCatalog) setActiveCatalog(newActiveCatalog);
                    }}
                    disabled={catalogs.length === 0}
                >
                    <SelectTrigger className="w-full sm:w-[250px]">
                        <SelectValue placeholder="Selecciona un catálogo" />
                    </SelectTrigger>
                    <SelectContent>
                        {catalogs.map(catalog => (
                            <SelectItem key={catalog.id} value={catalog.id}>{catalog.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear Nuevo Catálogo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Catálogo</DialogTitle>
                      <DialogDescription>Dale un nombre a tu nuevo catálogo para empezar a organizarlo.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="catalog-name">Nombre del Catálogo</Label>
                      <Input id="catalog-name" value={newCatalogName} onChange={(e) => setNewCatalogName(e.target.value)} placeholder="Ej: Ofertas de Verano" />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleCreateCatalog}>Crear</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </CardContent>
             {catalogs.length === 0 && (
                <CardFooter>
                    <p className="text-sm text-muted-foreground">No tienes catálogos. ¡Crea uno para empezar!</p>
                </CardFooter>
            )}
        </Card>

        {activeCatalog ? (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                 <Card>
                  <CardHeader><CardTitle>1. Edita los detalles de tu catálogo</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="catalog-name-edit">Nombre del Catálogo</Label>
                      <Input id="catalog-name-edit" value={activeCatalog.name} onChange={(e) => setActiveCatalog({...activeCatalog, name: e.target.value})} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Selecciona Productos</CardTitle>
                    <CardDescription>
                      Elige qué productos incluir en este catálogo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {availableProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={activeCatalog.product_ids.includes(product.id)}
                            onCheckedChange={() => handleToggleProductInCatalog(product.id)}
                          />
                          <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" data-ai-hint="product image" />
                          <label htmlFor={`product-${product.id}`} className="flex-1 font-medium cursor-pointer">{product.name}</label>
                          <div className="text-sm text-muted-foreground">${product.price.toFixed(2)}</div>
                        </div>
                    ))}
                    {availableProducts.length === 0 && <p className="text-center text-muted-foreground py-4">No tienes productos visibles para añadir.</p>}
                  </CardContent>
                   <CardFooter>
                      <div className="text-xs text-muted-foreground">
                          Seleccionados {productsInCatalog.length} de {availableProducts.length} productos.
                      </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3. Elige una Plantilla</CardTitle>
                    <CardDescription>Selecciona un tema visual para tu catálogo.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className={cn('relative rounded-lg border-2 p-4 cursor-pointer', selectedTemplate.id === template.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground/20')} onClick={() => setActiveCatalog({ ...activeCatalog, template_id: template.id })}>
                        <div className={cn('w-full h-20 rounded-md flex items-center justify-center', template.bg)}>
                          <span className={cn('font-bold', template.text)}>Aa</span>
                        </div>
                        <h3 className="mt-2 text-center font-semibold">{template.name}</h3>
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
                          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Vista Previa Móvil</CardTitle>
                          <CardDescription>Así es como tus clientes verán el catálogo.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-[2.5rem] border-[14px] border-gray-800 shadow-xl overflow-hidden">
                              <div className="w-full h-[568px] overflow-y-auto">
                                  <div className={cn("p-4", selectedTemplate.bg, selectedTemplate.text)}>
                                      <div className="text-center mb-6">
                                          <ShoppingBag className="mx-auto h-12 w-12" />
                                          <h1 className="text-2xl font-bold font-headline mt-2">{activeCatalog.name}</h1>
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
                                          {productsInCatalog.length === 0 && <p className="text-center opacity-70 py-10">Selecciona productos para verlos aquí.</p>}
                                      </div>
                                      <div className="text-center mt-8 text-xs opacity-60"><p>Potenciado por VentaRapida</p></div>
                                   </div>
                              </div>
                          </div>
                      </CardContent>
                   </Card>
              </div>
            </div>
        ) : (
             <div className="text-center py-16">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold">Selecciona o crea un catálogo</h3>
                <p className="mt-2 text-muted-foreground">Usa los controles de arriba para empezar a organizar tus productos.</p>
            </div>
        )}
      </main>
    </VendorLayout>
  );
}

    