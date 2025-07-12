
"use client";

import Image from 'next/image';
import * as React from 'react';
import type { Product } from '@/types';
import {
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Artisan Ceramic Mug',
    image: 'https://placehold.co/80x80.png',
    price: 25.0,
    stock: 150,
    tags: ['New'],
    visible: true,
    category: 'Homeware',
    createdAt: '2023-10-01',
  },
  {
    id: 'prod_002',
    name: 'Organic Cotton Tote Bag',
    image: 'https://placehold.co/80x80.png',
    price: 15.5,
    stock: 300,
    tags: ['Offer'],
    visible: true,
    category: 'Accessories',
    createdAt: '2023-10-05',
  },
  {
    id: 'prod_003',
    name: 'Minimalist Desk Lamp',
    image: 'https://placehold.co/80x80.png',
    price: 79.99,
    stock: 0,
    tags: ['Out of Stock'],
    visible: false,
    category: 'Lighting',
    createdAt: '2023-09-20',
  },
  {
    id: 'prod_004',
    name: 'Recycled Paper Notebook',
    image: 'https://placehold.co/80x80.png',
    price: 12.0,
    stock: 500,
    tags: [],
    visible: true,
    category: 'Stationery',
    createdAt: '2023-10-10',
  },
  {
    id: 'prod_005',
    name: 'Gourmet Coffee Beans',
    image: 'https://placehold.co/80x80.png',
    price: 22.5,
    stock: 80,
    tags: ['New'],
    visible: true,
    category: 'Food & Drink',
    createdAt: '2023-10-12',
  },
];

export function ProductTable() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [filter, setFilter] = React.useState('all');

  const handleUpdateProduct = (
    productId: string,
    field: keyof Product,
    value: any
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
    );
    setEditingCell(null);
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true;
    if (filter === 'visible') return product.visible;
    if (filter === 'hidden') return !product.visible;
    if (filter === 'out-of-stock') return product.stock === 0;
    return true;
  });

  return (
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
          />
        </div>
      </div>
      <TabsContent value={filter}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="min-w-[250px]">Producto</TableHead>
                  <TableHead>Etiquetas</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Visibilidad</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Fecha Creación
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                          data-ai-hint="product image"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    >
                      {editingCell?.rowId === product.id &&
                      editingCell?.columnId === 'stock' ? (
                        <Input
                          type="number"
                          defaultValue={product.stock}
                          autoFocus
                          onBlur={(e) =>
                            handleUpdateProduct(
                              product.id,
                              'stock',
                              parseInt(e.target.value, 10)
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleUpdateProduct(
                                product.id,
                                'stock',
                                parseInt(e.currentTarget.value, 10)
                              );
                          }}
                          className="h-8 w-20"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
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
                    >
                      {editingCell?.rowId === product.id &&
                      editingCell?.columnId === 'price' ? (
                        <Input
                          type="number"
                          defaultValue={product.price}
                          autoFocus
                          onBlur={(e) =>
                            handleUpdateProduct(
                              product.id,
                              'price',
                              parseFloat(e.target.value)
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleUpdateProduct(
                                product.id,
                                'price',
                                parseFloat(e.currentTarget.value)
                              );
                          }}
                          className="h-8 w-24"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                           <span>
                            ${product.price.toFixed(2)}
                          </span>
                           <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.visible}
                        onCheckedChange={(value) =>
                          handleUpdateProduct(product.id, 'visible', value)
                        }
                      />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.createdAt}
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
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Borrar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>1-5</strong> de <strong>{products.length}</strong> productos
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline">Anterior</Button>
                <Button size="sm" variant="outline">Siguiente</Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
