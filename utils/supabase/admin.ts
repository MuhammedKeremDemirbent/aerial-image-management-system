import { createClient } from '@supabase/supabase-js'

// Yönetici (Admin) yetkilerine sahip Supabase İstemcisi
// Bu istemci güvenlik kurallarını (RLS) aşar ve sistem işlemlerini (ör: link üretme) yapabilir.
// DİKKAT: Sadece Server Component ve Server Actions içinde kullanılmalıdır! Asla 'use client' dosyalarına eklemeyin.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

//Özel linkler üreten üst düzey yetkili komut dosyasıdır