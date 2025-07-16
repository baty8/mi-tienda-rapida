"use client";

import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const isConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export function AiSalesAnalysis() {
    
    const hasSalesData = false; // Placeholder for when sales data is actually available

    const renderContent = () => {
        if (!isConfigured) {
            return <p className="text-sm text-muted-foreground">Configura tu API Key de Gemini para activar los análisis de ventas inteligentes.</p>
        }
        if (!hasSalesData) {
             return <p className="text-sm text-muted-foreground">Cuando comiences a registrar ventas, la IA analizará tus datos y te dará consejos prácticos aquí para ayudarte a crecer.</p>
        }
        
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>Análisis de Ventas con IA</CardTitle>
                    </div>
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
