
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';
import { Switch } from './ui/switch';
import type { Product } from '@/types';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

type EditProductDialogProps = {
    product: Product;
    onUpdateProduct: (productId: string, data: Partial<Product>) => void;
    onClose: () => void;
};

export function EditProductDialog({ product, onUpdateProduct, onClose }: EditProductDialogProps) {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [visible, setVisible] = useState(product.visible);
  const [image, setImage] = useState(product.image);

  useEffect(() => {
    // Reset state if product prop changes
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setStock(product.stock);
    setVisible(product.visible);
    setImage(product.image);
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || price <= 0) {
       toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, completa el nombre y el precio.',
      });
      return;
    }
    onUpdateProduct(product.id, {
        name,
        description,
        price,
        stock,
        visible,
        image,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            onClose();
        }
        setOpen(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Editar Producto</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de tu producto.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label>Foto del Producto</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file-edit" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted relative">
                        {image ? (
                            <Image src={image} alt="Vista previa del producto" layout="fill" objectFit="contain" className="rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Haz clic para subir</span><br/>o arrastra y suelta</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                            </div>
                        )}
                        <input id="dropzone-file-edit" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="stock">Stock Disponible</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="visibility-switch" checked={visible} onCheckedChange={setVisible} />
                <Label htmlFor="visibility-switch">Visible en la tienda</Label>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
