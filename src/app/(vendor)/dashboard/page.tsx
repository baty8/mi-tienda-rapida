
'use client';
import { SalesStats } from '@/components/sales-stats';
import { SalesChart } from '@/components/sales-chart';
import { ConversionRate } from '@/components/conversion-rate';
import { useProduct } from '@/context/ProductContext';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { AiSalesAnalysis } from '@/components/ai-sales-analysis';
import { LineChart } from 'lucide-react';
import { StockAlert } from '@/components/stock-alert';

function DashboardPage() {
    const { products } = useProduct();

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h2 className="text-2xl font-bold font-headline md:hidden">Dashboard</h2>
           <div className="flex items-center gap-4">
              <ThemeToggle />
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
                      <div className="lg:col-span-2 space-y-6">
                          <SalesChart />
                      </div>
                      <div className="space-y-6">
                          <ConversionRate />
                          <StockAlert />
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
    </>
  );
}

export default DashboardPage;
