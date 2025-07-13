
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Esta es la forma correcta y segura de inicializar el cliente de Supabase en el middleware.
  // Evita los bucles de reasignación que causaban el error 502.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  const sellerRoutes = ['/dashboard', '/products', '/catalog', '/profile', '/finance'];

  // Regla 1: si un usuario no está logueado y intenta acceder a una ruta de vendedor, redirigir a login.
  if (!session && sellerRoutes.some(path => pathname.startsWith(path))) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Regla 2: si un usuario ya está logueado y visita la página de login/signup, redirigir al dashboard.
  if (session && (pathname === '/login' || pathname === '/signup')) {
     const url = req.nextUrl.clone();
     url.pathname = '/dashboard';
     return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This ensures the middleware runs on all necessary pages for authentication checks.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
