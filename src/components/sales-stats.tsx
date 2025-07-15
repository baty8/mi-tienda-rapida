
"use client"
import React, { useEffect, useState } from 'react';
import { DollarSign, Package, CreditCard, TrendingDown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProduct } from '@/context/ProductContext';
import { Product } from '@/types';

const generateStats = (products: Product[]) => {
    if (products.length === 0) {
        return {
            totalRevenue: 0,
            totalCosts: 0,
            orders: 0,
            revenueChange: 0,
            costsChange: 0,
            ordersChange: 0,
        }
    }

    const orders = Math.floor(Math.random() * products.length * 5) + 5;
    const unitsSold = orders + Math.floor(Math.random() * orders * 2);
    // Simulate selling a fraction of each product
    const soldFraction = unitsSold / products.reduce((acc, p) => acc + p.stock, 1);

    const totalRevenue = products.reduce((acc, p) => acc + p.price * p.stock * soldFraction, 0);
    const totalCosts = products.reduce((acc, p) => acc + p.cost * p.stock * soldFraction, 0);

    return {
        totalRevenue: totalRevenue,
        totalCosts: totalCosts,
        orders: orders,
        revenueChange: (Math.random() * 40 - 10).toFixed(1),
        costsChange: (Math.random() * 30 - 5).toFixed(1),
        ordersChange: (Math.random() * 50).toFixed(1),
    }
}


export function SalesStats() {
  const { products } = useProduct();
  const [stats, setStats] = useState(generateStats([]));

  useEffect(() => {
      setStats(generateStats(products));
  }, [products]);

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Select defaultValue="this-week">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="this-week">Esta Semana</SelectItem>
                    <SelectItem value="this-month">Este Mes</SelectItem>
                    <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground">{stats.revenueChange >= 0 ? `+${stats.revenueChange}`: stats.revenueChange}% desde la semana pasada</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">${stats.totalCosts.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground">{stats.costsChange >= 0 ? `+${stats.costsChange}`: stats.costsChange}% desde la semana pasada</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+{stats.orders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stats.ordersChange >= 0 ? `+${stats.ordersChange}`: stats.ordersChange}% desde la semana pasada</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
