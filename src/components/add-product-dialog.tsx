
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, UploadCloud } from 'lucide-react';
import { Switch } from './ui/switch';
import type { Product } from '@/types';

type AddProductDialogProps = {
    onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category'>) => void;
};

export function AddProductDialog({ onAddProduct }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [visible, setVisible] = useState(true);
  const [image, setImage] = useState('https://placehold.co/80x80.png');

  const handleSave = () => {
    if (!name || price <= 0) {
      // Basic validation
      alert('Por favor, completa el nombre y el precio del producto.');
      return;
    }
    onAddProduct({
        name,
        description,
        price,
        stock,
        visible,
        image,
    });
    // Reset form and close dialog
    setName('');
    setDescription('');
    setPrice(0);
    setStock(0);
    setVisible(true);
    setImage('https://placehold.co/80x80.png');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Añadir Nuevo Producto</DialogTitle>
          <DialogDescription>
            Rellena los detalles para añadir un nuevo producto a tu tienda.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" placeholder="Ej: Taza de Cerámica Artesanal" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Describe tu producto..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label>Foto del Producto</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Haz clic para subir</span><br/>o arrastra y suelta</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" />
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input id="price" type="number" placeholder="25.00" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="stock">Stock Disponible</Label>
                    <Input id="stock" type="number" placeholder="150" value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="visibility-switch" checked={visible} onCheckedChange={setVisible} />
                <Label htmlFor="visibility-switch">Visible en la tienda</Label>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Producto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
