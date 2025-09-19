
'use client';
import Link from 'next/link';
import {
  BookOpen,
  Share2,
  Copy,
  LogOut,
  Save,
  PlusCircle,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { toast } from 'sonner';
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
import { getSupabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function CatalogPage() {
  const { products, fetchProducts, catalogs, activeCatalog, setActiveCatalog, saveCatalog, createCatalog, deleteCatalog } = useProduct();
  const [newCatalogName, setNewCatalogName] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();
    const checkSession = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            fetchProducts();
        }
      }
    };
    checkSession();
  }, [router, fetchProducts]);
  
  const handleToggleProductInCatalog = (productId: string) => {
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
    toast.success('¡Catálogo guardado!', { description: 'Tus cambios han sido guardados.' });
  };

  const handleCreateCatalog = async () => {
    if (!newCatalogName.trim()) {
        toast.error('Error', { description: 'El nombre del catálogo no puede estar vacío.' });
        return;
    }
    await createCatalog(newCatalogName);
    setNewCatalogName('');
    setCreateDialogOpen(false);
  };

  const handleDeleteCatalog = async () => {
      if (!activeCatalog) return;
      await deleteCatalog(activeCatalog.id);
  }
  
  const productsInCatalog = activeCatalog ? products.filter(p => activeCatalog.product_ids.includes(p.id)) : [];
  const availableProducts = products.filter(p => p.visible);

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <h2 className="text-xl font-bold font-headline">
          Catálogos Digitales
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={handleSaveCatalog} disabled={!activeCatalog}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Catálogo
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground mb-6">Crea, personaliza y comparte catálogos para tus productos.</p>
        
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

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={!activeCatalog}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el catálogo
                              "{activeCatalog?.name}".
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteCatalog}>
                              Continuar
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>

            </CardContent>
             {catalogs.length === 0 && (
                <CardFooter>
                    <p className="text-sm text-muted-foreground">No tienes catálogos. ¡Crea uno para empezar!</p>
                </CardFooter>
            )}
        </Card>

        {activeCatalog ? (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-3 space-y-6">
                 <Card>
                  <CardHeader><CardTitle>1. Edita los detalles de tu catálogo</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="catalog-name-edit">Nombre del Catálogo</Label>
                        <Input id="catalog-name-edit" value={activeCatalog.name} onChange={(e) => setActiveCatalog({...activeCatalog, name: e.target.value})} />
                      </div>
                      <div className="flex items-center space-x-2 justify-self-start md:justify-self-end">
                        <Switch
                          id="is-public-switch"
                          checked={activeCatalog.is_public}
                          onCheckedChange={(checked) => setActiveCatalog({ ...activeCatalog, is_public: checked })}
                        />
                        <Label htmlFor="is-public-switch" className="flex items-center gap-1">
                          {activeCatalog.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Público
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help text-muted-foreground">(?)</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Si está activo, los productos de este catálogo aparecerán en tu tienda pública.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Selecciona Productos</CardTitle>
                    <CardDescription>
                      Elige qué productos incluir en el catálogo "{activeCatalog.name}".
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
                          <div className="relative w-10 h-10">
                            <Image src={product.image_urls[0]} alt={product.name} fill style={{objectFit: "cover"}} className="rounded-md" data-ai-hint="product image" />
                          </div>
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
    </div>
  );
}

export default CatalogPage;
