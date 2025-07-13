
'use client';

import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  BookOpen,
  LogOut,
  TrendingUp,
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
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function ProductsPage() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

  return (
    <div className="flex min-h-screen w-full flex-row">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary group-data-[state=collapsed]:hidden">
              VentaRapida
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/products'} tooltip="Productos">
                <Link href="/products">
                  <Package />
                  <span>Productos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                <Link href="/dashboard">
                  <LineChart />
                   <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/catalog'} tooltip="Catálogo">
                <Link href="/catalog">
                  <BookOpen />
                  <span>Catálogo</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/analysis')} tooltip="Análisis">
                <Link href="/analysis">
                  <TrendingUp />
                  <span>Análisis</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/profile'} tooltip="Perfil">
                <Link href="/profile">
                  <User />
                  <span>Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                    <LogOut />
                    <span>Cerrar Sesión</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar>
              <AvatarImage
                src="https://placehold.co/40x40.png"
                alt="User avatar"
                data-ai-hint="male user"
              />
              <AvatarFallback>VR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[state=collapsed]:hidden">
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
            <AddProductDialog />
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
