'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Plane, Settings, Map, Leaf, LogOut, Activity, BarChart3 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userEmail?: string
  userName?: string
  className?: string
  onClose?: () => void
}

export function Sidebar({ userEmail, userName, className, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/drones', label: 'Filom (Dronlar)', icon: Plane },
    { href: '/analysis', label: 'AI Yaprak Analizi', icon: Leaf },
    { href: '/map', label: 'Canlı Harita', icon: Map },
  ]

  return (
    <aside className={cn(
      "flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100",
      className
    )}>
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <div className="rounded-lg bg-emerald-500/10 p-1.5 ring-1 ring-emerald-500/20">
          <Leaf className="h-5 w-5 text-emerald-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Drone Merkezi
          </h1>
          <p className="text-[10px] text-zinc-500">Bitki Analiz Sistemi</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-2.5" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-100"
              )} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Footer Profile & Sign Out */}
      <div className="border-t border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
        {userName && (
          <div className="flex flex-col px-2">
            <span className="text-xs font-semibold text-zinc-300 truncate">{userName}</span>
            <span className="text-[10px] text-zinc-500 truncate">{userEmail}</span>
          </div>
        )}
        
        <div className="flex flex-col gap-1">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              pathname === '/settings' 
                ? "bg-zinc-900 text-emerald-400" 
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Sistem Ayarları</span>
          </Link>
          
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </aside>
  )
}