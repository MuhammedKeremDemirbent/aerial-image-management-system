import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import { sendEmail, emailVerificationHtml } from '@/lib/mails/email_verification'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf } from 'lucide-react'

const signUpNewUser = async (formData: FormData) => {
  'use server'
  const name = formData.get('name') as string
  const surname = formData.get('surname') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 1. Yönetici yetkisiyle hesabı oluştur ve doğrulama linki üret
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: { name, surname },
      redirectTo: `${siteUrl}/auth/callback?redirect_to=/`,
    }
  })

  if (error || !data?.properties?.action_link) {
    return redirect('/signup?message=' + encodeURIComponent('Kayıt başarısız: ' + (error?.message || 'Bilinmeyen hata')))
  }

  // 2. Doğrulama linkini SMTP üzerinden bizim e-posta motorumuzla gönder
  try {
    await sendEmail({
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      html: emailVerificationHtml(
        data.properties.action_link, // Oluşturulan özel doğrulama linki
        `${name} ${surname}`
      ),
    })
  } catch (emailError) {
    console.error('SMTP e-posta gönderme hatası:', emailError)
    // E-posta gönderilemese bile hesap oluşturuldu.
  }

  return redirect('/login?message=' + encodeURIComponent('Kayıt başarılı! Lütfen gelen kutunuza giderek e-postanızı doğrulayın.'))
}

export default async function SignupPage(props: { searchParams: Promise<{ message?: string }> }) {
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
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Hesap Oluştur</h1>
          <p className="text-sm text-zinc-400 mt-2">Bitki hastalıkları tespit sistemine katılın</p>
        </div>

        {/* Signup Card */}
        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardContent className="p-6">
            <form action={signUpNewUser} className="flex flex-col gap-4">

              {/* Ad */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-300">Ad</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ahmet"
                  required
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                />
              </div>

              {/* Soyad */}
              <div className="space-y-2">
                <Label htmlFor="surname" className="text-sm font-medium text-zinc-300">Soyad</Label>
                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  placeholder="Yılmaz"
                  required
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                />
              </div>

              {/* E-posta */}
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

              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Şifre</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                />
                <p className="text-xs text-zinc-500">Şifreniz en az 6 karakter uzunluğunda olmalıdır.</p>
              </div>

              {message && (
                <Alert variant="destructive" className="border-red-900/50 bg-red-900/20 py-3">
                  <AlertDescription className="text-center text-sm font-medium text-red-400">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full mt-2 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all font-medium"
              >
                Kayıt Ol
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Redirect Card */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-4 text-center text-sm text-zinc-400">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline transition-all">
              Giriş yap.
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
