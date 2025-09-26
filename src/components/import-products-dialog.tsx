

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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';


type StagingProduct = Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image_urls' | 'in_catalog' | 'user_id' | 'scheduled_republish_at' | 'sku'> & { row: number };

interface ImportProductsDialogProps {
  disabled?: boolean;
}

export function ImportProductsDialog({ disabled = false }: ImportProductsDialogProps) {
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
    const headers = "nombre,price,cost,stock,description,visible";
    const blob = new Blob([`\uFEFF${headers}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
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
                
                const productName = row.name || row.nombre;

                if (!productName || !row.price) {
                    errors.push(`Fila ${rowIndex}: Faltan la columna de nombre ('name' o 'nombre') o de precio ('price').`);
                    return;
                }
                
                const price = parseFloat(row.price);
                if (isNaN(price)) {
                    errors.push(`Fila ${rowIndex}: El precio '${row.price}' no es un número válido.`);
                    return;
                }
                
                const cost = row.cost ? parseFloat(row.cost) : 0;
                if (isNaN(cost)) {
                    errors.push(`Fila ${rowIndex}: El costo '${row.cost}' no es un número válido.`);
                    return;
                }

                const stock = row.stock ? parseInt(row.stock, 10) : 0;
                if (isNaN(stock)) {
                    errors.push(`Fila ${rowIndex}: El stock '${row.stock}' no es un número válido.`);
                    return;
                }
                
                const visible = row.visible ? ['true', '1', 'yes', 'verdadero'].includes(String(row.visible).toLowerCase()) : true;

                productsToImport.push({
                    name: productName.trim(),
                    price: price,
                    cost: cost,
                    stock: stock,
                    description: row.description ? String(row.description).trim() : '',
                    visible: visible,
                    row: rowIndex,
                });
            });

            if (errors.length > 0) {
                toast.error('Errores en el archivo CSV', { 
                    description: (
                        <div className="flex flex-col gap-2">
                            {errors.slice(0, 5).map((e, i) => <span key={i}>{e}</span>)}
                            {errors.length > 5 && <span>Y {errors.length - 5} más...</span>}
                        </div>
                    ),
                    duration: 10000,
                 });
                setIsImporting(false);
                return;
            }

            if (productsToImport.length > 0) {
                const { successCount, errorCount } = await importProducts(productsToImport);
                toast.success('Importación completada', {
                    description: `${successCount} productos importados/actualizados, ${errorCount} filas fallaron.`,
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
        <Button variant="outline" disabled={disabled}>
          <Upload className="mr-2 h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Importar Productos desde CSV</DialogTitle>
          <DialogDescription>
            Añade o actualiza múltiples productos a la vez. El sistema usará el nombre del producto para saber si debe crear uno nuevo o actualizar uno existente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>¡Importante!</AlertTitle>
                <AlertDescription>
                   El archivo debe ser un **CSV (Valores Separados por Comas)** con codificación **UTF-8**. Si usas Excel, asegúrate de guardar el archivo con la opción "CSV UTF-8 (delimitado por comas)".
                </AlertDescription>
            </Alert>

            <div className="space-y-2 rounded-lg border border-dashed p-4">
                <h3 className="font-semibold">Instrucciones y Plantilla</h3>
                <p className="text-sm text-muted-foreground">
                    Tu archivo CSV debe tener las siguientes cabeceras: <br />
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">nombre</code> (o <code className="bg-muted px-1 py-0.5 rounded text-xs">name</code>), <code className="bg-muted px-1 py-0.5 rounded text-xs">price</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">cost</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">stock</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">description</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">visible</code>.
                </p>
                <p className="text-xs text-muted-foreground">
                    <span className="font-bold">nombre</span> (o <span className="font-bold">name</span>) y <span className="font-bold">price</span> son obligatorios. Las demás columnas son opcionales.
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
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
            {isImporting ? 'Importando...' : 'Importar Archivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
