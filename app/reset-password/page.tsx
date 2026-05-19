'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage('Şifre güncellenemedi: ' + error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-[360px] space-y-6">

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
            <Leaf className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Yeni Şifre Belirle</h1>
          <p className="text-sm text-zinc-400 mt-2">Lütfen yeni şifrenizi girin.</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Yeni Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                />
              </div>

              {message && (
                <Alert variant="destructive" className="border-red-900/50 bg-red-900/20 py-3">
                  <AlertDescription className="text-center text-sm font-medium text-red-400">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-900/50 bg-emerald-900/20 py-3">
                  <AlertDescription className="text-center text-sm font-medium text-emerald-400">
                    Şifreniz güncellendi! Giriş sayfasına yönlendiriliyorsunuz...
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-emerald-500 transition-colors">
            Giriş sayfasına dön
          </Link>
        </div>

      </div>
    </div>
  )
}
