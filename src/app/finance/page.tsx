
'use client';
import { Calculator, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { VendorLayout } from '@/components/vendor-layout';
import withAuth from '@/components/withAuth';

function FinancePage() {
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
    <VendorLayout>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-2xl font-bold font-headline md:hidden">
          Análisis Financiero
        </h2>
         <div className="flex items-center gap-4">
              <ThemeToggle />
          </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold font-headline">
              Análisis Financiero
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
    </VendorLayout>
  );
}

export default withAuth(FinancePage);
