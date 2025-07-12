
"use client"

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart"
import { useProduct } from '@/context/ProductContext';

const chartConfig = {
  thisWeek: {
    label: "Esta Semana",
    color: "hsl(var(--primary))",
  },
  lastWeek: {
    label: "Semana Pasada",
    color: "hsl(var(--secondary-foreground))",
  },
} satisfies ChartConfig;

const generateChartData = (productCount: number) => {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    if (productCount === 0) {
        return days.map(day => ({ day, lastWeek: 0, thisWeek: 0 }));
    }
    return days.map(day => ({
        day,
        lastWeek: Math.floor(Math.random() * 5000) + 1000,
        thisWeek: Math.floor(Math.random() * 5000) + 1000,
    }));
}


export function SalesChart() {
  const { products } = useProduct();
  const [data, setData] = useState(generateChartData(0));

  useEffect(() => {
    setData(generateChartData(products.length));
  }, [products]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación de Ventas</CardTitle>
        <CardDescription>Esta Semana vs. Semana Pasada</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar dataKey="lastWeek" fill="var(--color-lastWeek)" radius={4} />
            <Bar dataKey="thisWeek" fill="var(--color-thisWeek)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
