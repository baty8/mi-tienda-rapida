
import type { ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';

// Este es el layout para la tienda pública.
// Se ha simplificado al máximo para resolver un error de compilación en Vercel.
// La lógica de obtención de datos y metadatos se maneja en la página (page.tsx)
// y en el layout raíz (src/app/layout.tsx).

export default function StoreLayout({ children }: {
  children: ReactNode;
}) {
  // Este layout ahora solo renderiza a sus hijos, sin lógica adicional.
  return <CartProvider>{children}</CartProvider>;
}
