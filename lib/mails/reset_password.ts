import { sendEmail } from './email'

// sendEmail'i re-export et — dışarıdan tek dosyadan import edilebilsin
export { sendEmail }

// Şifre sıfırlama e-postası HTML şablonu
export function passwordResetEmailHtml(resetUrl: string, userName?: string) {
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <body style="font-family: Arial, sans-serif; background: #0f0f0f; color: #e4e4e7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: rgba(16,185,129,0.1); border-radius: 50%; padding: 16px; margin-bottom: 16px;">
            <span style="font-size: 32px;">🌿</span>
          </div>
          <h1 style="color: #f4f4f5; font-size: 22px; margin: 0;">Şifre Sıfırlama</h1>
        </div>

        <p style="color: #a1a1aa; line-height: 1.6;">
          ${userName ? `Merhaba <strong style="color: #f4f4f5;">${userName}</strong>,` : 'Merhaba,'}
        </p>
        <p style="color: #a1a1aa; line-height: 1.6;">
          Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu link <strong style="color: #f4f4f5;">1 saat</strong> geçerlidir.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #059669; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; display: inline-block;">
            Şifremi Sıfırla
          </a>
        </div>

        <p style="color: #71717a; font-size: 13px; line-height: 1.6;">
          Bu isteği siz yapmadıysanız bu e-postayı güvenle görmezden gelebilirsiniz.
        </p>
        <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
        <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
          Bitki Hastalık Tespiti Sistemi
        </p>
      </div>
    </body>
    </html>
  `
}
