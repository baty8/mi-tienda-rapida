import { type NextRequest, NextResponse } from 'next/server';

// Este middleware ya no es necesario.
// La lógica de protección de rutas se ha movido a un layout de grupo
// en src/app/(vendor)/layout.tsx para mayor simplicidad y para evitar
// condiciones de carrera durante el inicio de sesión.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
