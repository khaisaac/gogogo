import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = await createClient()

  // Handle OTP verification (email OTP / magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'signup' | 'magiclink',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // If OTP verification fails, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=verification_failed`)
  }

  // Handle OAuth / PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Fallback: redirect to home with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
