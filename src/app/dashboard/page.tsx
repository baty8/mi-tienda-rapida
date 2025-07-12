import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SalesStats } from '@/components/sales-stats';
import { SalesChart } from '@/components/sales-chart';
import { StockAlert } from '@/components/stock-alert';
import { ConversionRate } from '@/components/conversion-rate';


export default function DashboardPage() {
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
              <SidebarMenuButton asChild isActive={true}>
                <Link href="/dashboard">
                  <LineChart />
                  Dashboard
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
                        An overview of your store's performance.
                    </p>
                </div>
            </div>
            
            <div className="grid gap-6">
                <SalesStats />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <SalesChart />
                    </div>
                    <div className="space-y-6">
                        <StockAlert />
                        <ConversionRate />
                    </div>
                </div>
            </div>

        </main>
      </div>
    </div>
  );
}
