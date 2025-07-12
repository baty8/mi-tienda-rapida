
"use client"
import React, { useEffect, useState } from 'react';
import { DollarSign, Package, CreditCard } from 'lucide-react'
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
            orders: 0,
            unitsSold: 0,
            avgOrderValue: 0,
            revenueChange: 0,
            ordersChange: 0,
            unitsChange: 0,
            avgOrderChange: 0,
        }
    }

    const orders = Math.floor(Math.random() * products.length * 5) + 5;
    const unitsSold = orders + Math.floor(Math.random() * orders * 2);
    const totalRevenue = products.reduce((acc, p) => acc + p.price * (Math.random() * 5), 0) * (unitsSold / products.length);
    const avgOrderValue = orders > 0 ? totalRevenue / orders : 0;

    return {
        totalRevenue: totalRevenue,
        orders: orders,
        unitsSold: unitsSold,
        avgOrderValue: avgOrderValue,
        revenueChange: (Math.random() * 40 - 10).toFixed(1),
        ordersChange: (Math.random() * 50).toFixed(1),
        unitsChange: (Math.random() * 30 - 5).toFixed(1),
        avgOrderChange: (Math.random() * 15 - 5).toFixed(1),
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground">{stats.revenueChange >= 0 ? `+${stats.revenueChange}`: stats.revenueChange}% desde el mes pasado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+{stats.orders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stats.ordersChange >= 0 ? `+${stats.ordersChange}`: stats.ordersChange}% desde el mes pasado</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+{stats.unitsSold.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stats.unitsChange >= 0 ? `+${stats.unitsChange}`: stats.unitsChange}% desde el mes pasado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Promedio de Orden</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">${stats.avgOrderValue.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground">{stats.avgOrderChange >= 0 ? `+${stats.avgOrderChange}`: stats.avgOrderChange}% desde el mes pasado</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
