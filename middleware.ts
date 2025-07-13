import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    'https://oucrwfmkjkgvlqbsaqbj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Y3J3Zm1ramtndmxxYnNhcWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTY5ODIsImV4cCI6MjA2Nzg3Mjk4Mn0.ayJrybO13bsPC1OeWYfAUyDxRwfOBhHP7wdug4Le_FM',
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

  let userRole: string | null = null;

  if (session) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single(); 

    if (profileError) {
      console.error('Error fetching profile in middleware:', profileError);
    } else if (profileData) {
      userRole = profileData.role;
    }
  }

  // For now, just log the session and role
  console.log('Middleware - User Session:', session);
  console.log('Middleware - User Role:', userRole);

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (login page)
     * - /signup (signup page)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
