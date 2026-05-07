'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getAppointments } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CalendarPage() {
  const { therapistProfile } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    const loadAppointments = async () => {
      if (!therapistProfile) return

      try {
        const appointmentsData = await getAppointments(therapistProfile.id)
        setAppointments(appointmentsData)
      } catch (error) {
        console.error('Erreur chargement RDV:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [therapistProfile])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt =>
      isSameDay(new Date(apt.date), date)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos rendez-vous et disponibilités
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau RDV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentDate)

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary-50 border-primary-300' : 'hover:bg-gray-50'}
                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt: any) => (
                        <div
                          key={apt.id}
                          className="text-xs bg-primary-100 text-primary-700 px-1 py-0.5 rounded truncate"
                        >
                          {apt.start_time} - {apt.client_name || 'Client'}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected date appointments */}
          {selectedDate && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>

              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-600 text-sm">Aucun rendez-vous ce jour</p>
              ) : (
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate).map((apt: any) => (
                    <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {apt.start_time} - {apt.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {apt.client_name || `${apt.client?.first_name} ${apt.client?.last_name}`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {apt.type} - {apt.duration} min
                      </div>
                      {apt.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          {apt.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RDV ce mois</span>
                <span className="text-sm font-medium">
                  {appointments.filter(apt =>
                    new Date(apt.date).getMonth() === currentDate.getMonth() &&
                    new Date(apt.date).getFullYear() === currentDate.getFullYear()
                  ).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RDV aujourd'hui</span>
                <span className="text-sm font-medium">
                  {getAppointmentsForDate(new Date()).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Prochains RDV</span>
                <span className="text-sm font-medium">
                  {appointments.filter(apt => new Date(apt.date) > new Date()).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}