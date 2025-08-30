
'use client';
import { Calculator, DollarSign, PercentCircle, TrendingUp, LineChart, ChevronsUpDown, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useProduct } from '@/context/ProductContext';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


function FinancePage() {
  const { products } = useProduct();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [margin, setMargin] = useState(0);
  const [profit, setProfit] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  useEffect(() => {
    if (selectedProduct) {
      const { price, cost } = selectedProduct;
      if (price > 0) {
        const profitValue = price - cost;
        const marginValue = cost > 0 ? (profitValue / price) * 100 : 100;
        setProfit(profitValue);
        setMargin(marginValue);
      } else {
        setProfit(0);
        setMargin(0);
      }
    } else {
      setProfit(0);
      setMargin(0);
    }
  }, [selectedProduct]);

  const { totalCostValue, totalRetailValue, potentialProfit, averageMargin } = useMemo(() => {
    if (products.length === 0) {
      return { totalCostValue: 0, totalRetailValue: 0, potentialProfit: 0, averageMargin: 0 };
    }
    const totalCostValue = products.reduce((acc, p) => acc + p.cost * p.stock, 0);
    const totalRetailValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const potentialProfit = totalRetailValue - totalCostValue;
    
    const totalMargin = products.reduce((acc, p) => {
        if (p.price > 0) {
            return acc + ((p.price - p.cost) / p.price);
        }
        return acc;
    }, 0);
    const validProductsForMargin = products.filter(p => p.price > 0).length;
    const averageMargin = validProductsForMargin > 0 ? (totalMargin / validProductsForMargin) * 100 : 0;


    return { totalCostValue, totalRetailValue, potentialProfit, averageMargin };
  }, [products]);


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
            Herramientas y métricas clave para mejorar la rentabilidad de tu negocio.
        </p>

        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Rentabilidad del Inventario</CardTitle>
                    <CardDescription>Una vista general del potencial financiero de tu stock actual.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><LineChart /> Valor del Inventario (Costo)</div>
                        <div className="text-2xl font-bold mt-1">${totalCostValue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><TrendingUp /> Valor de Venta Potencial</div>
                        <div className="text-2xl font-bold mt-1">${totalRetailValue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><DollarSign /> Ganancia Bruta Potencial</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">${potentialProfit.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><PercentCircle /> Margen de Ganancia Promedio</div>
                        <div className="text-2xl font-bold mt-1">{averageMargin.toFixed(2)}%</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <CardTitle>Calculadora de Margen de Ganancia</CardTitle>
                </div>
                <CardDescription className="text-center">
                    Selecciona un producto para calcular su rentabilidad individual.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Seleccionar Producto</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={comboboxOpen}
                                className="w-full justify-between"
                                >
                                {selectedProductId
                                    ? products.find((p) => p.id === selectedProductId)?.name
                                    : "Selecciona un producto..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar producto..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontró ningún producto.</CommandEmpty>
                                        <CommandGroup>
                                            {products.map((p) => (
                                                <CommandItem
                                                key={p.id}
                                                value={p.name}
                                                onSelect={() => {
                                                    setSelectedProductId(p.id);
                                                    setComboboxOpen(false);
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedProductId === p.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {p.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {selectedProduct && (
                        <div className="max-w-sm mx-auto w-full space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                <Label htmlFor="cost">Costo del Producto ($)</Label>
                                <Input id="cost" type="number" readOnly value={selectedProduct.cost}/>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="price">Precio de Venta ($)</Label>
                                <Input id="price" type="number" readOnly value={selectedProduct.price}/>
                                </div>
                            </div>
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

export default FinancePage;
