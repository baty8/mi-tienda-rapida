
"use client"
import { AlertTriangle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProduct } from '@/context/ProductContext'

export function StockAlert() {
  const { products } = useProduct();
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <div className='flex flex-col'>
            <CardTitle>Alerta de Stock Bajo</CardTitle>
            <CardDescription>Productos con menos de 10 unidades.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                    <TableCell className="font-medium truncate max-w-40">{product.name}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{product.stock}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
