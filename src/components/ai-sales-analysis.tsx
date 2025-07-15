"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useProduct } from "@/context/ProductContext";
import { getSalesAnalysis, type SalesAnalysisInput } from "@/ai/flows/sales-analysis-flow";

const isConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export function AiSalesAnalysis() {
    const { products } = useProduct();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasSalesData = false; // Placeholder for when sales data is actually available

    const fetchAnalysis = useCallback(async () => {
        if (!isConfigured || !hasSalesData) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            // This would be replaced with real sales data
            const salesData: SalesAnalysisInput['products'] = products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                cost: p.cost,
                unitsSoldThisWeek: Math.floor(Math.random() * p.stock/2),
                unitsSoldLastWeek: Math.floor(Math.random() * p.stock/2),
            }));

            const result = await getSalesAnalysis({ products: salesData });
            setAnalysis(result.analysis);
        } catch (err) {
            console.error(err);
            setError("Hubo un error al generar el análisis. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [products, hasSalesData]);

    const renderContent = () => {
        if (!isConfigured) {
            return <p className="text-sm text-muted-foreground">Configura tu API Key de Gemini para activar los análisis de ventas inteligentes.</p>
        }
        if (!hasSalesData) {
             return <p className="text-sm text-muted-foreground">Cuando comiences a registrar ventas, la IA analizará tus datos y te dará consejos prácticos aquí para ayudarte a crecer.</p>
        }
        if (loading) {
            return (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            )
        }
        if (error) {
            return <p className="text-sm text-destructive">{error}</p>
        }
        if (analysis) {
             return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis}</p>
        }
        return null;
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>Análisis de Ventas con IA</CardTitle>
                    </div>
                    {isConfigured && hasSalesData && (
                        <Button variant="outline" size="sm" onClick={fetchAnalysis} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Re-analizar"}
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Un resumen inteligente de tu rendimiento y consejos para mejorar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {renderContent()}
            </CardContent>
        </Card>
    );
}
