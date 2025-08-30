
'use client';
import { useProduct } from '@/context/ProductContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { AlertCircle, LineChart, ShoppingBag, TrendingUp } from 'lucide-react';
import { StockAlert } from '@/components/stock-alert';
import { TopProductsChart } from '@/components/top-products-chart';

function DashboardPage() {
    const { products, loading } = useProduct();

    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <h2 className="text-xl font-bold font-headline">Dashboard</h2>
           <div className="flex items-center gap-4">
              <ThemeToggle />
           </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <p className="text-muted-foreground mb-6">
              Un resumen del rendimiento y estado de tu inventario.
          </p>
          
          {products.length > 0 ? (
              <div className="grid gap-6">
                 {/* Fila de Estadísticas Principales */}
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts}</div>
                            <p className="text-xs text-muted-foreground">Productos únicos en tu inventario.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unidades Totales en Stock</CardTitle>
                            <LineChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Suma del stock de todos los productos.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valor del Inventario (Costo)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${inventoryValue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                            <p className="text-xs text-muted-foreground">Costo total de tu stock actual.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Fila de Alertas y Gráficos */}
                 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                         <TopProductsChart />
                    </div>
                    <div className="space-y-6">
                        <StockAlert />
                    </div>
                </div>
              </div>
          ) : (
              <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                      <AlertCircle className="h-16 w-16 mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
                      <p className="text-muted-foreground">
                          Añade algunos productos para empezar a ver las estadísticas de tu tienda.
                      </p>
                  </CardContent>
              </Card>
          )}

      </main>
    </div>
  );
}

export default DashboardPage;
