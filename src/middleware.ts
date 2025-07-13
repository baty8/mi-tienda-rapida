
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
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

  const protectedSellerRoutes = ['/dashboard', '/catalog', '/profile', '/analysis', '/products'];

  // if user is not logged in and is trying to access protected seller routes
  if (!session && protectedSellerRoutes.some(path => pathname.startsWith(path))) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // if user is logged in
  if (session) {
    // and is on the login/signup page, redirect to dashboard
    if (pathname === '/login' || pathname === '/signup') {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // and tries to access a protected route, check their role
    if (protectedSellerRoutes.some(path => pathname.startsWith(path))) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        // if they are not a seller, redirect them away from seller pages
        if (profile?.role !== 'vendedor') {
            const url = req.nextUrl.clone()
            url.pathname = '/' // Redirect non-sellers to home page
            return NextResponse.redirect(url);
        }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to add more paths here that should not be managed by the middleware.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
