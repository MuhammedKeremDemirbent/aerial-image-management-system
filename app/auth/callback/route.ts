import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('redirect_to') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Hata durumunda login'e yönlendir
  return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Geçersiz veya süresi dolmuş bağlantı.')}`)
}
