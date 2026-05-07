'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getTherapistProfileBySlug, createClientRecord, createAppointment } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'
import { MASSAGE_TYPES } from '@/types'

interface BookingState {
  date: Date | null
  time: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  massage_type: string
  notes: string
}

export default function TherapistBookingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [therapist, setTherapist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [bookingData, setBookingData] = useState<BookingState>({
    date: null,
    time: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    massage_type: MASSAGE_TYPES[0],
    notes: '',
  })
  const [confirmationVisible, setConfirmationVisible] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!slug) return
      try {
        const profile = await getTherapistProfileBySlug(slug)
        setTherapist(profile)
      } catch (error) {
        console.error('Erreur profil thérapeute:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [slug])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      if (hour === 12) continue
      slots.push(`${hour}:00`)
      slots.push(`${hour}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setBookingData(prev => ({ ...prev, date }))
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingData(prev => ({ ...prev, time }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBookingData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!bookingData.first_name || !bookingData.last_name || !bookingData.email || !bookingData.phone) {
      toast.error('Veuillez renseigner tous les champs obligatoires.')
      return false
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez choisir une date et un horaire.')
      return false
    }
    return true
  }

  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endMinutes = minutes + 60
    const endHours = hours + Math.floor(endMinutes / 60)
    return `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !therapist) return
    if (!selectedDate || !selectedTime) return

    setSubmitting(true)

    try {
      const client = await createClientRecord({
        therapist_id: therapist.id,
        first_name: bookingData.first_name,
        last_name: bookingData.last_name,
        phone: bookingData.phone,
        email: bookingData.email,
        date_of_birth: '',
        notes: '',
        allergies: '',
        contraindications: '',
      })

      await createAppointment({
        therapist_id: therapist.id,
        client_id: client.id,
        date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime,
        end_time: calculateEndTime(selectedTime),
        duration: 60,
        type: bookingData.massage_type,
        status: 'confirmed',
        notes: bookingData.notes,
        client_name: `${bookingData.first_name} ${bookingData.last_name}`,
        client_email: bookingData.email,
        client_phone: bookingData.phone,
        is_new_client: true,
      })

      // Send confirmation email
      try {
        await emailService.sendAppointmentConfirmation({
          clientName: bookingData.first_name,
          therapistName: `${therapist.first_name} ${therapist.last_name}`,
          therapistSlug: therapist.slug,
          date: format(selectedDate, 'dd/MM/yyyy', { locale: fr }),
          time: selectedTime,
          duration: 60,
          type: bookingData.massage_type,
          therapistPhone: therapist.phone,
          therapistEmail: bookingData.email, // Using client's email for now, should be therapist's email
        })
        console.log('✅ Email de confirmation envoyé')
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email confirmation:', emailError)
        // Don't fail the booking if email fails
      }

      setConfirmationVisible(true)
      toast.success('Votre rendez-vous a bien été enregistré. Un email de confirmation vous a été envoyé.')
    } catch (error) {
      console.error('Erreur de réservation :', error)
      toast.error('Impossible de réserver, veuillez réessayer plus tard.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50 flex items-center justify-center">
        <div className="max-w-xl bg-white rounded-3xl shadow-sm border p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Therapeute introuvable</h1>
          <p className="text-gray-600 mb-6">Le lien de réservation est invalide ou le thérapeute n'est pas enregistré.</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const therapistName = `${therapist.first_name} ${therapist.last_name}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary-600 font-semibold">Réservez avec</p>
              <h1 className="text-4xl font-bold text-gray-900 mt-3">{therapistName}</h1>
              <p className="text-gray-600 mt-2">Sélectionnez une date, un créneau et renseignez vos informations.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-gray-700 border border-slate-200">
              <p className="font-semibold">Adresse</p>
              <p>{therapist.company_address || 'Adresse non renseignée'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choisissez une date</h2>
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentWeek(prev => addWeeks(prev, -1))}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Semaine précédente
              </button>
              <button
                type="button"
                onClick={() => setCurrentWeek(prev => addWeeks(prev, 1))}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Semaine suivante
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`rounded-3xl p-4 text-left border ${
                    selectedDate?.toDateString() === day.toDateString() ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="text-sm text-gray-500">{format(day, 'EEE', { locale: fr })}</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{format(day, 'd')}</p>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Choisissez un horaire</h3>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className={`rounded-3xl border px-4 py-3 text-sm font-medium transition-colors ${
                        selectedTime === slot ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vos informations</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Prénom</span>
                  <input
                    name="first_name"
                    value={bookingData.first_name}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none"
                    placeholder="Marie"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Nom</span>
                  <input
                    name="last_name"
                    value={bookingData.last_name}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none"
                    placeholder="Dupont"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none"
                    placeholder="vous@email.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Téléphone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none"
                    placeholder="06 12 34 56 78"
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Type de massage</span>
                <select
                  name="massage_type"
                  value={bookingData.massage_type}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none"
                >
                  {MASSAGE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none"
                  rows={4}
                  placeholder="Vos informations ou demandes spécifiques"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-6 py-4 text-white font-semibold hover:bg-primary-700 transition-colors disabled:cursor-not-allowed disabled:bg-primary-300"
              >
                {submitting ? 'Réservation en cours...' : 'Confirmer le rendez-vous'}
              </button>
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{therapistName}</h2>
            <p className="text-gray-600 mb-4">{therapist.bio || 'Votre thérapeute vous attend pour un moment de bien-être.'}</p>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Adresse</p>
                <p>{therapist.company_address || 'Adresse non renseignée'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Téléphone</p>
                <p>{therapist.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Cabinet</p>
                <p>{therapist.company_name || 'Cabinet massage'}</p>
              </div>
            </div>
          </div>

          {therapist.instagram && (
            <div className="bg-sage-50 rounded-3xl border border-sage-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Suivez sur Instagram</h3>
              <a href={`https://instagram.com/${therapist.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:underline">
                @{therapist.instagram}
              </a>
            </div>
          )}
        </aside>
      </div>

      {confirmationVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-w-xl w-full bg-white rounded-3xl border p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Rendez-vous confirmé</h2>
            <p className="text-gray-600 mb-6">Votre demande a bien été reçue. Vous recevrez bientôt une confirmation par email.</p>
            <Link href={`/therapist/${therapist.slug}/booking`} className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors">
              Retour à la page de réservation
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
