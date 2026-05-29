import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. TTN'den gelen ham Payload'ı doğrula ve cihaz ID'sini al
    const deviceId = body.end_device_ids?.device_id
    const decoded = body.uplink_message?.decoded_payload

    if (!deviceId || !decoded) {
      console.warn('Eksik veri formatı. Gelen gövde:', JSON.stringify(body))
      return NextResponse.json(
        { error: 'Eksik veya geçersiz veri yapısı' },
        { status: 400 }
      )
    }

    // 2. Farklı payload formatlarına karşı esnek alan kontrolü
    const temperature = decoded.temperature !== undefined ? decoded.temperature : decoded.temp
    const moisture = decoded.moisture !== undefined ? decoded.moisture : decoded.soil_moisture
    const battery = decoded.battery !== undefined ? decoded.battery : decoded.bat
    const latitude = decoded.latitude !== undefined ? decoded.latitude : decoded.gps_lat
    const longitude = decoded.longitude !== undefined ? decoded.longitude : decoded.gps_lng

    // 3. Supabase sensor_data tablosuna ekle
    const { error } = await supabaseAdmin
      .from('sensor_data')
      .insert([
        {
          device_id: deviceId,
          temperature: temperature !== undefined ? parseFloat(temperature) : null,
          moisture: moisture !== undefined ? parseFloat(moisture) : null,
          battery: battery !== undefined ? parseFloat(battery) : null,
          latitude: latitude !== undefined ? parseFloat(latitude) : null,
          longitude: longitude !== undefined ? parseFloat(longitude) : null
        }
      ])

    if (error) {
      console.error('Supabase veri ekleme hatası:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[LoRaWAN] Cihaz: ${deviceId} verisi başarıyla kaydedildi. Sıcaklık: ${temperature}, Nem: ${moisture}`)
    return NextResponse.json({ success: true, message: 'Veri kaydedildi' }, { status: 200 })

  } catch (error: any) {
    console.error('TTN Webhook Hatası:', error)
    return NextResponse.json(
      { error: `Sunucu hatası: ${error.message}` },
      { status: 500 }
    )
  }
}
