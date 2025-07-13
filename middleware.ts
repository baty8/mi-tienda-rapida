import { createMiddlewareClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userRole: string | null = null;

  if (session) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single(); // Using single() here is generally safe in middleware if user_id is unique

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