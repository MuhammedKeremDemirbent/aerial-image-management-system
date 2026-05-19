import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar haricindeki tüm sayfalarda proxy çalışır:
     * - _next/static (statik dosyalar)
     * - _next/image (görsel optimizasyonları)
     * - favicon.ico (favicon)
     * - images, icons gibi public klasörü içindekiler
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}