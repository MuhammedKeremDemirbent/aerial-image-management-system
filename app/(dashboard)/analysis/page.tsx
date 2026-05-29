'use client'

import { useState, useRef } from 'react'
import { 
  Leaf, 
  Upload, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Heart,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface AnalysisResult {
  crop: string
  disease: string
  scientificName: string
  severity: 'Kritik' | 'Orta' | 'Hafif' | 'Normal'
  confidence: number
  treatment: string[]
  description: string
  spots: { cx: number; cy: number; r: number }[]
}

const translateClass = (name: string) => {
  const mapping: { [key: string]: string } = {
    'healthy_strawberry': 'Sağlıklı Çilek Yaprağı',
    'powdery_mildew_strawberry': 'Çilek Külleme Hastalığı',
    'gray_mold_strawberry': 'Çilek Kurşuni Küf Hastalığı'
  }
  return mapping[name] || name
}

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [detections, setDetections] = useState<any[]>([])
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const testTemplates = [
    {
      id: 'tomato_blight',
      name: 'Domates Yaprağı (Erken Yanıklık)',
      crop: 'Domates',
      disease: 'Erken Yanıklık',
      scientificName: 'Alternaria solani',
      severity: 'Orta' as const,
      confidence: 96.5,
      description: 'Erken yanıklık, patates ve domates yapraklarında koyu halkalı lekelerle karakterize edilen fungal bir hastalıktır. Genellikle yaşlı alt yapraklarda başlar ve sıcak nemli havalarda hızla yayılır.',
      treatment: [
        'Hastalıklı yaprakları derhal budayarak imha edin.',
        'Bakır bazlı fungisitler veya difenokonazol etken maddeli ilaçlar kullanın.',
        'Yaprakların ıslanmasını önlemek için damlama sulama tercih edin.',
        'Bir sonraki ekim sezonunda münavebe (ürün rotasyonu) uygulayın.'
      ],
      spots: [
        { cx: 35, cy: 40, r: 8 },
        { cx: 55, cy: 30, r: 12 },
        { cx: 45, cy: 65, r: 10 },
        { cx: 65, cy: 55, r: 6 }
      ],
      color: '#f59e0b'
    },
    {
      id: 'wheat_rust',
      name: 'Buğday Yaprağı (Kahverengi Pas)',
      crop: 'Buğday',
      disease: 'Kahverengi Yaprak Pası',
      scientificName: 'Puccinia recondita',
      severity: 'Kritik' as const,
      confidence: 92.8,
      description: 'Kahverengi pas hastalığı, yaprak yüzeyinde püstül adı verilen turuncu-kahverengi spor yığınları oluşturur. Yaprağın fotosentez kapasitesini düşürerek ciddi verim kayıplarına yol açar.',
      treatment: [
        'Tebukonazol veya Triazole grubu sistemik fungisitler uygulayın.',
        'Pasa karşı dirençli buğday varyeteleri ekin.',
        'Fazla azot gübrelemesinden kaçının (hastalığı teşvik eder).',
        'Yabani buğdaygil konukçularını tarladan temizleyin.'
      ],
      spots: [
        { cx: 25, cy: 50, r: 5 },
        { cx: 35, cy: 48, r: 4 },
        { cx: 45, cy: 52, r: 6 },
        { cx: 55, cy: 50, r: 5 },
        { cx: 65, cy: 47, r: 4 },
        { cx: 75, cy: 51, r: 5 }
      ],
      color: '#ef4444'
    },
    {
      id: 'healthy_corn',
      name: 'Mısır Yaprağı (Sağlıklı)',
      crop: 'Mısır',
      disease: 'Sağlıklı Ürün',
      scientificName: 'Zea mays (Normal)',
      severity: 'Normal' as const,
      confidence: 99.1,
      description: 'Yaprak yapısı normal, klorofil yoğunluğu sağlıklı sınırlarda ve hastalık belirtisi olabilecek herhangi bir leke veya püstül saptanmadı.',
      treatment: [
        'Mevcut sulama ve gübreleme planına devam edin.',
        'Rutin haftalık drone izlemelerini sürdürün.',
        'Toprak nem oranını dengede tutun.'
      ],
      spots: [],
      color: '#10b981'
    }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
    }
  }

  const triggerSelectFile = () => {
    fileInputRef.current?.click()
  }

  const startAnalysis = async (selectedTemplate?: typeof testTemplates[0]) => {
    setScanning(true)
    setProgress(0)
    setResult(null)
    setDetections([])
    setError(null)

    if (selectedTemplate) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setScanning(false)
            setResult({
              crop: selectedTemplate.crop,
              disease: selectedTemplate.disease,
              scientificName: selectedTemplate.scientificName,
              severity: selectedTemplate.severity,
              confidence: selectedTemplate.confidence,
              description: selectedTemplate.description,
              treatment: selectedTemplate.treatment,
              spots: selectedTemplate.spots
            })
            return 100
          }
          return prev + 10
        })
      }, 150)
    } else {
      if (!file) {
        setScanning(false)
        return
      }

      // Pre-simulated upload progression
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev))
      }, 100)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        })

        clearInterval(interval)
        setProgress(100)

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Analiz işlemi başarısız oldu.')
        }

        const data = await response.json()
        setScanning(false)

        const dominant = data.dominant_disease || 'Healthy'
        const isHealthy = dominant.toLowerCase().includes('healthy') || dominant.toLowerCase().includes('sağlıklı')
        
        let severity: 'Kritik' | 'Orta' | 'Hafif' | 'Normal' = 'Orta'
        let description = `Yapay zeka modelimiz yaprak üzerinde ${translateClass(dominant)} teşhisi koymuştur.`
        let treatment: string[] = ['Rutin bakımları yapın.']
        let crop = 'Teşhis Edilen Bitki'
        let scientificName = 'YOLO Analiz Modeli'

        if (dominant.toLowerCase().includes('strawberry') || dominant.toLowerCase().includes('çilek')) {
          crop = 'Çilek'
        }

        if (isHealthy) {
          severity = 'Normal'
          scientificName = dominant.toLowerCase().includes('strawberry') ? 'Fragaria × ananassa (Normal)' : 'Normal Bitki'
          description = 'Çilek yaprak yapısı normal, klorofil yoğunluğu sağlıklı sınırlar içinde ve herhangi bir mantar veya hastalık belirtisi saptanmadı.'
          treatment = [
            'Mevcut sulama ve gübreleme planına devam edin.',
            'Rutin haftalık drone izlemelerini sürdürün.',
            'Yaprak nemini ve sıcaklığını tarla sensörleri üzerinden izleyin.'
          ]
        } else {
          if (dominant.toLowerCase().includes('mildew') || dominant.toLowerCase().includes('külleme')) {
            severity = 'Orta'
            scientificName = 'Podosphaera aphanis'
            description = 'Yaprak yüzeyinde Çilek Külleme Hastalığı (Powdery Mildew) tespit edildi. Yaprak yüzeyinde beyaz toz şeklinde mantar sporları oluşmaktadır ve bu durum gelişim hızını düşürebilir.'
            treatment = [
              'Kükürt bazlı organik fungisitler veya sistemik mantar ilaçları uygulayın.',
              'Aşırı azot gübrelemesinden kaçının (hastalığı tetikler).',
              'Sera veya tarla içi hava sirkülasyonunu artırmak için budama yapın.',
              'Sulama işlemini sabah erken saatlerde doğrudan kök bölgesine (damlama) yapın, yaprakları ıslatmaktan kaçının.'
            ]
          } else if (dominant.toLowerCase().includes('mold') || dominant.toLowerCase().includes('küf') || dominant.toLowerCase().includes('botrytis')) {
            severity = 'Kritik'
            scientificName = 'Botrytis cinerea'
            description = 'Görselde Çilek Kurşuni Küf Hastalığı (Gray Mold / Botrytis) tespit edildi. Bu fungal hastalık yaprak, çiçek ve özellikle meyvelerde kurşuni renkli kadifemsi küf tabakası oluşturarak hızlı çürümeye yol açar.'
            treatment = [
              'Fenheksamid, İprodion veya Fludioxonil etken maddeli spesifik Botrytis mantar ilaçları (fungisit) uygulayın.',
              'Enfekte olan yaprak, çiçek ve meyveleri derhal steril makasla keserek araziden uzaklaştırın ve imha edin.',
              'Sera içi nem oranını havalandırmayı artırarak düşürün (nem mantarın üremesini hızlandırır).',
              'Sulama işlemini sabah erken saatlerde doğrudan toprağa (damlama) yapın, üstten sulama yapmaktan kaçının.'
            ]
          } else if (dominant.toLowerCase().includes('rust') || dominant.toLowerCase().includes('pas')) {
            severity = 'Kritik'
            description = `Yaprak yüzeyinde ${translateClass(dominant)} (Pas hastalığı) tespit edildi. Püstüller yaprağın fotosentezini engellemektedir.`
            treatment = [
              'Tebukonazol veya Triazole grubu sistemik fungisitler uygulayın.',
              'Azot gübrelemesini sınırlandırın.',
              'Etkilenen bölgeleri karantinaya alın.'
            ]
          } else if (dominant.toLowerCase().includes('blight') || dominant.toLowerCase().includes('yanıklık')) {
            severity = 'Orta'
            description = `Yaprak yüzeyinde ${translateClass(dominant)} (Erken/Geç Yanıklık) hastalığı belirtileri tespit edildi.`
            treatment = [
              'Bakır içerikli ilaçlar veya fungisit uygulamaları yapın.',
              'Damlama sulama kullanarak yaprakların kuru kalmasını sağlayın.',
              'Budama artığı hastalıklı yaprakları derhal araziden uzaklaştırın.'
            ]
          } else {
            severity = 'Orta'
            description = `Yaprak üzerinde ${translateClass(dominant)} şüphesi taşıyan lekeler saptandı.`
            treatment = [
              'Gözlem sıklığını artırın.',
              'Gerekirse koruyucu geniş spektrumlu fungisit uygulayın.'
            ]
          }
        }

        setResult({
          crop,
          disease: translateClass(dominant),
          scientificName,
          severity,
          confidence: Math.round(data.max_confidence * 100) || 85,
          description,
          treatment,
          spots: []
        })

        setDetections(data.detections || [])
        setImageDimensions({ width: data.image_width || 1, height: data.image_height || 1 })

      } catch (err: any) {
        clearInterval(interval)
        setScanning(false)
        setError(err.message || 'Analiz sırasında bir hata oluştu.')
      }
    }
  }

  const handleTemplateClick = (template: typeof testTemplates[0]) => {
    setFile(null)
    setPreview(template.id) // unique identifier to show SVG template preview
    startAnalysis(template)
  }

  const resetPage = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setProgress(0)
  }

  const renderLeafSVG = (spots: { cx: number; cy: number; r: number }[], leafColor: string = '#10b981', spotColor: string = '#ef4444') => {
    return (
      <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf Stem */}
        <path d="M50 90 C 50 60, 50 40, 50 10" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Main Leaf Body */}
        <path 
          d="M50 15 C 20 40, 15 70, 50 85 C 85 70, 80 40, 50 15 Z" 
          fill={leafColor} 
          fillOpacity="0.25" 
          stroke={leafColor} 
          strokeWidth="2" 
          className="transition-all duration-500"
        />

        {/* Leaf Veins */}
        <path d="M50 70 C 40 60, 30 62, 28 62" stroke={leafColor} strokeWidth="1" strokeOpacity="0.5" />
        <path d="M50 70 C 60 60, 70 62, 72 62" stroke={leafColor} strokeWidth="1" strokeOpacity="0.5" />
        <path d="M50 50 C 35 40, 25 45, 23 45" stroke={leafColor} strokeWidth="1" strokeOpacity="0.5" />
        <path d="M50 50 C 65 40, 75 45, 77 45" stroke={leafColor} strokeWidth="1" strokeOpacity="0.5" />
        <path d="M50 30 C 40 22, 32 25, 30 25" stroke={leafColor} strokeWidth="1" strokeOpacity="0.5" />
        <path d="M50 30 C 60 22, 68 25, 70 25" stroke={leafColor} strokeWidth="1" strokeOpacity="0.5" />

        {/* Disease Spots */}
        {spots.map((spot, i) => (
          <circle 
            key={i} 
            cx={spot.cx} 
            cy={spot.cy} 
            r={spot.r} 
            fill={spotColor} 
            fillOpacity="0.6" 
            className="animate-pulse" 
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </svg>
    )
  }

  return (
    <div className="space-y-6 text-zinc-100">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">AI Yaprak Analizi</h1>
        <p className="text-xs text-zinc-400">Tarım arazilerinden çekilen yaprak fotoğraflarını yükleyin ve yapay zeka tabanlı hastalık teşhisi alın.</p>
      </div>

      {/* Grid: Left - Upload Zone, Right - Results */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        
        {/* Upload Zone & Test Templates (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />

              {/* Upload Drop Zone */}
              {!preview ? (
                <div 
                  onClick={triggerSelectFile}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-8 cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all group"
                >
                  <div className="rounded-full bg-zinc-950 p-4 border border-zinc-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-950/10 text-zinc-400 group-hover:text-emerald-400 transition-all mb-4">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">Fotoğraf Yükleyin veya Sürükleyin</span>
                  <span className="text-[10px] text-zinc-500 mt-1">PNG, JPG veya JPEG (Maks. 5MB)</span>
                </div>
              ) : (
                <div className="relative border border-zinc-800 rounded-xl p-4 bg-zinc-950/40 flex flex-col items-center">
                  
                  {/* SVG or Image Preview */}
                  {preview === 'tomato_blight' && renderLeafSVG(result?.spots || [], '#f59e0b', '#b45309')}
                  {preview === 'wheat_rust' && renderLeafSVG(result?.spots || [], '#ef4444', '#991b1b')}
                  {preview === 'healthy_corn' && renderLeafSVG([], '#10b981')}
                  {preview !== 'tomato_blight' && preview !== 'wheat_rust' && preview !== 'healthy_corn' && (
                    <div className="relative w-full aspect-video max-h-[300px] flex items-center justify-center bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                      <img 
                        src={preview} 
                        alt="Uploaded leaf preview" 
                        className="max-h-[300px] w-auto h-auto object-contain"
                      />

                      {/* Scanning Line overlay */}
                      {scanning && (
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_#10b981] animate-scan z-10" />
                      )}

                      {/* Bounding boxes overlays */}
                      {result && detections.map((det, idx) => {
                        if (!det.box) return null;
                        const [x1, y1, x2, y2] = det.box;
                        
                        // Calculate percentage values
                        const left = (x1 / imageDimensions.width) * 100;
                        const top = (y1 / imageDimensions.height) * 100;
                        const width = ((x2 - x1) / imageDimensions.width) * 100;
                        const height = ((y2 - y1) / imageDimensions.height) * 100;
                        
                        return (
                          <div
                            key={idx}
                            className="absolute border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)] group"
                            style={{
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                            }}
                          >
                            <span className="absolute -top-5 left-0 rounded bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white whitespace-nowrap shadow-md">
                              {translateClass(det.class_name)} (%{Math.round(det.confidence * 100)})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Scanning Overlay State */}
                  {scanning && (
                    <div className="w-full mt-4 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span className="flex items-center gap-1.5 animate-pulse text-emerald-400">
                          <Sparkles className="h-3.5 w-3.5" /> AI Taraması Yapılıyor...
                        </span>
                        <span>%{progress}</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-zinc-900 text-emerald-500" />
                    </div>
                  )}

                  {/* Error Message display */}
                  {error && (
                    <div className="mt-4 w-full rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Manual trigger button */}
                  {!scanning && !result && (
                    <Button 
                      onClick={() => startAnalysis()}
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Analizini Başlat
                    </Button>
                  )}

                  {/* Reset/Cancel button */}
                  {!scanning && (
                    <button 
                      onClick={resetPage} 
                      className="text-xs text-zinc-500 hover:text-zinc-300 underline mt-4 transition-colors"
                    >
                      Fotoğrafı Değiştir / Temizle
                    </button>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          {/* Test Templates */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-200">Hızlı Test Şablonları</h3>
                <p className="text-[11px] text-zinc-500">Bilgisayarınızda hazır fotoğraf yoksa aşağıdaki numunelerle sistemi test edin:</p>
              </div>

              <div className="flex flex-col gap-2">
                {testTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    disabled={scanning}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900 hover:border-zinc-700 text-left transition-all text-xs font-medium text-zinc-300 disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: template.color }} />
                      <span>{template.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Results Info (Span 3) */}
        <div className="lg:col-span-3">
          {result ? (
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-6">
              
              {/* Header result info */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-zinc-850/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Bitki Türü: {result.crop}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="text-xs italic text-zinc-500">{result.scientificName}</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100">{result.disease}</h2>
                </div>

                <div className="flex gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 font-bold">
                    AI GÜVEN: %{result.confidence}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2.5 py-0.5 ${
                    result.severity === 'Kritik' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                    result.severity === 'Orta' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    result.severity === 'Hafif' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    result.severity === 'Normal' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {result.severity} Düzey
                  </Badge>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
                  <Info className="h-4 w-4 text-emerald-400" />
                  <span>Teşhis Özeti</span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-400 bg-zinc-950/20 border border-zinc-850/50 p-4 rounded-xl">
                  {result.description}
                </p>
              </div>

              {/* Action and treatment details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
                  <ShieldAlert className="h-4 w-4 text-emerald-400" />
                  <span>Tedavi ve Önleme Planı</span>
                </div>
                <ul className="space-y-2.5">
                  {result.treatment.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-400">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </Card>
          ) : (
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="rounded-full bg-zinc-950 p-4 border border-zinc-800 text-zinc-600 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">Rapor Hazırlanıyor</h3>
              <p className="text-xs text-zinc-500 max-w-xs mt-1.5">
                Sol taraftan bir fotoğraf yükleyip AI Analizini başlatın veya hızlı numunelerden birini seçerek analizi simüle edin.
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  )
}
