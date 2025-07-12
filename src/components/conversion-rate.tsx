
"use client"
import { Eye, ShoppingCart } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from 'react';
import { useProduct } from '@/context/ProductContext';

const generateData = (productCount: number) => {
    if (productCount === 0) {
        return { visits: 0, sales: 0, conversionRate: 0 };
    }
    const visits = Math.floor(Math.random() * 10000) + 500;
    const sales = Math.floor(Math.random() * (visits / 10)) + 50;
    const conversionRate = (sales / visits) * 100;
    return { visits, sales, conversionRate };
}


export function ConversionRate() {
  const { products } = useProduct();
  const [data, setData] = useState(generateData(0));

  useEffect(() => {
      setData(generateData(products.length));
  }, [products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasa de Conversión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>Visitas</span>
                </div>
                <span className="font-semibold">{data.visits.toLocaleString()}</span>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Pedidos</span>
                </div>
                <span className="font-semibold">{data.sales.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
                 <Progress value={data.conversionRate} className="h-2" />
                 <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasa</span>
                    <span className="text-sm font-bold text-primary">{data.conversionRate.toFixed(2)}%</span>
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
