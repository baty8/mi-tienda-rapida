
'use client';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  Landmark,
  BookOpen,
  Eye,
  Share2,
  Palette,
  Check,
  Smartphone,
  Copy,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types';
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
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

const templates = [
  { id: 'modern', name: 'Modern', bg: 'bg-slate-900', text: 'text-white' },
  { id: 'classic', name: 'Classic', bg: 'bg-white', text: 'text-gray-800' },
  { id: 'vibrant', name: 'Vibrant', bg: 'bg-blue-500', text: 'text-white' },
];

export default function CatalogPage() {
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState(templates[0]);

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const catalogLink = 'https://ventarapida.com/catalog/xyz123';

  return (
    <div className="flex min-h-screen w-full flex-row">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">
              VentaRapida
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/">
                  <Package />
                  Products
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/dashboard">
                  <LineChart />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                    <Link href="/catalog">
                        <BookOpen />
                        Catalog
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/finance">
                  <Landmark />
                  Finance
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/profile">
                  <User />
                  Profile
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar>
              <AvatarImage
                src="https://placehold.co/40x40"
                alt="User avatar"
                data-ai-hint="male user"
              />
              <AvatarFallback>VR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin</span>
              <span className="text-xs text-muted-foreground">
                admin@ventarapida.com
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-2xl font-bold font-headline md:hidden">
            Digital Catalog
          </h2>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Catalog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share your Catalog</DialogTitle>
                  <DialogDescription>
                    Anyone with this link can view your digital catalog.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Input id="link" defaultValue={catalogLink} readOnly />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(catalogLink);
                      toast({
                        title: 'Copied to clipboard!',
                        description:
                          'You can now share your catalog link.',
                      });
                    }}
                  >
                    <span className="sr-only">Copy</span>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter className="sm:justify-start">
                    <Button variant="outline">Share on WhatsApp</Button>
                    <Button variant="outline">Share on Facebook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold font-headline">
                Digital Catalog
              </h2>
              <p className="text-muted-foreground">
                Create, preview, and share a beautiful catalog of your products.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Select Products</CardTitle>
                  <CardDescription>
                    Choose which products to include in your catalog.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {mockProducts
                    .filter((p) => p.visible)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted"
                      >
                        <Checkbox
                          id={`product-${product.id}`}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(
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
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Selected {selectedProducts.length} of {mockProducts.filter(p => p.visible).length} products.
                    </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Choose a Template</CardTitle>
                  <CardDescription>
                    Select a visual theme for your catalog.
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
                          : 'border-transparent'
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
                            Mobile Preview
                        </CardTitle>
                        <CardDescription>This is how your customers will see the catalog.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-[2.5rem] border-[14px] border-gray-800 shadow-xl overflow-hidden">
                            <div className="w-full h-[568px] overflow-y-auto">
                                <div className={cn("p-4", selectedTemplate.bg, selectedTemplate.text)}>
                                    <div className="text-center mb-6">
                                        <ShoppingBag className="mx-auto h-12 w-12" />
                                        <h1 className="text-2xl font-bold font-headline mt-2">VentaRapida</h1>
                                        <p className="text-sm opacity-80">Our Products</p>
                                    </div>
                                    <div className="space-y-4">
                                        {mockProducts.filter(p => selectedProducts.includes(p.id)).map(product => (
                                             <div key={product.id} className="flex items-center gap-4 bg-white/10 p-2 rounded-lg">
                                                <Image src={product.image} alt={product.name} width={64} height={64} className="rounded-md" data-ai-hint="product image" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{product.name}</h3>
                                                    <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                                                </div>
                                             </div>
                                        ))}
                                        {selectedProducts.length === 0 && (
                                            <p className="text-center opacity-70 py-10">Select products to see them here.</p>
                                        )}
                                    </div>
                                    <div className="text-center mt-8 text-xs opacity-60">
                                        <p>Powered by VentaRapida</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

    