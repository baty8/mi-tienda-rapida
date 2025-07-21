
'use client';
import { ProductTable } from '@/components/product-table';
import { AddProductDialog } from '@/components/add-product-dialog';
import { ThemeToggle } from '@/components/theme-toggle';

function ProductsPage() {
  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <h2 className="text-xl font-bold font-headline">
          Productos
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AddProductDialog />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground mb-6">
            Gestiona y organiza tus productos aquí.
        </p>
        
        <ProductTable />
      </main>
    </div>
  );
}

export default ProductsPage;
