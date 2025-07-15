
"use client";

import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { getPriceSuggestion, type PriceSuggestionInput, type PriceSuggestionOutput } from '@/ai/flows/pricing-assistant-flow';

export function AiPricingAssistant() {
  const [productCost, setProductCost] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [suggestion, setSuggestion] = useState<PriceSuggestionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestion(null);

    const cost = parseFloat(productCost);
    if (isNaN(cost) || cost <= 0) {
        setError('Por favor, introduce un costo válido para el producto.');
        setLoading(false);
        return;
    }

    try {
      const input: PriceSuggestionInput = {
        productCost: cost,
        productDescription,
        targetAudience,
      };
      const result = await getPriceSuggestion(input);
      setSuggestion(result);
    } catch (err) {
      setError('Hubo un error al obtener la sugerencia. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle>Asistente de Precios con IA</CardTitle>
        </div>
        <CardDescription>
          Obtén una sugerencia de precio de venta basada en IA.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-desc">Descripción del Producto</Label>
            <Textarea
              id="product-desc"
              placeholder="Ej: Taza de cerámica artesanal, pintada a mano, ideal para regalo."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              required
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Obteniendo Sugerencia...' : 'Sugerir Precio'}
          </Button>
        </form>

        {error && <p className="mt-4 text-sm text-center text-destructive">{error}</p>}

        {suggestion && (
          <div className="mt-6 rounded-lg border bg-muted p-4 space-y-3 animate-in fade-in-50">
            <h4 className="font-semibold text-center">Sugerencia de la IA</h4>
            <div className='text-center'>
                <p className='text-sm text-muted-foreground'>Rango Sugerido</p>
                <p className='text-xl font-bold'>${suggestion.suggestedPriceRange.min.toFixed(2)} - ${suggestion.suggestedPriceRange.max.toFixed(2)}</p>
            </div>
             <div className='text-center bg-primary/10 p-3 rounded-md'>
                <p className='text-sm text-primary font-semibold'>Precio Óptimo Sugerido</p>
                <p className='text-3xl font-extrabold text-primary'>${suggestion.optimalPrice.toFixed(2)}</p>
            </div>
            <div>
                 <p className='text-xs text-muted-foreground mt-2 whitespace-pre-wrap'>{suggestion.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
