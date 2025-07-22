
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';

type Props = {
  params: { vendorId: string };
};

// Mapa de fuentes para cargar desde Google Fonts
const fontMap: { [key: string]: string } = {
  'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
  'Inconsolata': 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
  'PT Sans': 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
};

// Genera metadatos dinámicos (título de la tienda)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', params.vendorId)
    .single();

  return {
    title: profile?.name || 'Tienda',
  };
}

// Layout simplificado para la tienda
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { vendorId: string };
}) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('store_font_family')
    .eq('id', params.vendorId)
    .single();

  const selectedFont = profile?.store_font_family && fontMap[profile.store_font_family] ? profile.store_font_family : 'PT Sans';
  const fontUrl = fontMap[selectedFont];

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {fontUrl && <link href={fontUrl} rel="stylesheet" />}
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
