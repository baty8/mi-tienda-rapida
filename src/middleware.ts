
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

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

  // if user is not logged in and is trying to access protected routes
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/catalog') || pathname.startsWith('/profile') || pathname.startsWith('/finance') || pathname.startsWith('/products'))) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // if user is logged in and is on the login/signup page, redirect to home page
  if (session && (pathname === '/login' || pathname === '/signup')) {
     const url = req.nextUrl.clone()
     url.pathname = '/products'
     return NextResponse.redirect(url)
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
     * - / (the public home page, which should not be processed by this middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
