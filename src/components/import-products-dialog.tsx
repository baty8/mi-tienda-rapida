
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
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, Loader2 } from 'lucide-react';
import { useProduct } from '@/context/ProductContext';
import { toast } from 'sonner';
import Papa from 'papaparse';
import type { Product } from '@/types';

type StagingProduct = Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image_urls' | 'in_catalog' | 'user_id' | 'scheduled_republish_at'> & { row: number };

export function ImportProductsDialog() {
  const { importProducts, fetchProducts } = useProduct();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });
  
  const handleDownloadTemplate = () => {
    const headers = "name,price,sku,description,cost,stock,visible";
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "plantilla_productos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleImport = async () => {
    if (!file) {
      toast.error('Error', { description: 'Por favor, selecciona un archivo CSV.' });
      return;
    }
    setIsImporting(true);

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const productsToImport: StagingProduct[] = [];
            const errors: string[] = [];

            results.data.forEach((row: any, index) => {
                const rowIndex = index + 2; // +1 for header, +1 for 0-index
                if (!row.name || !row.price) {
                    errors.push(`Fila ${rowIndex}: Faltan el nombre o el precio.`);
                    return;
                }
                
                const price = parseFloat(row.price);
                if (isNaN(price)) {
                    errors.push(`Fila ${rowIndex}: El precio no es un número válido.`);
                    return;
                }

                productsToImport.push({
                    name: row.name,
                    price: price,
                    sku: row.sku || '',
                    description: row.description || '',
                    cost: row.cost ? parseFloat(row.cost) : 0,
                    stock: row.stock ? parseInt(row.stock, 10) : 0,
                    visible: row.visible ? ['true', '1', 'yes'].includes(row.visible.toLowerCase()) : true,
                    row: rowIndex,
                });
            });

            if (errors.length > 0) {
                toast.error('Errores en el archivo', { description: errors.join(' ') });
                setIsImporting(false);
                return;
            }

            if (productsToImport.length > 0) {
                const { successCount, errorCount } = await importProducts(productsToImport);
                toast.success('Importación completada', {
                    description: `${successCount} productos importados, ${errorCount} fallaron.`,
                });
                if (successCount > 0) {
                  await fetchProducts();
                }
            } else {
                 toast.info('Nada que importar', { description: 'El archivo CSV estaba vacío o no contenía datos válidos.'});
            }

            setIsImporting(false);
            setFile(null);
            setOpen(false);
        },
        error: (error: any) => {
             toast.error('Error al procesar el archivo', { description: error.message });
             setIsImporting(false);
        }
    });

  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Importar Productos</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV para añadir múltiples productos a la vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2 rounded-lg border border-dashed p-4">
                <h3 className="font-semibold">Instrucciones y Plantilla</h3>
                <p className="text-sm text-muted-foreground">
                    Asegúrate de que tu archivo CSV tenga las siguientes cabeceras: <br />
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">name</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">price</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">sku</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">description</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">cost</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">stock</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">visible</code>.
                </p>
                <p className="text-xs text-muted-foreground">
                    <span className="font-bold">name</span> y <span className="font-bold">price</span> son obligatorios. Las demás columnas son opcionales.
                </p>
                <Button variant="secondary" size="sm" onClick={handleDownloadTemplate}>
                    Descargar Plantilla CSV
                </Button>
            </div>

            <div {...getRootProps()} className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                <input {...getInputProps()} />
                <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                {file ? (
                    <p className="text-sm font-semibold">{file.name}</p>
                ) : isDragActive ? (
                    <p className="text-sm text-center text-muted-foreground">Suelta el archivo CSV aquí...</p>
                ) : (
                    <p className="text-sm text-center text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                )}
                 <p className="text-xs text-muted-foreground">Solo archivos .csv</p>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>Cancelar</Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2"/>}
            {isImporting ? 'Importando...' : 'Importar Archivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
