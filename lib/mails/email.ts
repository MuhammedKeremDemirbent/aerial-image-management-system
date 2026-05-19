import nodemailer from 'nodemailer' //e-posta kütüphanesidir

/*
Bu dosya sistemin kalbidir. Görevi, diğer sayfalardan gelen Şu adrese şu mesajı götür
taleplerini alıp, e-posta sunucusuna (SMTP) bağlayarak göndermektir.
*/

// SMTP Transporter — .env.local'daki ayarlara göre çalışır
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: process.env.SMTP_SECURE === 'true', // Mailpit için false, Gmail için true
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Bitki Hastalık Tespiti" <noreply@localhost>',
    to,
    subject,
    html,
  })

  console.log('📧 E-posta gönderildi:', info.messageId)
  return info
}
