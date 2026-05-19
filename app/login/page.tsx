import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf } from 'lucide-react'

const signInUser = async (formData: FormData) => {
  'use server'
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const message = error.message.includes('Email not confirmed')
      ? 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin veya yönetici ile iletişime geçin.'
      : 'Hatalı e-posta veya şifre girdiniz.'
    return redirect('/login?message=' + encodeURIComponent(message))
  }
  return redirect('/') 
}

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const resolvedSearchParams = await props.searchParams
  const message = resolvedSearchParams.message


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-[360px] space-y-6">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
            <Leaf className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Sisteme Giriş Yap</h1>
        </div>

        {/* Login Card */}
        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardContent className="p-6">
            <form action={signInUser} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">E-posta Adresi</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  required
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Şifre</Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                    Şifrenizi mi unuttunuz?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                />
              </div>

              {message && (
                <Alert variant="destructive" className="border-red-900/50 bg-red-900/20 py-3 mt-1">
                  <AlertDescription className="text-center text-sm font-medium text-red-400">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full mt-2 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all font-medium" 
              >
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* GitHub Style Create Account Card */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-4 text-center text-sm text-zinc-400">
            Hesabınız yok mu?{' '}
            <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline transition-all">
              Yeni kayıt oluştur.
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}