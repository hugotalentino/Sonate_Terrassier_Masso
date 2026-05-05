'use client'

import { 
  Calendar, 
  DollarSign, 
  Users, 
  Bell, 
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  Plus,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { mockDashboardStats, mockAppointments, mockClients } from '@/lib/mock-data'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'

export default function DashboardPage() {
  const [acceptedClients, setAcceptedClients] = useState<string[]>([])

  // Détection des nouveaux clients
  const detectNewClients = () => {
    return mockAppointments.filter(apt => {
      if (!apt.client) return false
      const existingClient = mockClients.find(
        client => client.email === apt.client?.email || client.phone === apt.client?.phone
      )
      return !existingClient && apt.is_new_client !== false
    })
  }

  const newClientAppointments = detectNewClients()

  const handleCreateClient = (appointmentId: string, clientName: string) => {
    setAcceptedClients([...acceptedClients, appointmentId])
    // In a real app, this would create the client in the database
  }
  const stats = [
    {
      name: "Rendez-vous aujourd'hui",
      value: mockDashboardStats.today_appointments,
      icon: Calendar,
      color: 'bg-primary-100 text-primary-600',
      change: '+2 par rapport à hier',
    },
    {
      name: 'Revenus cette semaine',
      value: `${mockDashboardStats.week_revenue}€`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      change: '+15% vs semaine dernière',
    },
    {
      name: 'Nouveaux clients',
      value: mockDashboardStats.new_clients,
      icon: Users,
      color: 'bg-sage-100 text-sage-600',
      change: 'Ce mois-ci',
    },
    {
      name: 'Rappels en attente',
      value: mockDashboardStats.pending_reminders,
      icon: Bell,
      color: 'bg-amber-100 text-amber-600',
      change: 'À envoyer',
    },
  ]

  const todayAppointments = mockAppointments.filter(
    apt => apt.date === new Date().toISOString().split('T')[0]
  )

  const recentClients = mockClients.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, Marie 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Voici ce qui se passe aujourd'hui, {format(new Date(), 'EEEE d MMMM', { locale: fr })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/booking"
            target="_blank"
            className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-primary-900">Lien de réservation</p>
              <p className="text-sm text-primary-700">Partagez ce lien avec vos clients</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary-600 ml-auto" />
          </Link>

          <Link
            href="/dashboard/clients"
            className="flex items-center gap-3 p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center group-hover:bg-sage-200 transition-colors">
              <Users className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <p className="font-medium text-sage-900">Nouveau client</p>
              <p className="text-sm text-sage-700">Ajouter un client</p>
            </div>
            <ArrowRight className="w-4 h-4 text-sage-600 ml-auto" />
          </Link>

          <Link
            href="/dashboard/calendar"
            className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900">Nouveau RDV</p>
              <p className="text-sm text-amber-700">Planifier un rendez-vous</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 ml-auto" />
          </Link>
        </div>
      </div>

      {/* New clients detected */}
      {newClientAppointments.length > 0 && (
        <div className="card border-2 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">
                {newClientAppointments.length} nouveau(x) client(s) détecté(s)
              </h3>
              <p className="text-sm text-amber-800 mb-4">
                Des rendez-vous ont été pris par de nouveaux clients. Voulez-vous les ajouter à votre base de clients ?
              </p>
              <div className="space-y-2">
                {newClientAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className={`flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200 ${
                      acceptedClients.includes(apt.id) ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {apt.client?.first_name} {apt.client?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {apt.client?.email} • {apt.client?.phone}
                      </p>
                    </div>
                    {acceptedClients.includes(apt.id) ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Créé</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCreateClient(apt.id, `${apt.client?.first_name} ${apt.client?.last_name}`)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Créer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Rendez-vous du jour
            </h2>
            <Link 
              href="/dashboard/calendar" 
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500">{apt.start_time}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {apt.client?.first_name} {apt.client?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {apt.type} • {apt.duration} min
                    </p>
                  </div>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                    ${apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    ${apt.status === 'completed' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {apt.status === 'confirmed' ? 'Confirmé' : 
                     apt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun rendez-vous prévu aujourd'hui</p>
            </div>
          )}
        </div>

        {/* Recent clients */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Clients récents
            </h2>
            <Link 
              href="/dashboard/clients" 
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentClients.map((client) => (
              <div 
                key={client.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-medium">
                    {client.first_name[0]}{client.last_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {client.email}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/calendar?new=true"
            className="flex flex-col items-center gap-2 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Calendar className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Nouveau RDV</span>
          </Link>
          <Link 
            href="/dashboard/clients?new=true"
            className="flex flex-col items-center gap-2 p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
          >
            <Users className="w-6 h-6 text-sage-600" />
            <span className="text-sm font-medium text-sage-700">Nouveau client</span>
          </Link>
          <Link 
            href="/dashboard/invoices?new=true"
            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <DollarSign className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">Nouveau reçu</span>
          </Link>
          <button 
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Envoyer rappel</span>
          </button>
        </div>
      </div>
    </div>
  )
}