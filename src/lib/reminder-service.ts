// Reminder service for MassageFlow
// This service handles automated appointment reminders

import { getAppointments } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'
import { format, isTomorrow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface ReminderResult {
  sent: number
  failed: number
  errors: string[]
}

class ReminderService {
  /**
   * Send reminders for appointments tomorrow
   * This should be called daily (e.g., via cron job at 9 AM)
   */
  async sendTomorrowReminders(): Promise<ReminderResult> {
    const result: ReminderResult = {
      sent: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get all confirmed appointments
      const allAppointments = await this.getAllAppointments()

      // Filter appointments for tomorrow
      const tomorrowAppointments = allAppointments.filter(apt => {
        if (!apt.date) return false
        const appointmentDate = parseISO(apt.date)
        return isTomorrow(appointmentDate) && apt.status === 'confirmed'
      })

      console.log(`📅 Found ${tomorrowAppointments.length} appointments for tomorrow`)

      // Send reminders for each appointment
      for (const appointment of tomorrowAppointments) {
        try {
          const success = await this.sendReminderForAppointment(appointment)
          if (success) {
            result.sent++
          } else {
            result.failed++
            result.errors.push(`Failed to send reminder for appointment ${appointment.id}`)
          }
        } catch (error) {
          result.failed++
          result.errors.push(`Error sending reminder for appointment ${appointment.id}: ${error}`)
        }

        // Small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100))
      }

    } catch (error) {
      console.error('❌ Error in sendTomorrowReminders:', error)
      result.errors.push(`General error: ${error}`)
    }

    console.log(`📧 Reminders sent: ${result.sent}, failed: ${result.failed}`)
    return result
  }

  /**
   * Get all appointments (this is a simplified version - in production you'd want pagination)
   */
  private async getAllAppointments() {
    try {
      // This is a simplified approach - in production you'd need to get all therapists first
      // For now, we'll assume we can get appointments, but this might need adjustment
      const appointments: any[] = []

      // In a real implementation, you'd loop through all therapists
      // For demo purposes, we'll return an empty array or implement differently

      return appointments
    } catch (error) {
      console.error('Error getting appointments:', error)
      return []
    }
  }

  /**
   * Send reminder for a specific appointment
   */
  private async sendReminderForAppointment(appointment: any): Promise<boolean> {
    try {
      // Get therapist profile for contact info
      const therapistProfile = await this.getTherapistProfile(appointment.therapist_id)
      if (!therapistProfile) {
        console.warn(`No therapist profile found for ID: ${appointment.therapist_id}`)
        return false
      }

      const reminderData = {
        clientName: appointment.client_name || 'Client',
        therapistName: `${therapistProfile.first_name} ${therapistProfile.last_name}`,
        date: format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: fr }),
        time: appointment.start_time,
        therapistPhone: therapistProfile.phone,
      }

      return await emailService.sendAppointmentReminder(reminderData)
    } catch (error) {
      console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
      return false
    }
  }

  /**
   * Get therapist profile by ID
   */
  private async getTherapistProfile(therapistId: string) {
    try {
      const { data, error } = await import('@/lib/supabase').then(({ supabase }) =>
        supabase
          .from('therapist_profiles')
          .select('*')
          .eq('id', therapistId)
          .single()
      )

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting therapist profile:', error)
      return null
    }
  }

  /**
   * Manual trigger for testing reminders
   * This can be called from a test page or API endpoint
   */
  async sendTestReminder(appointmentId?: string): Promise<ReminderResult> {
    console.log('🧪 Sending test reminder(s)...')

    if (appointmentId) {
      // Send reminder for specific appointment
      try {
        const appointment = await this.getAppointmentById(appointmentId)
        if (!appointment) {
          return { sent: 0, failed: 1, errors: ['Appointment not found'] }
        }

        const success = await this.sendReminderForAppointment(appointment)
        return success
          ? { sent: 1, failed: 0, errors: [] }
          : { sent: 0, failed: 1, errors: ['Failed to send reminder'] }
      } catch (error) {
        return { sent: 0, failed: 1, errors: [`Error: ${error}`] }
      }
    } else {
      // Send reminders for tomorrow
      return this.sendTomorrowReminders()
    }
  }

  /**
   * Get appointment by ID
   */
  private async getAppointmentById(appointmentId: string) {
    try {
      const { data, error } = await import('@/lib/supabase').then(({ supabase }) =>
        supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single()
      )

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting appointment:', error)
      return null
    }
  }
}

export const reminderService = new ReminderService()

// Export a function that can be called from external scripts
export async function sendDailyReminders(): Promise<ReminderResult> {
  return reminderService.sendTomorrowReminders()
}