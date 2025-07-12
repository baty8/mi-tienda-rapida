
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

export function ConversionRate() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const visits = 12345;
  const sales = 2350;
  const conversionRate = (sales / visits) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>Visits</span>
                </div>
                <span className="font-semibold">{isClient ? visits.toLocaleString() : visits}</span>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Sales</span>
                </div>
                <span className="font-semibold">{isClient ? sales.toLocaleString() : sales}</span>
            </div>
            <div className="space-y-2">
                 <Progress value={conversionRate} className="h-2" />
                 <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rate</span>
                    <span className="text-sm font-bold text-primary">{conversionRate.toFixed(2)}%</span>
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
