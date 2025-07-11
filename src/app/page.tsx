import { AddProductDialog } from '@/components/add-product-dialog';
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import { ProductTable } from '@/components/product-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">
              VentaRapida
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40" alt="User avatar" />
              <AvatarFallback>VR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold font-headline">Products</h2>
            <p className="text-muted-foreground">
              A list of all products in your store.
            </p>
          </div>
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <BulkUploadDialog />
            <AddProductDialog />
          </div>
        </div>

        <ProductTable />
      </main>
    </div>
  );
}
