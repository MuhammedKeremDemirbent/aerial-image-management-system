'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Bell, 
  Map, 
  Lock, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/utils/supabase/client'

interface Field {
  id: number
  name: string
  crop: string
  size: number
}

export default function SettingsPage() {
  const supabase = createClient()
  
  // Loading & notification states
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  // User profile state
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [droneTelemetry, setDroneTelemetry] = useState(false)

  // Fields state
  const [fields, setFields] = useState<Field[]>([
    { id: 1, name: 'Kuzey Buğday Sahası', crop: 'Buğday', size: 12.4 },
    { id: 2, name: 'Güney Domates Sahası', crop: 'Domates', size: 5.8 },
    { id: 3, name: 'Doğu Mısır Sahası', crop: 'Mısır', size: 8.2 }
  ])
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldCrop, setNewFieldCrop] = useState('')
  const [newFieldSize, setNewFieldSize] = useState('')

  // Fetch logged in user on mount
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setName(user.user_metadata?.name || '')
        setSurname(user.user_metadata?.surname || '')
      }
    }
    fetchUser()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    const { error } = await supabase.auth.updateUser({
      data: { name, surname }
    })

    if (error) {
      setMessage('Profil güncellenemedi: ' + error.message)
      setSuccess(false)
    } else {
      setMessage('Profil başarıyla güncellendi!')
      setSuccess(true)
    }
    setLoading(false)
  }

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFieldName || !newFieldCrop || !newFieldSize) return

    const newField: Field = {
      id: fields.length + 1,
      name: newFieldName,
      crop: newFieldCrop,
      size: parseFloat(newFieldSize)
    }

    setFields([...fields, newField])
    setNewFieldName('')
    setNewFieldCrop('')
    setNewFieldSize('')
  }

  const handleDeleteField = (id: number) => {
    setFields(fields.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6 text-zinc-100">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Sistem Ayarları</h1>
        <p className="text-xs text-zinc-400">Profil bilgilerinizi düzenleyin, bildirim tercihlerinizi yönetin ve arazilerinizi listeleyin.</p>
      </div>

      {/* Grid: Profile & Notification, and Land Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column (Span 2): Profile & Notification */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Profile settings */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold border-b border-zinc-850 pb-3">
                <User className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="text-xs">Profil Bilgileri</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">Ad</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-zinc-850 bg-zinc-950 text-zinc-100 text-sm focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="surname" className="text-xs font-semibold text-zinc-300">Soyad</Label>
                    <Input
                      id="surname"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                      className="border-zinc-850 bg-zinc-950 text-zinc-100 text-sm focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-zinc-300">E-posta Adresi (Değiştirilemez)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="border-zinc-850 bg-zinc-950/50 text-zinc-500 text-sm cursor-not-allowed"
                  />
                </div>

                {message && (
                  <div className={`flex items-center gap-2 rounded-lg border p-3.5 text-xs font-medium ${
                    success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{message}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 text-xs"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* System Notifications toggle settings */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold border-b border-zinc-850 pb-3">
                <Bell className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="text-xs">Bildirim Tercihleri</h3>
              </div>

              <div className="space-y-4">
                
                {/* Email notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-zinc-200">E-posta Bildirimleri</span>
                    <span className="block text-[10px] text-zinc-500">Günlük uçuş özetleri ve raporlar e-posta ile iletilsin.</span>
                  </div>
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>

                {/* Critical alarms */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-zinc-200">Kritik Hastalık Alarmları</span>
                    <span className="block text-[10px] text-zinc-500">Yapay zeka kritik düzeyde hastalık tespit ederse anlık bildirim atılsın.</span>
                  </div>
                  <Switch checked={criticalAlerts} onCheckedChange={setCriticalAlerts} />
                </div>

                {/* Drone Telemetry warning */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-zinc-200">Drone Telemetri Uyarıları</span>
                    <span className="block text-[10px] text-zinc-500">Dronların bataryası kritik seviyeye (%20) indiğinde uyarı al.</span>
                  </div>
                  <Switch checked={droneTelemetry} onCheckedChange={setDroneTelemetry} />
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Land Management */}
        <div className="space-y-6">
          
          {/* Field/Land management settings list */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold border-b border-zinc-850 pb-3">
                <Map className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="text-xs">Arazi Yönetimi</h3>
              </div>

              {/* Active lands list */}
              <div className="space-y-2">
                {fields.map(field => (
                  <div 
                    key={field.id} 
                    className="flex justify-between items-center p-3 rounded-lg border border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900 transition-colors"
                  >
                    <div>
                      <span className="block text-xs font-semibold text-zinc-200">{field.name}</span>
                      <span className="block text-[10px] text-zinc-500">Ürün: {field.crop} | Alan: {field.size} Hektar</span>
                    </div>
                    <Button
                      onClick={() => handleDeleteField(field.id)}
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-zinc-850 bg-zinc-950 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add land form */}
              <form onSubmit={handleAddField} className="space-y-3 pt-2 border-t border-zinc-850/50">
                <span className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Yeni Arazi Kaydı</span>
                
                <div className="space-y-1.5">
                  <Input
                    placeholder="Arazi Adı (örn. Batı Mısır)"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    required
                    className="border-zinc-850 bg-zinc-950 text-zinc-100 text-xs focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Ürün Türü (Mısır)"
                    value={newFieldCrop}
                    onChange={(e) => setNewFieldCrop(e.target.value)}
                    required
                    className="border-zinc-850 bg-zinc-950 text-zinc-100 text-xs focus-visible:ring-emerald-500"
                  />
                  <Input
                    placeholder="Boyut (Hektar)"
                    type="number"
                    step="0.1"
                    value={newFieldSize}
                    onChange={(e) => setNewFieldSize(e.target.value)}
                    required
                    className="border-zinc-850 bg-zinc-950 text-zinc-100 text-xs focus-visible:ring-emerald-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 text-xs"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Arazi Ekle
                </Button>
              </form>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
