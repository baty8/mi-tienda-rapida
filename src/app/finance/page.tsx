
'use client';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  Landmark,
  FileInput,
  Download,
  Calculator,
  FileText,
  CreditCard,
  BookOpen,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function FinancePage() {
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [margin, setMargin] = useState(0);
  const [profit, setProfit] = useState(0);

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
            <h1 className="text-2xl font-bold font-headline text-primary">
              VentaRapida
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
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
              <SidebarMenuButton asChild isActive={true}>
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
              <AvatarImage src="https://placehold.co/40x40" alt="User avatar" data-ai-hint="male user" />
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
            Herramientas Financieras
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold font-headline">
                Herramientas Financieras
              </h2>
              <p className="text-muted-foreground">
                Administra las finanzas de tu tienda con facilidad.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle>Conciliación Automática de Pagos</CardTitle>
                </div>
                <CardDescription>
                  Sube los extractos de tu procesador de pagos para conciliar transacciones automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="payment-processor">Procesador de Pagos</Label>
                    <Select>
                        <SelectTrigger id="payment-processor">
                            <SelectValue placeholder="Selecciona un procesador" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="mercado-pago">Mercado Pago</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="statement-file">Subir Extracto</Label>
                    <Input id="statement-file" type="file" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <FileInput className="mr-2 h-4 w-4" /> Conciliar Pagos
                </Button>
              </CardFooter>
            </Card>

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
                    <Input id="cost" type="number" placeholder="15.00" value={cost} onChange={(e) => setCost(parseFloat(e.target.value))}/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="price">Precio de Venta ($)</Label>
                    <Input id="price" type="number" placeholder="25.00" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))}/>
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
          </div>
        </main>
      </div>
    </div>
  );
}
