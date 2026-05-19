import { User } from 'lucide-react'

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Sistem Özeti</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700">
          <User className="h-4 w-4" />
          <span>Kullanıcı</span>
        </div>
      </div>
    </header>
  )
}