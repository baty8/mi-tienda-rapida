'use client';

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/context/ProductContext";
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";

const chartConfig = {
  stock: {
    label: "Stock",
    color: "hsl(var(--chart-1))",
  },
  price: {
    label: "Precio ($)",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig

const truncateString = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};


export function TopProductsChart() {
    const { products } = useProduct();

    const top5ByStock = useMemo(() => {
        return [...products]
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5)
            .map(p => ({ 
                name: p.name, 
                displayName: truncateString(p.name, 20),
                stock: p.stock 
            }));
    }, [products]);

    const top5ByPrice = useMemo(() => {
        return [...products]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5)
            .map(p => ({ 
                name: p.name, 
                displayName: truncateString(p.name, 20),
                price: p.price 
            }));
    }, [products]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Top 5 Productos por Stock</CardTitle>
                    <CardDescription>Tus productos con más unidades disponibles.</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={top5ByStock} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorStock" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="var(--color-stock)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-stock)" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                             <CartesianGrid horizontal={false} />
                             <YAxis 
                                dataKey="displayName" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                                width={120}
                                className="text-xs fill-muted-foreground"
                             />
                             <XAxis dataKey="stock" type="number" hide />
                             <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                             <Bar dataKey="stock" fill="url(#colorStock)" radius={5}>
                                <LabelList dataKey="stock" position="right" offset={8} className="fill-foreground font-semibold text-sm" />
                             </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Top 5 Productos por Precio</CardTitle>
                    <CardDescription>Tus productos de mayor valor.</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                   <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={top5ByPrice} layout="vertical" margin={{ left: 10, right: 50, top: 5, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                             <CartesianGrid horizontal={false} />
                             <YAxis 
                                dataKey="displayName" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                                width={120}
                                className="text-xs fill-muted-foreground"
                             />
                             <XAxis dataKey="price" type="number" hide />
                              <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" formatter={(value, name, props) => `$${props.payload.price.toFixed(2)}`} />} />
                             <Bar dataKey="price" fill="url(#colorPrice)" radius={5}>
                                <LabelList dataKey="price" position="right" offset={8} className="fill-foreground font-semibold text-sm" formatter={(value: number) => `$${value.toFixed(2)}`} />
                             </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
