'use client'

import { useState } from 'react'
import { 
  Plane, 
  Plus, 
  Battery, 
  Wifi, 
  Clock, 
  Trash2, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Drone {
  id: number
  name: string
  model: string
  status: 'flying' | 'idle' | 'charging'
  battery: number
  signal: 'Excellent' | 'Good' | 'Weak' | 'None'
  lastActive: string
  serialNumber: string
}

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([
    {
      id: 1,
      name: 'Drone-1',
      model: 'DJI Agras T40',
      status: 'flying',
      battery: 84,
      signal: 'Excellent',
      lastActive: 'Bugün, 14:32',
      serialNumber: 'SN-AGR-40982-X'
    },
    {
      id: 2,
      name: 'Drone-2',
      model: 'DJI Agras T30',
      status: 'charging',
      battery: 18,
      signal: 'Good',
      lastActive: 'Bugün, 10:15',
      serialNumber: 'SN-AGR-30122-Y'
    },
    {
      id: 3,
      name: 'Drone-3',
      model: 'Phantom 4 Multispectral',
      status: 'flying',
      battery: 42,
      signal: 'Excellent',
      lastActive: 'Bugün, 13:40',
      serialNumber: 'SN-PHT-44810-Z'
    },
    {
      id: 4,
      name: 'Drone-4',
      model: 'Custom CropSpy v2',
      status: 'idle',
      battery: 98,
      signal: 'Good',
      lastActive: 'Dün, 17:30',
      serialNumber: 'SN-CSP-00214-A'
    }
  ])

  // New drone form state
  const [newDroneName, setNewDroneName] = useState('')
  const [newDroneModel, setNewDroneModel] = useState('')
  const [newDroneSerial, setNewDroneSerial] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleAddDrone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDroneName || !newDroneModel) return

    const newDrone: Drone = {
      id: drones.length + 1,
      name: newDroneName,
      model: newDroneModel,
      status: 'idle',
      battery: 100,
      signal: 'Excellent',
      lastActive: 'Şimdi eklendi',
      serialNumber: newDroneSerial || `SN-MOCK-${Math.floor(10000 + Math.random() * 90000)}`
    }

    setDrones([...drones, newDrone])
    setNewDroneName('')
    setNewDroneModel('')
    setNewDroneSerial('')
    setIsOpen(false)
  }

  const handleDeleteDrone = (id: number) => {
    setDrones(drones.filter(d => d.id !== id))
  }

  const toggleDroneFlight = (id: number) => {
    setDrones(drones.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === 'flying' ? 'idle' : 'flying',
          battery: d.status === 'flying' ? d.battery : Math.max(10, d.battery - 5) // simulate usage
        }
      }
      return d
    }))
  }

  const getStatusBadge = (status: Drone['status']) => {
    switch (status) {
      case 'flying':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[10px]">Uçuşta</Badge>
      case 'idle':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase text-[10px]">Hazır</Badge>
      case 'charging':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase text-[10px]">Şarjda</Badge>
    }
  }

  return (
    <div className="space-y-6 text-zinc-100">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Filom (Dronlar)</h1>
          <p className="text-xs text-zinc-400">Sisteminizdeki tarımsal dronların durumunu yönetin ve yeni cihaz ekleyin.</p>
        </div>

        {/* Dialog for adding a drone */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 text-sm self-start">
              <Plus className="h-4 w-4" />
              Yeni Drone Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Yeni Cihaz Kaydı</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Sisteme dahil edeceğiniz tarımsal drone bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDrone} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">Cihaz İsmi</Label>
                <Input
                  id="name"
                  placeholder="örn. Drone-5"
                  value={newDroneName}
                  onChange={(e) => setNewDroneName(e.target.value)}
                  required
                  className="border-zinc-850 bg-zinc-950 text-zinc-100 text-sm focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs font-semibold text-zinc-300">Drone Modeli</Label>
                <Select onValueChange={setNewDroneModel} required>
                  <SelectTrigger className="border-zinc-850 bg-zinc-950 text-zinc-100 text-sm">
                    <SelectValue placeholder="Model seçin" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-850 bg-zinc-950 text-zinc-100">
                    <SelectItem value="DJI Agras T40">DJI Agras T40 (İlaçlama/Tarama)</SelectItem>
                    <SelectItem value="DJI Agras T30">DJI Agras T30 (İlaçlama)</SelectItem>
                    <SelectItem value="Phantom 4 Multispectral">Phantom 4 Multispectral (Görüntüleme)</SelectItem>
                    <SelectItem value="Custom CropSpy v2">Custom CropSpy v2 (Hafif Tarama)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serial" className="text-xs font-semibold text-zinc-300">Seri Numarası (Opsiyonel)</Label>
                <Input
                  id="serial"
                  placeholder="örn. SN-PHT-12345"
                  value={newDroneSerial}
                  onChange={(e) => setNewDroneSerial(e.target.value)}
                  className="border-zinc-850 bg-zinc-950 text-zinc-100 text-sm focus-visible:ring-emerald-500"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Sisteme Kaydet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drones Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {drones.map((drone) => (
          <Card key={drone.id} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-zinc-700">
            <CardContent className="p-6 space-y-6">
              
              {/* Card Header Info */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-emerald-400">
                    <Plane className={`h-6 w-6 ${drone.status === 'flying' ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">{drone.name}</h3>
                    <p className="text-[11px] text-zinc-500">{drone.model}</p>
                  </div>
                </div>
                {getStatusBadge(drone.status)}
              </div>

              {/* Status details: battery, signal */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-zinc-850/50 py-4">
                
                {/* Battery percentage */}
                <div className="space-y-1">
                  <span className="block text-[10px] text-zinc-500">Batarya Seviyesi</span>
                  <div className="flex items-center gap-1.5">
                    <Battery className={`h-4.5 w-4.5 ${
                      drone.battery <= 20 ? 'text-rose-500 animate-pulse' : drone.battery < 50 ? 'text-amber-500' : 'text-emerald-400'
                    }`} />
                    <span className="text-xs font-semibold text-zinc-300">%{drone.battery}</span>
                  </div>
                </div>

                {/* Signal connection */}
                <div className="space-y-1">
                  <span className="block text-[10px] text-zinc-500">Sinyal Gücü</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-4.5 w-4.5 text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-300">
                      {drone.signal === 'Excellent' ? 'Çok İyi' : drone.signal === 'Good' ? 'İyi' : 'Zayıf'}
                    </span>
                  </div>
                </div>

                {/* Serial number */}
                <div className="space-y-1">
                  <span className="block text-[10px] text-zinc-500">Seri Numarası</span>
                  <span className="block text-[11px] font-mono text-zinc-400 truncate">{drone.serialNumber}</span>
                </div>

              </div>

              {/* Action buttons & last activity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>Son Aktif: {drone.lastActive}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleDroneFlight(drone.id)}
                    size="sm"
                    variant={drone.status === 'flying' ? 'destructive' : 'outline'}
                    className={`h-8 text-xs font-medium ${
                      drone.status === 'flying' 
                        ? 'bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 border-rose-900/50' 
                        : 'border-zinc-850 bg-zinc-950 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    {drone.status === 'flying' ? (
                      <>
                        <Square className="mr-1.5 h-3 w-3 fill-rose-400 text-rose-400" />
                        Görevi Durdur
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3 w-3 fill-emerald-400 text-emerald-400" />
                        Görev Başlat
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleDeleteDrone(drone.id)}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-zinc-850 bg-zinc-950 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
