'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Phone, Mail, Check, ArrowLeft, AlertCircle } from 'lucide-react'
import { mockTherapist } from '@/lib/mock-data'
import { MASSAGE_TYPES, HealthForm, BookingFormData } from '@/types'
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { createAppointment, createHealthForm } from '@/lib/supabase'

type BookingStep = 'calendar' | 'details' | 'health' | 'confirmation'

interface BookingState extends BookingFormData {
  date: Date | null
  time: string | null
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [submitting, setSubmitting] = useState(false)

  const [bookingData, setBookingData] = useState<BookingState>({
    date: null,
    time: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    massage_type: MASSAGE_TYPES[0],
    notes: '',
    health_form: {
      current_pain: '',
      sensitive_zones: '',
      medical_conditions: '',
      pregnancy: false,
      stress_level: 5,
      massage_objective: 'relaxation',
      additional_notes: '',
    },
  })

  // Generate available time slots (9h-18h, every 30min, excluding lunch 12h-14h)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      if (hour === 12) continue // Skip lunch hour
      slots.push(`${hour}:00`)
      slots.push(`${hour}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Get week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setBookingData(prev => ({ ...prev, date }))
    setCurrentStep('details')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingData(prev => ({ ...prev, time }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }))
  }

  const handleHealthFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setBookingData(prev => ({
      ...prev,
      health_form: {
        ...prev.health_form,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseInt(value) : value,
      },
    }))
  }

  const validateStep = (): boolean => {
    if (currentStep === 'details') {
      if (!bookingData.first_name || !bookingData.last_name || !bookingData.email || !bookingData.phone) {
        toast.error('Veuillez remplir tous les champs requis')
        return false
      }
      if (!selectedTime) {
        toast.error('Veuillez sélectionner un horaire')
        return false
      }
    } else if (currentStep === 'health') {
      if (!bookingData.health_form.current_pain || !bookingData.health_form.sensitive_zones) {
        toast.error('Veuillez remplir la fiche santé')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (currentStep === 'details') {
      setCurrentStep('health')
    } else if (currentStep === 'health') {
      setCurrentStep('confirmation')
    }
  }

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endMinutes = minutes + 60 // 60 minutes massage
    const endHours = hours + Math.floor(endMinutes / 60)
    const finalMinutes = endMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setSubmitting(true)

    try {
      // 1. Create health form first
      const healthFormData = {
        current_pain: bookingData.health_form.current_pain,
        sensitive_zones: bookingData.health_form.sensitive_zones,
        medical_conditions: bookingData.health_form.medical_conditions,
        pregnancy: bookingData.health_form.pregnancy,
        stress_level: bookingData.health_form.stress_level,
        massage_objective: bookingData.health_form.massage_objective,
        additional_notes: bookingData.health_form.additional_notes,
      }

      const healthForm = await createHealthForm(healthFormData)

      // 2. Create appointment
      const appointmentData = {
        therapist_id: 'demo-user-id', // In a real app, this would be the actual therapist ID
        client_id: '', // Empty for new clients
        date: selectedDate!.toISOString().split('T')[0],
        start_time: selectedTime!,
        end_time: calculateEndTime(selectedTime!),
        duration: 60, // Default 60 minutes
        type: bookingData.massage_type,
        status: 'confirmed' as const,
        notes: bookingData.notes,
        health_form_id: healthForm.id,
        is_new_client: true,
        client_name: `${bookingData.first_name} ${bookingData.last_name}`,
        client_email: bookingData.email,
        client_phone: bookingData.phone,
      }

      await createAppointment(appointmentData)

      setCurrentStep('confirmation')
      toast.success('Rendez-vous confirmé ! Vous recevrez un email de confirmation.')
    } catch (error) {
      console.error('Erreur lors de la réservation:', error)
      toast.error('Erreur lors de la réservation. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('calendar')
      setSelectedTime(null)
    } else if (currentStep === 'health') {
      setCurrentStep('details')
    } else if (currentStep === 'confirmation') {
      window.location.reload()
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : addWeeks(prev, -1))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prendre rendez-vous</h1>
              <p className="text-gray-600 mt-1">
                {mockTherapist.first_name} {mockTherapist.last_name} - {mockTherapist.company_name}
              </p>
            </div>
            {currentStep !== 'calendar' && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-1">
            {(['calendar', 'details', 'health', 'confirmation'] as const).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === currentStep ? 'bg-primary-600 text-white' :
                  (['calendar', 'details', 'health', 'confirmation'].indexOf(step) < ['calendar', 'details', 'health', 'confirmation'].indexOf(currentStep))
                    ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 ${
                    ['calendar', 'details', 'health', 'confirmation'].indexOf(step) < ['calendar', 'details', 'health', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step labels */}
        <div className="flex justify-between text-xs font-medium text-gray-600 mb-8 max-w-[350px] mx-auto">
          <span>Date</span>
          <span>Infos</span>
          <span>Santé</span>
          <span>Confirmation</span>
        </div>

        {/* Calendar Step */}
        {currentStep === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choisissez une date</h2>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-900">
                {format(weekStart, 'dd MMM', { locale: fr })} - {format(weekEnd, 'dd MMM', { locale: fr })}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 transform rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((day) => (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(day)}
                  disabled={day < new Date()}
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                    day < new Date()
                      ? 'text-gray-300 cursor-not-allowed'
                      : selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 hover:border-primary-400 text-gray-900'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Link
                href="/about"
                className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Voir le profil
              </Link>
            </div>
          </div>
        )}

        {/* Details Step */}
        {currentStep === 'details' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Vos coordonnées</h2>

            {/* Selected date/time */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-primary-900">
                    {selectedDate && format(selectedDate, 'EEEE dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {/* Time selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Horaire</h3>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-2 rounded-lg border text-center text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={bookingData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={bookingData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de massage
                </label>
                <select
                  name="massage_type"
                  value={bookingData.massage_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  {MASSAGE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Remarques particulières..."
                />
              </div>
            </form>

            <button
              onClick={handleNext}
              className="w-full mt-6 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Continuer vers fiche santé
            </button>
          </div>
        )}

        {/* Health Form Step */}
        {currentStep === 'health' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Fiche santé obligatoire:</strong> Ces informations nous aident à adapter le massage à vos besoins.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Douleurs actuelles *
                </label>
                <textarea
                  name="current_pain"
                  value={bookingData.health_form.current_pain}
                  onChange={handleHealthFormChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Décrivez vos douleurs..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zones sensibles *
                </label>
                <textarea
                  name="sensitive_zones"
                  value={bookingData.health_form.sensitive_zones}
                  onChange={handleHealthFormChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Zones à éviter ou à traiter avec précaution..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions médicales
                </label>
                <textarea
                  name="medical_conditions"
                  value={bookingData.health_form.medical_conditions}
                  onChange={handleHealthFormChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Allergie, problèmes de santé, chirurgies récentes..."
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="pregnancy"
                    checked={bookingData.health_form.pregnancy}
                    onChange={handleHealthFormChange}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Grossesse</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Niveau de stress (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="stress_level"
                    min="1"
                    max="10"
                    value={bookingData.health_form.stress_level}
                    onChange={handleHealthFormChange}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-primary-600 w-8">
                    {bookingData.health_form.stress_level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectif du massage
                </label>
                <select
                  name="massage_objective"
                  value={bookingData.health_form.massage_objective}
                  onChange={handleHealthFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="relaxation">Relaxation générale</option>
                  <option value="pain">Soulagement de la douleur</option>
                  <option value="recovery">Récupération sportive</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes supplémentaires
                </label>
                <textarea
                  name="additional_notes"
                  value={bookingData.health_form.additional_notes}
                  onChange={handleHealthFormChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Toute autre information utile..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Confirmation...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="bg-white rounded-xl shadow-sm border p-8 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
            <p className="text-gray-600 mb-8">
              Votre demande a été enregistrée. Vous recevrez un email de confirmation dans quelques minutes.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium text-gray-900">
                    {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Heure:</span>
                  <p className="font-medium text-gray-900">{selectedTime}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-gray-900">{bookingData.massage_type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Client:</span>
                  <p className="font-medium text-gray-900">
                    {bookingData.first_name} {bookingData.last_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/about"
                className="flex-1 text-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Voir le profil
              </Link>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}