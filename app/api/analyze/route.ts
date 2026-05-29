import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Dosya yüklenmedi' }, { status: 400 })
    }

    // Python FastAPI sunucusuna yönlendir
    const pythonFormData = new FormData()
    pythonFormData.append('file', file)

    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      body: pythonFormData,
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Yapay Zeka API hatası: ${errText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Next.js API Yönlendirme Hatası:', error)
    return NextResponse.json(
      { error: `Sunucuyla bağlantı kurulamadı: ${error.message}` },
      { status: 500 }
    )
  }
}
