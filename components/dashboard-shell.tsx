'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
  children: React.ReactNode
  userEmail?: string
  userName?: string
}

export function DashboardShell({ children, userEmail, userName }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Desktop Sidebar (visible on md and up) */}
      <Sidebar 
        userName={userName} 
        userEmail={userEmail} 
        className="hidden md:flex flex-shrink-0" 
      />

      {/* Mobile Sidebar Slide-over Drawer */}
      <div className={cn(
        "fixed inset-0 z-50 flex md:hidden transition-opacity duration-300",
        isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}>
        {/* Dark overlay backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar container */}
        <div className={cn(
          "relative flex w-64 max-w-xs transform bg-zinc-950 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Close button inside mobile menu */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-850 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
          
          <Sidebar 
            userName={userName} 
            userEmail={userEmail} 
            className="w-full" 
            onClose={() => setIsSidebarOpen(false)} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar 
          userName={userName} 
          userEmail={userEmail} 
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
