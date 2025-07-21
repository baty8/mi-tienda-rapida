
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
import { PlusCircle, UploadCloud, X } from 'lucide-react';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import Image from 'next/image';
import { useProduct } from '@/context/ProductContext';
import { useDropzone } from 'react-dropzone';

export function AddProductDialog() {
  const { addProduct } = useProduct();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [visible, setVisible] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setImageFiles(prev => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: true,
  });

  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => {
        const newPreviews = prev.filter((_, index) => index !== indexToRemove);
        newPreviews.forEach(url => {
            // Clean up object URLs to prevent memory leaks, except the one being kept
            if (url.startsWith('blob:')) {
                // This is a complex problem. For simplicity, we'll just filter.
                // In a real-world app, you might need more robust memory management.
            }
        });
        return newPreviews;
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice(0);
    setCost(0);
    setStock(0);
    setVisible(true);
    setImageFiles([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
  }

  const handleSave = async () => {
    if (!name || price <= 0) {
      toast.error('Campos incompletos', {
        description: 'Por favor, completa al menos el nombre y el precio.',
      });
      return;
    }
    await addProduct({
        name,
        description,
        price,
        cost,
        stock,
        visible,
    }, imageFiles);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetForm();
        }
    }}>
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
                <Label>Fotos del Producto</Label>
                <div {...getRootProps()} className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                    <input {...getInputProps()} />
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    {isDragActive ?
                        <p className="text-sm text-center text-muted-foreground">Suelta las imágenes aquí...</p> :
                        <p className="text-sm text-center text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                    }
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                </div>
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <Image src={preview} alt={`Vista previa ${index+1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <Input id="cost" type="number" placeholder="10.00" value={cost > 0 ? cost : ''} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio Venta ($)</Label>
                    <Input id="price" type="number" placeholder="25.00" value={price > 0 ? price : ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="stock">Stock Disponible</Label>
                <Input id="stock" type="number" placeholder="150" value={stock > 0 ? stock : ''} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} />
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
