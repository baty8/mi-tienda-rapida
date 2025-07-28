
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Si no hay error y la sesión es de tipo "recovery", redirigimos a la página de reset.
    if (!error && data.session?.user.aud === 'authenticated' && data.session.user.recovery_sent_at) {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
    }

    // Si es un login normal, redirigimos a donde corresponda (usualmente /products)
    if (!error) {
      return NextResponse.redirect(`${origin}${next ?? '/products'}`)
    }
  }

  // Si hay un error o no hay código, redirigimos a la página de error.
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
    