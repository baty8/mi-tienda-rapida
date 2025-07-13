
'use client';

import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  BookOpen,
  Landmark,
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
import { ProductTable } from '@/components/product-table';
import { AddProductDialog } from '@/components/add-product-dialog';
import { useProduct } from '@/context/ProductContext';
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import Link from 'next/link';

export default function ProductsPage() {
  const { addProduct } = useProduct();

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
              <SidebarMenuButton asChild isActive={true}>
                <Link href="/products">
                  <Package />
                  Productos
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
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/catalog">
                  <BookOpen />
                  Catálogo
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/finance">
                  <Landmark />
                  Finanzas
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/profile">
                  <User />
                  Perfil
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
            Productos
          </h2>
          <div className="flex items-center gap-4">
            <BulkUploadDialog />
            <AddProductDialog onAddProduct={addProduct} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold font-headline">Productos</h2>
              <p className="text-muted-foreground">
                Gestiona y organiza tus productos aquí.
              </p>
            </div>
          </div>
          <ProductTable />
        </main>
      </div>
    </div>
  );
}
