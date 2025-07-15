
'use client';
import { ProductTable } from '@/components/product-table';
import { AddProductDialog } from '@/components/add-product-dialog';
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { VendorLayout } from '@/components/vendor-layout';

function ProductsPage() {
  return (
    <VendorLayout>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-2xl font-bold font-headline md:hidden">
          Productos
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <BulkUploadDialog />
          <AddProductDialog />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold font-headline">Productos</h2>
            <p className="text-muted-foreground">
              Gestiona y organiza tus productos aquí.
            </p>
          </div>
        </div>
        
        <ProductTable />
      </main>
    </VendorLayout>
  );
}

export default ProductsPage;
