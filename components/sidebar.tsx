import Link from 'next/link'
import { LayoutDashboard, Plane, Settings, Map } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Drone Merkezi</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <Link href="/" className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-blue-700 transition-colors">
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-lg p-3 text-gray-600 transition-colors hover:bg-gray-100">
          <Plane className="h-5 w-5" />
          <span className="font-medium">Filom (Dronlar)</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-lg p-3 text-gray-600 transition-colors hover:bg-gray-100">
          <Map className="h-5 w-5" />
          <span className="font-medium">Canlı Harita</span>
        </Link>
      </nav>
      <div className="border-t border-gray-200 p-4">
        <Link href="#" className="flex items-center gap-3 rounded-lg p-3 text-gray-600 transition-colors hover:bg-gray-100">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Ayarlar</span>
        </Link>
      </div>
    </div>
  )
}