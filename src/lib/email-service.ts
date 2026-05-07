// Email service for MassageFlow
// This service handles email confirmations and reminders

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export interface AppointmentConfirmationData {
  clientName: string
  therapistName: string
  therapistSlug: string
  date: string
  time: string
  duration: number
  type: string
  therapistPhone?: string
  therapistEmail?: string
}

export interface ReminderData {
  clientName: string
  therapistName: string
  date: string
  time: string
  therapistPhone?: string
}

// Mock email service - in production, integrate with EmailJS, SendGrid, or similar
class EmailService {
  private isDemoMode(): boolean {
    return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
           process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo') ||
           !process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (this.isDemoMode()) {
      console.log('📧 [DEMO MODE] Email would be sent:', emailData)
      return true
    }

    try {
      // In production, integrate with your email service
      // Example with EmailJS:
      // const response = await emailjs.send(
      //   'service_id',
      //   'template_id',
      //   {
      //     to_email: emailData.to,
      //     subject: emailData.subject,
      //     message: emailData.html
      //   }
      // )

      // For now, we'll simulate success
      console.log('📧 Email sent successfully to:', emailData.to)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  generateAppointmentConfirmationEmail(data: AppointmentConfirmationData): EmailData {
    const subject = `Confirmation de votre rendez-vous avec ${data.therapistName}`

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MassageFlow</h1>
            <p>Votre rendez-vous est confirmé !</p>
          </div>

          <div class="content">
            <h2>Bonjour ${data.clientName},</h2>

            <p>Votre rendez-vous de massage a été confirmé avec succès. Voici les détails :</p>

            <div class="appointment-details">
              <h3>📅 Détails du rendez-vous</h3>
              <p><strong>Thérapeute :</strong> ${data.therapistName}</p>
              <p><strong>Date :</strong> ${data.date}</p>
              <p><strong>Heure :</strong> ${data.time}</p>
              <p><strong>Durée :</strong> ${data.duration} minutes</p>
              <p><strong>Type de massage :</strong> ${data.type}</p>
            </div>

            <p><strong>📍 Adresse :</strong> L'adresse sera communiquée par votre thérapeute.</p>

            <p><strong>📞 Contact :</strong> ${data.therapistPhone || 'À confirmer'}</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://massageflow.app/therapist/${data.therapistSlug}" class="button">
                Voir le profil du thérapeute
              </a>
            </div>

            <p><strong>❓ Questions ?</strong> N'hésitez pas à contacter directement votre thérapeute.</p>

            <p>Nous vous souhaitons une excellente séance de massage !</p>

            <p>Cordialement,<br>L'équipe MassageFlow</p>
          </div>

          <div class="footer">
            <p>Cet email a été envoyé automatiquement par MassageFlow.</p>
            <p>© 2024 MassageFlow - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `

    return {
      to: data.clientName.includes('@') ? data.clientName : '', // This should be the client's email
      subject,
      html,
      text: `Confirmation de rendez-vous avec ${data.therapistName} le ${data.date} à ${data.time}`
    }
  }

  generateReminderEmail(data: ReminderData): EmailData {
    const subject = `Rappel : Votre rendez-vous demain avec ${data.therapistName}`

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Rappel MassageFlow</h1>
            <p>Votre rendez-vous est demain !</p>
          </div>

          <div class="content">
            <h2>Bonjour ${data.clientName},</h2>

            <p>Ceci est un rappel automatique pour votre rendez-vous de demain.</p>

            <div class="reminder-box">
              <h3>📅 Votre rendez-vous demain</h3>
              <p><strong>Thérapeute :</strong> ${data.therapistName}</p>
              <p><strong>Date :</strong> ${data.date}</p>
              <p><strong>Heure :</strong> ${data.time}</p>
            </div>

            <p><strong>📞 Contact :</strong> ${data.therapistPhone || 'À confirmer'}</p>

            <p>Nous vous attendons avec impatience ! N'oubliez pas d'arriver 5-10 minutes en avance.</p>

            <p>À demain,<br>L'équipe MassageFlow</p>
          </div>

          <div class="footer">
            <p>Cet email a été envoyé automatiquement par MassageFlow.</p>
            <p>© 2024 MassageFlow - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `

    return {
      to: data.clientName.includes('@') ? data.clientName : '', // This should be the client's email
      subject,
      html,
      text: `Rappel : Rendez-vous demain avec ${data.therapistName} à ${data.time}`
    }
  }

  async sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<boolean> {
    const emailData = this.generateAppointmentConfirmationEmail(data)
    return this.sendEmail(emailData)
  }

  async sendAppointmentReminder(data: ReminderData): Promise<boolean> {
    const emailData = this.generateReminderEmail(data)
    return this.sendEmail(emailData)
  }
}

export const emailService = new EmailService()