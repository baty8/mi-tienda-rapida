
'use client';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  Landmark,
  Calculator,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AnalysisPage() {
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [margin, setMargin] = useState(0);
  const [profit, setProfit] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const calculateMargin = () => {
    if(price > 0 && cost > 0) {
        const profitValue = price - cost;
        const marginValue = (profitValue / price) * 100;
        setProfit(profitValue);
        setMargin(marginValue);
    } else {
        setProfit(0);
        setMargin(0);
    }
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
          <h2 className="text-2xl font-bold font-headline md:hidden">
            Análisis de Mercado
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold font-headline">
                Análisis de Mercado
              </h2>
              <p className="text-muted-foreground">
                Herramientas para entender y mejorar tu negocio.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <CardTitle>Calculadora de Margen</CardTitle>
                </div>
                <CardDescription>
                  Calcula tu margen de ganancia para cualquier producto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo ($)</Label>
                    <Input id="cost" type="number" placeholder="15.00" value={cost || ''} onChange={(e) => setCost(parseFloat(e.target.value) || 0)}/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="price">Precio de Venta ($)</Label>
                    <Input id="price" type="number" placeholder="25.00" value={price || ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}/>
                  </div>
                </div>
                <Button className="w-full" onClick={calculateMargin}>Calcular Margen</Button>
                <div className="mt-4 rounded-lg border bg-muted p-4 space-y-2">
                    <div className="flex justify-between font-medium">
                        <span>Ganancia:</span>
                        <span>${profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-primary">
                        <span>Margen:</span>
                        <span>{margin.toFixed(2)}%</span>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for future analysis tools */}
            <Card className="flex flex-col items-center justify-center bg-muted/50 border-dashed">
                <CardHeader className="text-center">
                    <CardTitle>Próximamente</CardTitle>
                    <CardDescription>Nuevas herramientas de análisis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TrendingUp className="h-12 w-12 text-muted-foreground"/>
                </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
