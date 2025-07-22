
"use client";

import { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { suggestPrice, type SuggestPriceOutput } from '@/ai/flows/pricing-assistant-flow';
import { toast } from 'sonner';

// The AI features are considered configured if the Supabase keys are present.
const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function AiPricingAssistant() {
  const [productCost, setProductCost] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestPriceOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const cost = parseFloat(productCost);
      if (isNaN(cost)) {
        toast.error('Error', { description: 'Por favor, introduce un costo válido.' });
        return;
      }
      const response = await suggestPrice({
        productCost: cost,
        productDescription,
        targetAudience,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast.error('Error', { description: 'No se pudo obtener una sugerencia. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setResult(null);
    setProductCost('');
    setProductDescription('');
    setTargetAudience('');
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle>Asistente de Precios con IA</CardTitle>
        </div>
        <CardDescription>
          {isConfigured
            ? "Obtén una sugerencia de precio de venta basada en la descripción, costo y público de tu producto."
            : "La funcionalidad de IA requiere la configuración de las variables de entorno de Supabase."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center h-full text-center bg-muted rounded-lg p-6">
            <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Función no disponible</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Esta herramienta requiere que la aplicación esté conectada a una base de datos.
            </p>
          </div>
        ) : result ? (
           <div className="space-y-4 text-center p-4 bg-muted rounded-lg">
                <Sparkles className="h-8 w-8 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Precio Sugerido: ${result.suggestedPrice.toFixed(2)}</h3>
                <p className="text-sm text-muted-foreground">Rango de precio recomendado: ${result.priceRange.min.toFixed(2)} - ${result.priceRange.max.toFixed(2)}</p>
                <p className="text-sm text-left border-t pt-3 mt-3">{result.suggestion}</p>
                <Button onClick={handleReset} variant="outline" className="mt-4">Hacer otra consulta</Button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-cost">Costo del Producto ($)</Label>
              <Input
                id="product-cost"
                type="number"
                placeholder="Ej: 15.00"
                value={productCost}
                onChange={(e) => setProductCost(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-desc">Descripción del Producto</Label>
              <Textarea
                id="product-desc"
                placeholder="Ej: Taza de cerámica artesanal, pintada a mano."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience">Público Objetivo</Label>
              <Input
                id="target-audience"
                placeholder="Ej: Jóvenes adultos, amantes del café y el diseño."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Obteniendo Sugerencia...' : 'Sugerir Precio'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
