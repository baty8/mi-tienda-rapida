
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mi Tienda Rapida',
  description: 'Sistema de Ventas para Vendedores',
};

const Favicon = () => (
  <svg
    width="any"
    height="any"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50zm-2.812-25.68c-4.99 0-8.995-1.07-12.015-3.213l3.65-8.525c2.31.95 4.56.98 5.76.06.32-.24.48-.6.48-1.08v-2.31l-9.84-23.7h11.25l4.35 12.36c.52 1.48 1.03 3.12 1.53 4.92h.15c.55-1.8 1.09-3.44 1.62-4.92l4.47-12.36h9.63L53.117 62.4V72c0 .48.15.84.45 1.08.3.24.645.36.945.36.33 0 1.29-.07 2.88-.21l.57 7.53c-1.99.2-4.435.31-7.335.31z"
      fill="#FF9800"
    />
  </svg>
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' fill='none'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50zm-2.812-25.68c-4.99 0-8.995-1.07-12.015-3.213l3.65-8.525c2.31.95 4.56.98 5.76.06.32-.24.48-.6.48-1.08v-2.31l-9.84-23.7h11.25l4.35 12.36c.52 1.48 1.03 3.12 1.53 4.92h.15c.55-1.8 1.09-3.44 1.62-4.92l4.47-12.36h9.63L53.117 62.4V72c0 .48.15.84.45 1.08.3.24.645.36.945.36.33 0 1.29-.07 2.88-.21l.57 7.53c-1.99.2-4.435.31-7.335.31z' fill='%23FF9800'/%3e%3c/svg%3e" />
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
