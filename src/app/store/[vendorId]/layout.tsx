import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';

// Genera metadatos dinámicos (título de la tienda y favicon)
export async function generateMetadata({ params }: { params: { vendorId: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', params.vendorId)
    .single();

  if (!profile) {
    return {
      title: 'Tienda no encontrada',
    };
  }

  return {
    title: profile.name || 'Tienda',
    icons: {
      icon: profile.avatar_url || undefined,
    }
  };
}

// Layout simplificado para la tienda. No es asíncrono.
export default function StoreLayout({ children }: {
  children: ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Las fuentes se cargan globalmente en el layout raíz (src/app/layout.tsx) 
            por lo que no es necesario volver a cargarlas aquí. */}
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
