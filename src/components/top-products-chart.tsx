'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/context/ProductContext";
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";

const chartConfig = {
  stock: {
    label: "Stock",
    color: "hsl(var(--primary))",
  },
  price: {
    label: "Precio ($)",
    color: "hsl(var(--secondary))",
  }
} satisfies ChartConfig

export function TopProductsChart() {
    const { products } = useProduct();

    const top5ByStock = useMemo(() => {
        return [...products]
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5)
            .map(p => ({ name: p.name, stock: p.stock }));
    }, [products]);

    const top5ByPrice = useMemo(() => {
        return [...products]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5)
            .map(p => ({ name: p.name, price: p.price }));
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
                        <BarChart data={top5ByStock} layout="vertical" margin={{ left: 10, right: 30 }}>
                             <CartesianGrid horizontal={false} />
                             <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                                width={100}
                                className="text-xs"
                             />
                             <XAxis dataKey="stock" type="number" hide />
                             <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                             <Bar dataKey="stock" fill="var(--color-stock)" radius={4} />
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
                        <BarChart data={top5ByPrice} layout="vertical" margin={{ left: 10, right: 30 }}>
                             <CartesianGrid horizontal={false} />
                             <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                                width={100}
                                className="text-xs"
                             />
                             <XAxis dataKey="price" type="number" hide />
                              <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" formatter={(value) => `$${value}`} />} />
                             <Bar dataKey="price" fill="var(--color-price)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
