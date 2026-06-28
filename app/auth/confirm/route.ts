import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function redirectToLogin(request: NextRequest, error?: string) {
  const redirectUrl = new URL('/login', request.url)

  if (error) {
    redirectUrl.searchParams.set('error', error)
  }

  return NextResponse.redirect(redirectUrl)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return redirectToLogin(request, error.message)
    }

    return redirectToLogin(request)
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (error) {
      return redirectToLogin(request, error.message)
    }

    return redirectToLogin(request)
  }

  return redirectToLogin(request, 'The confirmation link is missing required information.')
}
