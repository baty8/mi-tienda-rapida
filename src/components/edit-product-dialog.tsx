
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
import { UploadCloud, X } from 'lucide-react';
import { Switch } from './ui/switch';
import type { Product } from '@/types';
import { toast } from 'sonner';
import Image from 'next/image';
import { useProduct } from '@/context/ProductContext';
import { useDropzone } from 'react-dropzone';

type EditProductDialogProps = {
    product: Product;
    onClose: () => void;
};

export function EditProductDialog({ product, onClose }: EditProductDialogProps) {
  const { updateProduct } = useProduct();
  const [open, setOpen] = useState(true);
  
  // Form state
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price);
  const [cost, setCost] = useState(product.cost);
  const [stock, setStock] = useState(product.stock);
  const [visible, setVisible] = useState(product.visible);
  
  // Image handling state
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(product.image_urls);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setCost(product.cost);
    setStock(product.stock);
    setVisible(product.visible);
    setExistingImageUrls(product.image_urls);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  }, [product]);

  const onDrop = (acceptedFiles: File[]) => {
    setNewImageFiles(prev => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: true,
  });

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleSave = async () => {
    if (!name || price <= 0) {
       toast.error('Campos incompletos', {
        description: 'Por favor, completa el nombre y el precio.',
      });
      return;
    }
    
    await updateProduct(product.id, {
        name,
        description,
        price,
        cost,
        stock,
        visible,
    }, newImageFiles, existingImageUrls);

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
                <Label>Fotos del Producto</Label>
                <div {...getRootProps()} className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                    <input {...getInputProps()} />
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    {isDragActive ?
                        <p className="text-sm text-center text-muted-foreground">Suelta las imágenes aquí...</p> :
                        <p className="text-sm text-center text-muted-foreground"><span className="font-semibold">Haz clic para añadir</span> o arrastra y suelta</p>
                    }
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                </div>
                 {(existingImageUrls.length > 0 || newImagePreviews.length > 0) && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {existingImageUrls.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group">
                                <Image src={url} alt={`Imagen existente ${index+1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                <button onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {newImagePreviews.map((preview, index) => (
                            <div key={`new-${index}`} className="relative group">
                                <Image src={preview} alt={`Vista previa ${index+1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                <button onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cost">Costo ($)</Label>
                    <Input id="cost" type="number" value={cost > 0 ? cost : ''} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio Venta ($)</Label>
                    <Input id="price" type="number" value={price > 0 ? price : ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="stock">Stock Disponible</Label>
                <Input id="stock" type="number" value={stock > 0 ? stock : ''} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} />
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
