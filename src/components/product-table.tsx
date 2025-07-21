
"use client";

import Image from 'next/image';
import * as React from 'react';
import type { Product } from '@/types';
import {
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from './ui/checkbox';
import { useProduct } from '@/context/ProductContext';
import { EditProductDialog } from './edit-product-dialog';
import { Skeleton } from './ui/skeleton';

export function ProductTable() {
  const { products, loading, updateProduct, deleteProduct } = useProduct();
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [filter, setFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const handleUpdate = (
    productId: string,
    field: keyof Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image_urls' | 'description' | 'user_id' | 'in_catalog'>,
    value: any
  ) => {
    updateProduct(productId, { [field]: value });
    setEditingCell(null);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const filteredProducts = products.filter((product) => {
    const matchesFilter = 
        filter === 'all' ? true :
        filter === 'visible' ? product.visible :
        filter === 'hidden' ? !product.visible :
        filter === 'out-of-stock' ? product.stock === 0 :
        true;
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <>
    <Tabs defaultValue="all" onValueChange={setFilter}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="visible">Visibles</TabsTrigger>
          <TabsTrigger value="hidden">Ocultos</TabsTrigger>
          <TabsTrigger value="out-of-stock" className="hidden sm:flex">
            Agotados
          </TabsTrigger>
        </TabsList>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <TabsContent value={filter}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] hidden sm:table-cell">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="min-w-[250px]">Producto</TableHead>
                  <TableHead className="hidden md:table-cell">Etiquetas</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="hidden sm:table-cell">Visibilidad</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="hidden sm:table-cell"><Checkbox disabled /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-16 w-16 rounded-md" />
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-11 rounded-full" /></TableCell>
                      <TableCell>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            Aún no has añadido ningún producto.
                        </TableCell>
                    </TableRow>
                ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16">
                            <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="rounded-md object-cover"
                            data-ai-hint="product image"
                            />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1">
                        {product.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={
                              tag === 'Out of Stock' ? 'destructive' :
                              tag === 'New' ? 'secondary' : 'default'
                            }
                            className={cn(tag === 'Offer' && 'bg-accent text-accent-foreground')}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        setEditingCell({
                          rowId: product.id,
                          columnId: 'stock',
                        })
                      }
                      className="group"
                    >
                      {editingCell?.rowId === product.id &&
                      editingCell?.columnId === 'stock' ? (
                        <Input
                          type="number"
                          defaultValue={product.stock}
                          autoFocus
                          onBlur={(e) =>
                            handleUpdate(
                              product.id,
                              'stock',
                              parseInt(e.target.value, 10)
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleUpdate(
                                product.id,
                                'stock',
                                parseInt(e.currentTarget.value, 10)
                              );
                          }}
                          className="h-8 w-20"
                        />
                      ) : (
                        <div className="flex items-center gap-2 cursor-pointer">
                          <span>{product.stock}</span>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        setEditingCell({
                          rowId: product.id,
                          columnId: 'price',
                        })
                      }
                      className="group"
                    >
                      {editingCell?.rowId === product.id &&
                      editingCell?.columnId === 'price' ? (
                        <Input
                          type="number"
                          defaultValue={product.price}
                          autoFocus
                          onBlur={(e) =>
                            handleUpdate(
                              product.id,
                              'price',
                              parseFloat(e.target.value)
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleUpdate(
                                product.id,
                                'price',
                                parseFloat(e.currentTarget.value)
                              );
                          }}
                          className="h-8 w-24"
                        />
                      ) : (
                        <div className="flex items-center gap-2 cursor-pointer">
                           <span>
                            ${product.price.toFixed(2)}
                          </span>
                           <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Switch
                        checked={product.visible}
                        onCheckedChange={(value) =>
                          handleUpdate(product.id, 'visible', value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Borrar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>1-{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" disabled>Anterior</Button>
                <Button size="sm" variant="outline" disabled>Siguiente</Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
    {editingProduct && (
        <EditProductDialog
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
        />
    )}
    </>
  );
}

    