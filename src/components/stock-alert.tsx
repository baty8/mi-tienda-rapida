
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

const lowStockProducts = [
    { name: "Minimalist Desk Lamp", stock: 3 },
    { name: "Gourmet Coffee Beans", stock: 5 },
    { name: "Artisan Ceramic Mug", stock: 2 },
];

export function StockAlert() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <div className='flex flex-col'>
            <CardTitle>Critical Stock Alert</CardTitle>
            <CardDescription>Products with less than 5 units in stock.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockProducts.map((product) => (
                <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{product.stock}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
