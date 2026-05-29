'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Square, 
  RefreshCw, 
  Compass, 
  Navigation, 
  Layers, 
  Activity, 
  Info,
  MapPin,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Telemetry {
  speed: number
  altitude: number
  battery: number
  latitude: number
  longitude: number
  areaCovered: number
  status: 'flying' | 'paused' | 'landing' | 'idle'
}

export default function MapPage() {
  const [activeField, setActiveField] = useState('north_wheat')
  const [telemetry, setTelemetry] = useState<Telemetry>({
    speed: 0,
    altitude: 0,
    battery: 100,
    latitude: 39.9207,
    longitude: 32.8541,
    areaCovered: 0,
    status: 'idle'
  })

  const [hotspots] = useState([
    { id: 1, name: 'Sarı Pas Vakası (Kritik)', lat: 39.9220, lng: 32.8570, color: 'bg-rose-500' },
    { id: 2, name: 'Erken Yanıklık Şüphesi', lat: 39.9195, lng: 32.8510, color: 'bg-amber-500' }
  ])

  // Canvas ref for drawing the drone flight path
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  
  // Drone coordinate state in canvas (relative 0-100)
  const [dronePos, setDronePos] = useState({ x: 150, y: 150 })
  const [isPlaying, setIsPlaying] = useState(false)
  const pathIndexRef = useRef(0)

  // Predefined flight paths for different fields (X, Y canvas points)
  const flightPaths: { [key: string]: { x: number; y: number }[] } = {
    north_wheat: [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 100 },
      { x: 50, y: 100 },
      { x: 50, y: 150 },
      { x: 250, y: 150 },
      { x: 250, y: 200 },
      { x: 50, y: 200 },
      { x: 50, y: 250 },
      { x: 250, y: 250 },
      { x: 150, y: 150 } // Go back home
    ],
    south_tomato: [
      { x: 80, y: 80 },
      { x: 120, y: 240 },
      { x: 180, y: 240 },
      { x: 140, y: 80 },
      { x: 200, y: 80 },
      { x: 240, y: 240 },
      { x: 150, y: 150 } // Home
    ],
    east_corn: [
      { x: 60, y: 150 },
      { x: 150, y: 60 },
      { x: 240, y: 150 },
      { x: 150, y: 240 },
      { x: 60, y: 150 }, // Diamond path
      { x: 150, y: 150 } // Home
    ]
  }

  // Draw simulation grid and path
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, 300, 300)

    // 1. Draw grid lines (satellite grid look)
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 300; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 300)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(300, i)
      ctx.stroke()
    }

    // 2. Draw active field boundary (semi-transparent green rectangle)
    ctx.fillStyle = activeField === 'north_wheat' ? 'rgba(16, 185, 129, 0.08)' : activeField === 'south_tomato' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(234, 179, 8, 0.08)'
    ctx.strokeStyle = activeField === 'north_wheat' ? 'rgba(16, 185, 129, 0.4)' : activeField === 'south_tomato' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(234, 179, 8, 0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.rect(40, 40, 220, 220)
    ctx.fill()
    ctx.stroke()

    // 3. Draw planned flight path (dotted line)
    const currentPath = flightPaths[activeField]
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(currentPath[0].x, currentPath[0].y)
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y)
    }
    ctx.stroke()
    ctx.setLineDash([]) // Reset line dash

    // 4. Draw hotspots as blinking warning dots
    hotspots.forEach(spot => {
      // Scale coordinates to fit visual display
      const sx = spot.lat === 39.9220 ? 210 : 90
      const sy = spot.lng === 32.8570 ? 80 : 210
      
      // Pulse animation effect
      const radius = 5 + Math.sin(Date.now() / 150) * 2
      ctx.fillStyle = spot.color === 'bg-rose-500' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'
      ctx.beginPath()
      ctx.arc(sx, sy, radius + 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = spot.color === 'bg-rose-500' ? '#ef4444' : '#f59e0b'
      ctx.beginPath()
      ctx.arc(sx, sy, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // 5. Draw flown path (solid green line up to current position)
    if (pathIndexRef.current > 0) {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)
      for (let i = 1; i <= pathIndexRef.current; i++) {
        if (i < currentPath.length) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y)
        }
      }
      ctx.lineTo(dronePos.x, dronePos.y)
      ctx.stroke()
    }

    // 6. Draw the Drone (glowing dot with circular range scanner)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(dronePos.x, dronePos.y, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#10b981'
    ctx.shadowColor = '#10b981'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(dronePos.x, dronePos.y, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0 // Reset shadow

  }, [dronePos, activeField, hotspots])

  // Simulation animation loop
  useEffect(() => {
    if (!isPlaying) return

    const currentPath = flightPaths[activeField]
    
    const updateDrone = () => {
      const targetPoint = currentPath[pathIndexRef.current]
      if (!targetPoint) {
        // Flight completed
        setIsPlaying(false)
        setTelemetry(prev => ({
          ...prev,
          speed: 0,
          altitude: 0,
          status: 'idle'
        }))
        return
      }

      // Move drone closer to target point
      const dx = targetPoint.x - dronePos.x
      const dy = targetPoint.y - dronePos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 2) {
        // Reached waypoint, move to next point
        pathIndexRef.current = (pathIndexRef.current + 1) % currentPath.length
        if (pathIndexRef.current === 0) {
          // Finished entire path
          setIsPlaying(false)
          setTelemetry(prev => ({
            ...prev,
            speed: 0,
            altitude: 0,
            status: 'idle'
          }))
          return
        }
      } else {
        // Interpolate position
        const speedFactor = 1.8
        setDronePos(prev => ({
          x: prev.x + (dx / distance) * speedFactor,
          y: prev.y + (dy / distance) * speedFactor
        }))

        // Update telemetry values dynamically during flight
        setTelemetry(prev => {
          const newBattery = Math.max(15, prev.battery - 0.05)
          const currentProgress = (pathIndexRef.current / currentPath.length) * 100
          
          return {
            ...prev,
            speed: 8.5 + Math.sin(Date.now() / 1000) * 0.5,
            altitude: 12 + Math.sin(Date.now() / 2000) * 0.2,
            battery: parseFloat(newBattery.toFixed(1)),
            latitude: 39.9207 + (dronePos.y / 10000),
            longitude: 32.8541 + (dronePos.x / 10000),
            areaCovered: parseFloat((currentProgress * 0.24).toFixed(1)),
            status: 'flying'
          }
        })
      }

      animationRef.current = requestAnimationFrame(updateDrone)
    }

    animationRef.current = requestAnimationFrame(updateDrone)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, dronePos, activeField])

  const startSimulation = () => {
    setIsPlaying(true)
    setTelemetry(prev => ({ ...prev, status: 'flying' }))
  }

  const stopSimulation = () => {
    setIsPlaying(false)
    setTelemetry(prev => ({ ...prev, status: 'paused', speed: 0 }))
  }

  const resetSimulation = () => {
    setIsPlaying(false)
    pathIndexRef.current = 0
    const startPoint = flightPaths[activeField][0]
    setDronePos({ x: startPoint.x, y: startPoint.y })
    setTelemetry({
      speed: 0,
      altitude: 0,
      battery: 100,
      latitude: 39.9207,
      longitude: 32.8541,
      areaCovered: 0,
      status: 'idle'
    })
  }

  const handleFieldChange = (field: string) => {
    setActiveField(field)
    setIsPlaying(false)
    pathIndexRef.current = 0
    const startPoint = flightPaths[field][0]
    setDronePos({ x: startPoint.x, y: startPoint.y })
    setTelemetry(prev => ({
      ...prev,
      speed: 0,
      altitude: 0,
      status: 'idle'
    }))
  }

  return (
    <div className="space-y-6 text-zinc-100">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Canlı Harita</h1>
        <p className="text-xs text-zinc-400">Aktif drone uçuşlarını, rota planlarını ve tespit edilen hastalık koordinatlarını harita üzerinden canlı izleyin.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column (Span 2): Visual Map Container */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center p-6 min-h-[400px]">
            
            {/* Map Header */}
            <div className="w-full flex items-center justify-between border-b border-zinc-850 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-200">Hava Gözlem Görünümü</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase">
                {activeField === 'north_wheat' ? 'Kuzey Buğday Sahası' : activeField === 'south_tomato' ? 'Güney Domates Sahası' : 'Doğu Mısır Sahası'}
              </Badge>
            </div>

            {/* Map Canvas with Satellite Style UI */}
            <div className="relative border border-zinc-800 rounded-xl bg-zinc-950/80 p-2 overflow-hidden shadow-inner">
              
              {/* Floating Map Indicators */}
              <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/90 border border-zinc-850 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur">
                  <Compass className="h-3 w-3 text-emerald-400" />
                  <span>Kuzey Yoğunluklu</span>
                </div>
              </div>

              {/* Bounded HTML Canvas for Drone Animation */}
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={300} 
                className="w-[300px] h-[300px] md:w-[380px] md:h-[380px] cursor-crosshair rounded-lg"
              />

              {/* Live coordinates watermark */}
              <div className="absolute right-4 bottom-4 text-[9px] font-mono text-zinc-600 z-10">
                LAT: {telemetry.latitude.toFixed(5)} / LNG: {telemetry.longitude.toFixed(5)}
              </div>
            </div>

            {/* Simulation controls */}
            <div className="w-full flex justify-center gap-3 mt-6">
              {!isPlaying ? (
                <Button 
                  onClick={startSimulation}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 text-xs"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  Simülasyonu Başlat
                </Button>
              ) : (
                <Button 
                  onClick={stopSimulation}
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 font-medium gap-2 text-xs"
                >
                  <Square className="h-3.5 w-3.5 fill-zinc-300" />
                  Simülasyonu Durdur
                </Button>
              )}

              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 font-medium gap-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sıfırla
              </Button>
            </div>

          </Card>
        </div>

        {/* Right Column: Telemetry & Navigation Panel */}
        <div className="space-y-6">
          
          {/* Telemetry HUD Widget */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold border-b border-zinc-850 pb-3">
                <Navigation className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="text-xs">Uçuş Telemetrisi (HUD)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                
                {/* Speed */}
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-1">
                  <span className="block text-[10px] text-zinc-500">Uçuş Hızı</span>
                  <span className="text-base font-bold text-zinc-200">{telemetry.speed.toFixed(1)} m/s</span>
                </div>

                {/* Altitude */}
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-1">
                  <span className="block text-[10px] text-zinc-500">Uçuş İrtifası</span>
                  <span className="text-base font-bold text-zinc-200">{telemetry.altitude.toFixed(1)} m</span>
                </div>

                {/* Battery percentage */}
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-1">
                  <span className="block text-[10px] text-zinc-500">Pil Durumu</span>
                  <span className="text-base font-bold text-zinc-200">🔋 %{telemetry.battery}</span>
                </div>

                {/* Area covered */}
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-1">
                  <span className="block text-[10px] text-zinc-500">Taranan Alan</span>
                  <span className="text-base font-bold text-zinc-200">{telemetry.areaCovered} ha</span>
                </div>

              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-zinc-500">Drone Uçuş Durumu:</span>
                <span className={`font-semibold capitalize ${
                  telemetry.status === 'flying' ? 'text-emerald-400' : telemetry.status === 'paused' ? 'text-amber-500' : 'text-zinc-400'
                }`}>
                  {telemetry.status === 'flying' ? '● Uçuyor' : telemetry.status === 'paused' ? '● Duraklatıldı' : '● Beklemede'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Area Rotations Selector */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-200">Rota / Saha Seçimi</h3>
              <p className="text-[10px] text-zinc-500">Dronun tarayacağı araziyi belirleyin:</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleFieldChange('north_wheat')}
                className={`p-3 rounded-lg text-xs font-semibold text-left border transition-all ${
                  activeField === 'north_wheat' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-750'
                }`}
              >
                🌾 Kuzey Buğday Sahası (9 Rota Noktası)
              </button>
              
              <button
                onClick={() => handleFieldChange('south_tomato')}
                className={`p-3 rounded-lg text-xs font-semibold text-left border transition-all ${
                  activeField === 'south_tomato' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-750'
                }`}
              >
                🍅 Güney Domates Sahası (5 Rota Noktası)
              </button>

              <button
                onClick={() => handleFieldChange('east_corn')}
                className={`p-3 rounded-lg text-xs font-semibold text-left border transition-all ${
                  activeField === 'east_corn' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-750'
                }`}
              >
                🌽 Doğu Mısır Sahası (4 Rota Noktası)
              </button>
            </div>
          </Card>

          {/* Active alerts on map */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-4.5 w-4.5" />
              <h3 className="text-xs font-semibold">Bölgesel Uyarılar</h3>
            </div>
            
            <div className="space-y-3">
              {hotspots.map(spot => (
                <div key={spot.id} className="flex gap-2.5 text-[11px] text-zinc-400 border-b border-zinc-850/50 pb-2 last:border-b-0 last:pb-0">
                  <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-zinc-300">{spot.name}</span>
                    <span className="block text-[10px] text-zinc-500">KONUM: {spot.lat}, {spot.lng}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  )
}
