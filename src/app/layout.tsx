
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

// Generamos un parámetro único para evitar la caché del favicon.
const cacheBuster = new Date().getTime();
// Este es el SVG correcto de la bolsa de compras con el rayo
const faviconUrl = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'/%3e%3cpath d='M11 21h2'/%3e%3cpath d='M12 5H8.5C6.57 5 5 6.57 5 8.5v5.09c0 .48.21.94.58 1.25l4.37 3.78c.37.32.89.32 1.26 0l4.37-3.78c.37-.31.58-.77.58-1.25V8.5C19 6.57 17.43 5 15.5 5H12Z'/%3e%3cpath d='m13 12-3 3'/%3e%3cpath d='m13 15-3-3'/%3e%3c/svg%3e?v=${cacheBuster}`;

export const metadata: Metadata = {
  title: 'Mi Tienda Rapida',
  description: 'Sistema de Ventas para Vendedores',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href={faviconUrl} sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
          {children}
          <Toaster />
      </body>
    </html>
  );
}
