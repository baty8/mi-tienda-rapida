
'use client';

import Link from 'next/link';
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
import { SalesStats } from '@/components/sales-stats';
import { SalesChart } from '@/components/sales-chart';
import { ConversionRate } from '@/components/conversion-rate';
import { useProduct } from '@/context/ProductContext';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '@/lib/supabaseClient';


export default function DashboardPage() {
    const { products } = useProduct();
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
              <SidebarMenuButton asChild isActive={pathname.startsWith('/finance')} tooltip="Finanzas">
                <Link href="/finance">
                  <TrendingUp />
                  <span>Finanzas</span>
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
              <AvatarImage src="https://placehold.co/40x40" alt="User avatar" data-ai-hint="male user" />
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
            <h2 className="text-2xl font-bold font-headline md:hidden">Dashboard</h2>
             <div className="flex items-center gap-4">
                {/* Potentially add actions here */}
             </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold font-headline">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Un resumen del rendimiento de tu tienda.
                    </p>
                </div>
            </div>
            
            {products.length > 0 ? (
                <div className="grid gap-6">
                    <SalesStats />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <SalesChart />
                        </div>
                        <div className="space-y-6">
                            <ConversionRate />
                        </div>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <LineChart className="h-16 w-16 mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
                        <p className="text-muted-foreground">
                            Añade algunos productos para empezar a ver tus estadísticas de ventas.
                        </p>
                    </CardContent>
                </Card>
            )}

        </main>
      </div>
    </div>
  );
}
