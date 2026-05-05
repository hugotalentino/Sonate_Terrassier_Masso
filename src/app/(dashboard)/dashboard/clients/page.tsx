'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react'
import { mockClients } from '@/lib/mock-data'
import { Client } from '@/types'
import toast from 'react-hot-toast'

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    notes: '',
    allergies: '',
    contraindications: '',
  })

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase()
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchQuery)
    )
  })

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        phone: client.phone,
        email: client.email,
        date_of_birth: client.date_of_birth || '',
        notes: client.notes,
        allergies: client.allergies,
        contraindications: client.contraindications,
      })
    } else {
      setEditingClient(null)
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        date_of_birth: '',
        notes: '',
        allergies: '',
        contraindications: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingClient) {
      // Update existing client
      setClients(clients.map(c => 
        c.id === editingClient.id 
          ? { ...c, ...formData, updated_at: new Date().toISOString() }
          : c
      ))
      toast.success('Client mis à jour avec succès')
    } else {
      // Create new client
      const newClient: Client = {
        id: `client-${Date.now()}`,
        therapist_id: 'therapist-1',
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setClients([...clients, newClient])
      toast.success('Client créé avec succès')
    }
    
    setShowModal(false)
  }

  const handleDelete = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId))
    setShowDeleteConfirm(null)
    toast.success('Client supprimé')
  }

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Clients list */}
      <div className="grid gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div 
              key={client.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-semibold">
                      {client.first_name[0]}{client.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </span>
                      {client.date_of_birth && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {calculateAge(client.date_of_birth)} ans
                        </span>
                      )}
                    </div>
                    {(client.allergies || client.contraindications) && (
                      <div className="flex gap-2 mt-2">
                        {client.allergies && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Allergies
                          </span>
                        )}
                        {client.contraindications && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Contre-indications
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenModal(client)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteConfirm(client.id)
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Liste des allergies connues..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contre-indications
                </label>
                <textarea
                  value={formData.contraindications}
                  onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Problèmes de santé, contre-indications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes privées
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingClient ? 'Enregistrer' : 'Créer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Fiche client
              </h2>
              <button 
                onClick={() => setSelectedClient(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-xl">
                    {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </h3>
                  <p className="text-gray-600">
                    {calculateAge(selectedClient.date_of_birth)} ans
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">
                    {selectedClient.date_of_birth 
                      ? new Date(selectedClient.date_of_birth).toLocaleDateString('fr-FR')
                      : 'Non renseignée'}
                  </p>
                </div>
              </div>

              {selectedClient.allergies && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Allergies</p>
                  <p className="font-medium text-amber-700">{selectedClient.allergies}</p>
                </div>
              )}

              {selectedClient.contraindications && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contre-indications</p>
                  <p className="font-medium text-red-700">{selectedClient.contraindications}</p>
                </div>
              )}

              {selectedClient.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="font-medium">{selectedClient.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedClient(null)
                    handleOpenModal(selectedClient)
                  }}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <Link 
                  href={`/dashboard/sessions?client=${selectedClient.id}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Voir l'historique
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Supprimer le client ?
              </h3>
              <p className="text-gray-600 mb-6">
                Cette action est irréversible. Toutes les données du client seront perdues.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}