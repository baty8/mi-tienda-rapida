
'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ProductTable } from '@/components/product-table';
import { AddProductDialog } from '@/components/add-product-dialog';
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { VendorLayout } from '@/components/vendor-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ProductsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // This check is mostly a fallback, as VendorLayout should handle it.
                router.push('/');
            } else {
                setCurrentUser(session.user);
            }
            setAuthChecked(true);
        };
        checkSession();
    }, [router, supabase.auth]);

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

        {authChecked && (
          <Alert variant={currentUser ? 'default' : 'destructive'} className="mb-6 bg-opacity-20">
            {currentUser ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{currentUser ? 'Autenticado' : 'No Autenticado'}</AlertTitle>
            <AlertDescription>
              {currentUser 
                ? `Sesión activa para el usuario: ${currentUser.email} (ID: ${currentUser.id})`
                : 'No se ha encontrado una sesión de usuario activa.'
              }
            </AlertDescription>
          </Alert>
        )}

        <ProductTable />
      </main>
    </VendorLayout>
  );
}
