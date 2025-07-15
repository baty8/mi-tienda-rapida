
"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useProduct } from "@/context/ProductContext";
import { getSalesAnalysis, type SalesAnalysisInput } from "@/ai/flows/sales-analysis-flow";

export function AiSalesAnalysis() {
    const { products } = useProduct();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalysis = useCallback(async () => {
        if (products.length === 0) {
            setLoading(false);
            setAnalysis("Añade productos para poder generar un análisis de ventas.");
            return;
        }

        setLoading(true);
        setAnalysis(null);

        try {
            // Simulate sales data for the AI flow
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
        } catch (error) {
            console.error(error);
            setAnalysis("Hubo un error al generar el análisis. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [products]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>Análisis de Ventas con IA</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchAnalysis} disabled={loading}>
                        {loading ? "Analizando..." : "Re-analizar"}
                    </Button>
                </div>
                <CardDescription>
                    Un resumen inteligente de tu rendimiento y consejos para mejorar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis}</p>
                )}
            </CardContent>
        </Card>
    );
}
