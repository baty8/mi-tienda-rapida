
"use client";

import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useProduct } from '@/context/ProductContext';
import { analyzeSales } from '@/ai/flows/sales-analysis-flow';
import type { SalesAnalysisInput } from '@/ai/flows/sales-analysis-flow';
import { Button } from './ui/button';

// The 'NEXT_PUBLIC_' prefix makes this variable available in the browser
const isConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'true';

// Helper function to create realistic mock sales data based on products
const generateMockSales = (products: SalesAnalysisInput['products']): SalesAnalysisInput['sales'] => {
    if (products.length === 0) return [];

    const sales = [];
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const salesCount = Math.floor(Math.random() * 10) + 5; // 5 to 14 sales records

    for (let i = 0; i < salesCount; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const unitsSold = Math.floor(Math.random() * 5) + 1; // 1 to 5 units
        sales.push({
            productId: product.id,
            productName: product.name,
            unitsSold,
            totalRevenue: unitsSold * product.price,
            day: days[Math.floor(Math.random() * days.length)]
        });
    }
    return sales;
};


export function AiSalesAnalysis() {
    const { products } = useProduct();
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const getAnalysis = async () => {
        setLoading(true);
        setAnalysis('');

        try {
            // We'll use mock sales data for demonstration purposes.
            // In a real app, this would come from your database.
            const productDataForAnalysis = products.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, cost: p.cost }));
            const mockSales = generateMockSales(productDataForAnalysis);
            
            const response = await analyzeSales({
                products: productDataForAnalysis,
                sales: mockSales
            });

            setAnalysis(response.analysis);

        } catch (error) {
            console.error(error);
            setAnalysis("No se pudo generar el análisis. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };
    
    // Automatically generate analysis on component mount if configured
    useEffect(() => {
        if (isConfigured && products.length > 0) {
            getAnalysis();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]); // Re-run if products change

    const renderContent = () => {
        if (!isConfigured) {
            return <p className="text-sm text-muted-foreground">Esta es una función de demostración. Configura una API Key para activar los análisis de ventas inteligentes.</p>
        }
        if (products.length === 0) {
            return <p className="text-sm text-muted-foreground">Añade algunos productos para poder generar un análisis de ventas.</p>
        }
        if (loading) {
            return (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analizando datos de ventas...</span>
                </div>
            )
        }
        return <p className="text-sm">{analysis}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>Análisis de Ventas con IA</CardTitle>
                    </div>
                     {isConfigured && products.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={getAnalysis} disabled={loading}>
                           Refrescar Análisis
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Un resumen inteligente de tu rendimiento y consejos para mejorar.
                </CardDescription>
            </CardHeader>
            <CardContent>
               {renderContent()}
            </CardContent>
        </Card>
    );
}
