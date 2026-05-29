'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plane, 
  Leaf, 
  Map, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Activity,
  Thermometer,
  Droplets,
  Battery as BatteryIcon,
  Cpu
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [latestSensor, setLatestSensor] = useState<any>({
    device_id: 'eui-sensor-mock',
    temperature: 24.5,
    moisture: 42.1,
    battery: 95,
    created_at: new Date().toISOString()
  })

  useEffect(() => {
    const supabase = createClient()

    // Son veriyi veritabanından çek
    const fetchLatestData = async () => {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (data && data.length > 0) {
        setLatestSensor(data[0])
      }
    }
    fetchLatestData()

    // Realtime aboneliğini başlat
    const channel = supabase
      .channel('sensor_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => {
          setLatestSensor(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const [stats] = useState([
    {
      title: 'Taranan Toplam Alan',
      value: '1,428 Hektar',
      change: '+14% geçen aya göre',
      icon: Layers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Aktif Dronlar',
      value: '3 / 4 Uçuşta',
      change: '1 adet şarj istasyonunda',
      icon: Plane,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      pulse: true
    },
    {
      title: 'Ortalama Ürün Sağlığı',
      value: '%92.4',
      change: '+2.1% iyileşme',
      icon: ShieldCheck,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10'
    },
    {
      title: 'Tespit Edilen Hastalıklar',
      value: '8 Vaka',
      change: '3 kritik müdahale bekliyor',
      icon: AlertTriangle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10'
    }
  ])

  const [recentDetections] = useState([
    {
      id: 1,
      crop: 'Buğday (Saha A-12)',
      disease: 'Pas Hastalığı (Puccinia)',
      severity: 'Kritik',
      severityColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      confidence: '%94.2',
      date: 'Bugün, 14:32',
      image: '/leaf_spot.jpg', // Placeholder but looking real in UI
      status: 'Müdahale Bekliyor'
    },
    {
      id: 2,
      crop: 'Domates (Sera B-4)',
      disease: 'Erken Yanıklık (Alternaria)',
      severity: 'Orta',
      severityColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      confidence: '%89.7',
      date: 'Bugün, 11:15',
      image: '/early_blight.jpg',
      status: 'İlaçlama Planlandı'
    },
    {
      id: 3,
      crop: 'Mısır (Saha C-3)',
      disease: 'Yaprak Lekesi (Helminthosporium)',
      severity: 'Hafif',
      severityColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      confidence: '%76.4',
      date: 'Dün, 16:45',
      image: '/leaf_spot_corn.jpg',
      status: 'Gözlem Altında'
    },
    {
      id: 4,
      crop: 'Patates (Saha D-2)',
      disease: 'Sağlıklı Ürün',
      severity: 'Sağlıklı',
      severityColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      confidence: '%98.9',
      date: 'Dün, 09:30',
      image: '/healthy_potato.jpg',
      status: 'Normal'
    }
  ])

  const [activeFlights] = useState([
    { drone: 'Drone-1 (Agras T40)', field: 'Buğday Saha A', task: 'Hastalık Taraması', battery: 84, progress: 65 },
    { drone: 'Drone-3 (Phantom 4)', field: 'Mısır Saha C', task: 'Sağlık İndeksi Analizi', battery: 42, progress: 80 }
  ])

  // Custom Chart Data (Mocking a beautiful chart)
  const chartData = [
    { day: 'Pzt', value: 45 },
    { day: 'Sal', value: 60 },
    { day: 'Çar', value: 85 },
    { day: 'Per', value: 70 },
    { day: 'Cum', value: 95 },
    { day: 'Cmt', value: 110 },
    { day: 'Paz', value: 130 }
  ]

  return (
    <div className="space-y-6 text-zinc-100">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 p-6 md:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-100">
            Merhaba, Tekrar Hoş Geldiniz! 👋
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Sisteminiz stabil durumda. Bugün taranan 2 arazide hastalık şüphesi içeren 1 yeni hava görüntüsü tespit edildi. AI yaprak analizi aktif.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/analysis">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium">
                <Leaf className="h-4 w-4" />
                Hemen Fotoğraf Analiz Et
              </Button>
            </Link>
            <Link href="/map">
              <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2">
                <Map className="h-4 w-4" />
                Canlı Uçuşları İzle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-zinc-400">{stat.title}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-zinc-100">{stat.value}</span>
                  </div>
                  <span className="block text-[10px] text-zinc-500">{stat.change}</span>
                </div>
                <div className={cn("rounded-xl p-3", stat.bgColor)}>
                  <Icon className={cn("h-6 w-6", stat.color, stat.pulse && "animate-pulse")} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 2 Columns: Chart & Recent Detections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom SVG Flight Analysis Chart */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Uçuş & Tarama Analizi</h3>
                  <p className="text-xs text-zinc-500">Günlük taranan alan miktarı (hektar)</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-xs">
                  <button className="rounded px-2.5 py-1 font-medium bg-emerald-500/10 text-emerald-400">Haftalık</button>
                  <button className="rounded px-2.5 py-1 text-zinc-500 hover:text-zinc-300">Aylık</button>
                </div>
              </div>
              
              {/* Premium Simulated Chart with custom SVGs & gradients */}
              <div className="h-56 w-full flex items-end justify-between pt-4 px-2">
                {chartData.map((data, idx) => {
                  const percentage = (data.value / 150) * 100
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer flex-1">
                      <div className="relative w-full flex items-end justify-center h-44">
                        {/* Tooltip on Hover */}
                        <span className="absolute bottom-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-950 border border-zinc-850 px-2 py-1 rounded text-[10px] font-bold text-emerald-400 shadow-xl whitespace-nowrap z-10">
                          {data.value} ha
                        </span>
                        
                        {/* Interactive Bar */}
                        <div 
                          className="w-8 rounded-t-md bg-gradient-to-t from-emerald-600/40 to-emerald-500 transition-all duration-500 group-hover:from-emerald-500/60 group-hover:to-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          style={{ height: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{data.day}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Detections List */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Son Yapay Zeka Teşhisleri</h3>
                  <p className="text-xs text-zinc-500">Drone kameralarından ve manuel yüklemelerden gelen son raporlar</p>
                </div>
                <Link href="/analysis">
                  <Button variant="ghost" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 gap-1">
                    Tümünü Gör <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentDetections.map((detection) => (
                  <div 
                    key={detection.id} 
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900 hover:border-zinc-750 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-lg p-2.5",
                        detection.severity === 'Kritik' && "bg-rose-500/10 text-rose-400",
                        detection.severity === 'Orta' && "bg-amber-500/10 text-amber-400",
                        detection.severity === 'Hafif' && "bg-blue-500/10 text-blue-400",
                        detection.severity === 'Sağlıklı' && "bg-emerald-500/10 text-emerald-400"
                      )}>
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">
                          {detection.crop}
                        </h4>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <span>{detection.disease}</span>
                          <span className="h-1 w-1 rounded-full bg-zinc-700" />
                          <span>AI Güven: {detection.confidence}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="block text-[10px] text-zinc-500">{detection.date}</span>
                        <span className="text-[10px] font-medium text-zinc-400">{detection.status}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-medium uppercase px-2 py-0.5", detection.severityColor)}>
                        {detection.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Live Flights & Quick Info */}
        <div className="space-y-6">
          
          {/* Active Flight Tracker Widget */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-zinc-800 bg-emerald-950/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h3 className="text-xs font-semibold text-zinc-200">Canlı Uçuş Monitörü</h3>
              </div>
              <Link href="/map">
                <span className="text-[11px] font-medium text-emerald-400 hover:underline">Haritaya Git</span>
              </Link>
            </div>
            <CardContent className="p-6 space-y-5">
              {activeFlights.map((flight, idx) => (
                <div key={idx} className="space-y-2 border-b border-zinc-850/50 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-300">{flight.drone}</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5">{flight.field}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] text-zinc-500">
                    <span>Görevi: {flight.task}</span>
                    <span className={cn(
                      flight.battery < 50 ? "text-amber-500" : "text-emerald-400"
                    )}>🔋 %{flight.battery}</span>
                  </div>

                  {/* Task progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Tarama İlerlemesi</span>
                      <span>%{flight.progress}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${flight.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* LoRaWAN Canlı Sensör Telemetrisi */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-zinc-800 bg-blue-950/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <h3 className="text-xs font-semibold text-zinc-200">LoRaWAN Tarla Sensörleri</h3>
              </div>
              <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                Canlı Bağlantı
              </Badge>
            </div>
            <CardContent className="p-6 space-y-4">
              {/* Device ID */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> Cihaz ID:</span>
                <span className="font-mono text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">{latestSensor?.device_id || 'Yükleniyor...'}</span>
              </div>

              {/* Grid: Temperature, Moisture, Battery */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Sıcaklık */}
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Thermometer className="h-3 w-3 text-amber-500" /> Sıcaklık</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1">
                    {latestSensor?.temperature !== null && latestSensor?.temperature !== undefined ? `${latestSensor.temperature.toFixed(1)} °C` : '--'}
                  </span>
                </div>

                {/* Nem */}
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-400" /> Toprak Nemi</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1">
                    {latestSensor?.moisture !== null && latestSensor?.moisture !== undefined ? `%${latestSensor.moisture.toFixed(1)}` : '--'}
                  </span>
                </div>
              </div>

              {/* Battery level */}
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-zinc-500 flex items-center gap-1.5"><BatteryIcon className="h-3.5 w-3.5" /> Pil Seviyesi:</span>
                <span className="font-semibold text-zinc-300">
                  {latestSensor?.battery !== null && latestSensor?.battery !== undefined ? `%${latestSensor.battery.toFixed(0)}` : '--'}
                </span>
              </div>

              {/* Packet timing */}
              <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-850/50 pt-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Son Alınan Paket:</span>
                <span>
                  {latestSensor?.created_at ? new Date(latestSensor.created_at).toLocaleTimeString() : '--'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Informational Tips Card */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="h-5 w-5" />
              <h3 className="text-xs font-semibold">Tarımsal Tavsiye</h3>
            </div>
            
            <p className="text-xs leading-relaxed text-zinc-400">
              Son 3 gündeki yüksek nem ve 22°C sıcaklık ortalaması, buğday arazilerinde **Sarı Pas (Puccinia striiformis)** oluşum riskini %85 seviyesine çıkarmıştır. Saha A-12 bölgesindeki drone taramasını sıklaştırmanız önerilir.
            </p>

            <div className="rounded-lg bg-zinc-950/40 border border-zinc-850 p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-semibold text-zinc-300">Önleyici Aksiyon Planı</span>
                <p className="text-[10px] leading-relaxed text-zinc-500">Hastalık görülen alanların 50m çevresine koruyucu fungisit uygulanması tavsiye edilir.</p>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  )
}
