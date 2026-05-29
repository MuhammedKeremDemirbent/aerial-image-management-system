'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, User, Menu, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface NavbarProps {
  userName?: string
  userEmail?: string
  onMenuToggle?: () => void
}

export function Navbar({ userName, userEmail, onMenuToggle }: NavbarProps) {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Hastalık Tespit Edildi',
      desc: 'Drone-4, Buğday arazisinde Yaprak Pası hastalığı tespit etti.',
      time: '10 dk önce',
      type: 'warning',
      unread: true
    },
    {
      id: 2,
      title: 'Uçuş Görevi Tamamlandı',
      desc: 'Drone-1, Domates arazisi tarama görevini başarıyla tamamladı.',
      time: '1 saat önce',
      type: 'success',
      unread: false
    },
    {
      id: 3,
      title: 'Batarya Düşük Uyarı',
      desc: 'Drone-2 batarya seviyesi %18. Şarja yönlendiriliyor.',
      time: '2 saat önce',
      type: 'alert',
      unread: false
    }
  ])

  // Get dynamic title based on path
  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Sistem Özeti'
      case '/drones':
        return 'Filom (Dronlar)'
      case '/analysis':
        return 'AI Yaprak Analizi'
      case '/map':
        return 'Canlı Harita'
      case '/settings':
        return 'Sistem Ayarları'
      default:
        return 'Dashboard'
    }
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-md">
      {/* Page Title & Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-medium text-zinc-100">{getPageTitle()}</h2>
      </div>

      {/* User Area & Notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-zinc-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 border-zinc-800 bg-zinc-900 p-0 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <span className="text-sm font-semibold">Bildirimler</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Tümünü okundu işaretle
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Yeni bildirim bulunmuyor.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 border-b border-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/40",
                      notif.unread && "bg-emerald-500/[0.02]"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 rounded-full p-1",
                      notif.type === 'warning' && "bg-amber-500/10 text-amber-500",
                      notif.type === 'success' && "bg-emerald-500/10 text-emerald-500",
                      notif.type === 'alert' && "bg-rose-500/10 text-rose-500"
                    )}>
                      {notif.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5" />}
                      {notif.type === 'success' && <Check className="h-3.5 w-3.5" />}
                      {notif.type === 'alert' && <AlertTriangle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{notif.title}</span>
                        <span className="text-[10px] text-zinc-500">{notif.time}</span>
                      </div>
                      <p className="text-[11px] leading-normal text-zinc-400">{notif.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Badge */}
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300">
          <Avatar className="h-5 w-5 bg-emerald-500/10 text-emerald-400">
            <AvatarFallback className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold">
              {userName ? userName.substring(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[120px] truncate text-xs">{userName || 'Kullanıcı'}</span>
        </div>
      </div>
    </header>
  )
}