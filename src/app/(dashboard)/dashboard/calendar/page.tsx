'use client'

import React, { useState, Fragment } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  X,
  Check,
  XCircle
} from 'lucide-react'
import { mockAppointments, mockClients, mockTherapist } from '@/lib/mock-data'
import { Appointment, Client } from '@/types'
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, addMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

type ViewMode = 'day' | 'week' | 'month'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    date: '',
    start_time: '09:00',
    duration: 60,
    type: 'Suédois',
    notes: '',
  })

  const navigate = (direction: 'prev' | 'next') => {
    const multiplier = 1
    if (viewMode === 'day') {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? addWeeks(currentDate, -1) : addWeeks(currentDate, 1))
    } else {
      setCurrentDate(direction === 'prev' ? addMonths(currentDate, -1) : addMonths(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDaysToDisplay = () => {
    if (viewMode === 'day') {
      return [currentDate]
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    }
  }

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.filter(apt => apt.date === dateStr)
  }

  const handleOpenModal = (date?: Date, appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setFormData({
        client_id: appointment.client_id,
        date: appointment.date,
        start_time: appointment.start_time,
        duration: appointment.duration,
        type: appointment.type,
        notes: appointment.notes,
      })
    } else {
      setSelectedAppointment(null)
      setFormData({
        client_id: '',
        date: date ? format(date, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        duration: 60,
        type: 'Suédois',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const checkConflict = (newStart: string, newDuration: number, excludeId?: string): boolean => {
    const newStartMinutes = parseInt(newStart.split(':')[0]) * 60 + parseInt(newStart.split(':')[1])
    const newEndMinutes = newStartMinutes + newDuration + mockTherapist.buffer_time
    
    const dayAppointments = appointments.filter(
      apt => apt.date === formData.date && apt.id !== excludeId
    )
    
    return dayAppointments.some(apt => {
      const aptStartMinutes = parseInt(apt.start_time.split(':')[0]) * 60 + parseInt(apt.start_time.split(':')[1])
      const aptEndMinutes = aptStartMinutes + apt.duration
      
      return (newStartMinutes < aptEndMinutes && newEndMinutes > aptStartMinutes)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for conflicts
    if (checkConflict(formData.start_time, formData.duration, selectedAppointment?.id)) {
      toast.error('Ce créneau horaire est déjà réservé')
      return
    }

    const client = mockClients.find(c => c.id === formData.client_id)
    const endTime = addMinutes(
      parseISO(`2000-01-01T${formData.start_time}`),
      formData.duration
    )
    const endTimeStr = format(endTime, 'HH:mm')

    if (selectedAppointment) {
      // Update existing appointment
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { 
              ...apt, 
              ...formData, 
              end_time: endTimeStr,
              client,
              updated_at: new Date().toISOString() 
            }
          : apt
      ))
      toast.success('Rendez-vous mis à jour')
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        therapist_id: 'therapist-1',
        ...formData,
        end_time: endTimeStr,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client,
      }
      setAppointments([...appointments, newAppointment])
      toast.success('Rendez-vous créé')
    }
    
    setShowModal(false)
  }

  const updateStatus = (appointmentId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status, updated_at: new Date().toISOString() }
        : apt
    ))
    toast.success(`Statut mis à jour: ${status === 'confirmed' ? 'Confirmé' : status === 'cancelled' ? 'Annulé' : 'Terminé'}`)
  }

  const deleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter(apt => apt.id !== appointmentId))
    setSelectedAppointment(null)
    toast.success('Rendez-vous supprimé')
  }

  const days = getDaysToDisplay()
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8) // 8h to 19h

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau RDV
        </button>
      </div>

      {/* Calendar controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mois
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        {viewMode === 'month' ? (
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              const dayAppointments = getAppointmentsForDay(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)
              
              return (
                <div 
                  key={idx}
                  className={`bg-white min-h-[100px] p-2 ${!isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div 
                        key={apt.id}
                        onClick={() => handleOpenModal(undefined, apt)}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {apt.start_time} - {apt.client?.first_name}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 3} plus
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : viewMode === 'week' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-px bg-gray-200">
                <div className="bg-gray-50 p-2" />
                {days.map((day, idx) => {
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div 
                      key={idx}
                      className={`bg-gray-50 p-2 text-center ${isToday ? 'bg-primary-50' : ''}`}
                    >
                      <div className="text-xs text-gray-500">{format(day, 'EEE', { locale: fr })}</div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-8 gap-px bg-gray-200">
                {timeSlots.map(hour => (
                  <Fragment key={hour}>
                    <div className="bg-gray-50 p-2 text-xs text-gray-500 text-right pr-3">
                      {hour}:00
                    </div>
                    {days.map((day, dayIdx) => {
                      const dayAppointments = getAppointmentsForDay(day).filter(apt => {
                        const aptHour = parseInt(apt.start_time.split(':')[0])
                        return aptHour === hour
                      })
                      
                      return (
                        <div 
                          key={dayIdx}
                          className="bg-white min-h-[60px] p-1 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleOpenModal(day)}
                        >
                          {dayAppointments.map(apt => (
                            <div
                              key={apt.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenModal(undefined, apt)
                              }}
                              className={`text-xs p-1.5 rounded mb-1 cursor-pointer ${
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-700 border-l-2 border-green-500' :
                                apt.status === 'cancelled' ? 'bg-red-100 text-red-700 border-l-2 border-red-500 line-through' :
                                'bg-gray-100 text-gray-700 border-l-2 border-gray-500'
                              }`}
                            >
                              <div className="font-medium">{apt.start_time}</div>
                              <div className="truncate">{apt.client?.first_name} {apt.client?.last_name}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots.map(hour => {
              const hourAppointments = getAppointmentsForDay(currentDate).filter(apt => {
                const aptHour = parseInt(apt.start_time.split(':')[0])
                return aptHour === hour
              })
              
              return (
                <div 
                  key={hour}
                  className="flex gap-4 min-h-[60px] cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  onClick={() => handleOpenModal(currentDate)}
                >
                  <div className="w-16 text-sm text-gray-500 text-right pt-2">
                    {hour}:00
                  </div>
                  <div className="flex-1 space-y-2">
                    {hourAppointments.map(apt => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenModal(undefined, apt)
                        }}
                        className={`p-3 rounded-lg cursor-pointer ${
                          apt.status === 'confirmed' ? 'bg-green-50 border-l-4 border-green-500' :
                          apt.status === 'cancelled' ? 'bg-red-50 border-l-4 border-red-500' :
                          'bg-gray-50 border-l-4 border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{apt.client?.first_name} {apt.client?.last_name}</span>
                            <span className="text-gray-500 ml-2">• {apt.type}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {apt.start_time} - {apt.end_time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {mockClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (minutes)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de massage
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="Suédois">Suédois</option>
                    <option value="Deep tissue">Deep tissue</option>
                    <option value="Sportif">Sportif</option>
                    <option value="Thérapeutique">Thérapeutique</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Shiatsu">Shiatsu</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Informations supplémentaires..."
                />
              </div>

              {selectedAppointment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm ${
                        selectedAppointment.status === 'confirmed' 
                          ? 'bg-green-100 border-green-300 text-green-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      Confirmé
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm ${
                        selectedAppointment.status === 'completed' 
                          ? 'bg-gray-100 border-gray-300 text-gray-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Terminé
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm ${
                        selectedAppointment.status === 'cancelled' 
                          ? 'bg-red-100 border-red-300 text-red-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-200">
                {selectedAppointment && (
                  <button
                    type="button"
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedAppointment ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}