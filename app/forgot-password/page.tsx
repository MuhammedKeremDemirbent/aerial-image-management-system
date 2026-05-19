import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import { sendEmail, passwordResetEmailHtml } from '@/lib/mails/reset_password'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Leaf } from 'lucide-react'

const resetPassword = async (formData: FormData) => {
  'use server'
  const email = formData.get('email') as string
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 1. Yönetici yetkisiyle Şifre Sıfırlama linki üret (Supabase'in e-posta atmasını engeller, rate limite takılmaz)
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?redirect_to=/reset-password`,
    }
  })

  if (error || !data?.properties?.action_link) {
    console.error('Link üretme hatası:', error?.message)
    // Güvenlik için yine de başarı mesajı gösteriyoruz
    return redirect('/forgot-password?success=' + encodeURIComponent('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.'))
  }

  // 2. Bizim SMTP'imizle e-posta gönder (Supabase'in ürettiği action_link'i kullanıyoruz)
  try {
    await sendEmail({
      to: email,
      subject: 'Şifre Sıfırlama Talebi',
      html: passwordResetEmailHtml(
        data.properties.action_link, // Oluşturulan özel şifre sıfırlama linki
        email
      ),
    })
  } catch (emailError) {
    console.error('SMTP e-posta gönderme hatası:', emailError)
    return redirect('/forgot-password?message=' + encodeURIComponent('E-posta gönderilemedi. Lütfen tekrar deneyin.'))
  }

  return redirect('/forgot-password?success=' + encodeURIComponent('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.'))
}

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ message?: string, success?: string }> }) {
  const resolvedSearchParams = await props.searchParams
  const message = resolvedSearchParams.message
  const success = resolvedSearchParams.success


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-[360px] space-y-6">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
            <Leaf className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Şifremi Unuttum</h1>
          <p className="text-sm text-zinc-400 mt-2">Şifrenizi sıfırlamak için hesabınıza ait e-posta adresinizi girin.</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardContent className="p-6">
            <form action={resetPassword} className="flex flex-col gap-4">
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

              {message && (
                <Alert variant="destructive" className="border-red-900/50 bg-red-900/20 py-3 mt-1">
                  <AlertDescription className="text-center text-sm font-medium text-red-400">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-900/50 bg-emerald-900/20 py-3 mt-1">
                  <AlertDescription className="text-center text-sm font-medium text-emerald-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full mt-2 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all font-medium" 
              >
                Sıfırlama Bağlantısı Gönder
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-emerald-500 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />
            Giriş sayfasına dön
          </Link>
        </div>

      </div>
    </div>
  )
}
