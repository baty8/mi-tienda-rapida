
'use client';
import { ProductTable } from '@/components/product-table';
import { AddProductDialog } from '@/components/add-product-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { ImportProductsDialog } from '@/components/import-products-dialog';
import { useProduct } from '@/context/ProductContext';
import { AlertCircle } from 'lucide-react';

function ProductsPage() {
  const { products, profile, loading } = useProduct();
  
  const productLimit = profile?.product_limit || 100;
  const limitReached = !loading && products.length >= productLimit;

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold font-headline">
            Productos
          </h2>
          {!loading && <span className="text-sm text-muted-foreground">({products.length}/{productLimit})</span>}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ImportProductsDialog disabled={limitReached} />
          <AddProductDialog disabled={limitReached} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground mb-6">
            Gestiona y organiza tus productos aquí.
        </p>
        
        {limitReached && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-500/50 bg-yellow-50/50 p-3 text-sm text-yellow-800 dark:border-yellow-400/50 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertCircle className="h-5 w-5" />
            <span>Has alcanzado tu límite de {productLimit} productos. Para añadir más, contacta al soporte.</span>
          </div>
        )}

        <ProductTable />
      </main>
    </div>
  );
}

export default ProductsPage;
