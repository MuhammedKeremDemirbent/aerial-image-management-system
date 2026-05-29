import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Oturum durumunu sunucuda kontrol et (middleware ek güvenlik sağlar ama burada da kontrol ediyoruz)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  const name = user.user_metadata?.name || ''
  const surname = user.user_metadata?.surname || ''
  const userName = name || surname ? `${name} ${surname}`.trim() : user.email?.split('@')[0] || 'Kullanıcı'

  return (
    <DashboardShell userName={userName} userEmail={user.email}>
      {children}
    </DashboardShell>
  )
}
