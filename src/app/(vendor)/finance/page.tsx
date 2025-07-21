
'use client';
import { Calculator, Wand2 } from 'lucide-react';
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
import { AiPricingAssistant } from '@/components/ai-pricing-assistant';

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
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <h2 className="text-xl font-bold font-headline">
          Análisis Financiero
        </h2>
         <div className="flex items-center gap-4">
              <ThemeToggle />
          </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground mb-6">
            Herramientas para mejorar la rentabilidad de tu negocio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Calculadora de Margen de Ganancia</CardTitle>
              </div>
              <CardDescription>
                Calcula rápidamente tu margen y ganancia para cualquier producto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo del Producto ($)</Label>
                  <Input id="cost" type="number" placeholder="15.00" value={cost || ''} onChange={(e) => setCost(parseFloat(e.target.value) || 0)}/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="price">Precio de Venta ($)</Label>
                  <Input id="price" type="number" placeholder="25.00" value={price || ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}/>
                </div>
              </div>
              <Button className="w-full" onClick={calculateMargin}>Calcular</Button>
              <div className="mt-4 rounded-lg border bg-muted p-4 space-y-2">
                  <div className="flex justify-between font-medium">
                      <span>Ganancia por unidad:</span>
                      <span className="text-green-600">${profit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary">
                      <span>Margen de Ganancia:</span>
                      <span>{margin.toFixed(2)}%</span>
                  </div>
              </div>
            </CardContent>
          </Card>
          
          <AiPricingAssistant />
          
        </div>
      </main>
    </div>
  );
}

export default FinancePage;
