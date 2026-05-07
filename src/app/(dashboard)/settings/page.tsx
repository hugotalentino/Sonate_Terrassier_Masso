'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, User, Building, Phone, Mail, MapPin, FileText, Percent, Clock, Image, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'
import { updateTherapistProfile } from '@/lib/supabase'

export default function SettingsPage() {
  const { therapistProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    tax_rate: 20,
    buffer_time: 15,
    bio: '',
    photo_url: '',
    instagram: '',
    specialties: [] as string[],
  })

  useEffect(() => {
    if (therapistProfile) {
      setFormData({
        first_name: therapistProfile.first_name || '',
        last_name: therapistProfile.last_name || '',
        phone: therapistProfile.phone || '',
        license_number: therapistProfile.license_number || '',
        company_name: therapistProfile.company_name || '',
        company_address: therapistProfile.company_address || '',
        company_phone: therapistProfile.company_phone || '',
        tax_rate: therapistProfile.tax_rate || 20,
        buffer_time: therapistProfile.buffer_time || 15,
        bio: therapistProfile.bio || '',
        photo_url: therapistProfile.photo_url || '',
        instagram: therapistProfile.instagram || '',
        specialties: therapistProfile.specialties || [],
      })
    }
  }, [therapistProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!therapistProfile) return

    setLoading(true)

    try {
      await updateTherapistProfile(therapistProfile.user_id, formData)
      await refreshProfile()
      toast.success('Paramètres mis à jour avec succès !')
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      toast.error('Erreur lors de la mise à jour des paramètres')
    } finally {
      setLoading(false)
    }
  }

  if (!therapistProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  const specialtyOptions = [
    'Relaxation', 'Thérapeutique', 'Sportif', 'Deep tissue',
    'Réflexologie', 'Shiatsu', 'Aromathérapie', 'Drainage lymphatique'
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos informations personnelles et professionnelles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations personnelles */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de licence
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Informations professionnelles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone entreprise
              </label>
              <input
                type="tel"
                name="company_phone"
                value={formData.company_phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Paramètres de facturation */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Paramètres de facturation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux de TVA (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                className="input-field"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps tampon entre RDV (minutes)
              </label>
              <input
                type="number"
                name="buffer_time"
                value={formData.buffer_time}
                onChange={handleChange}
                className="input-field"
                min="0"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Profil public */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Profil public</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biographie
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Décrivez votre parcours et vos spécialités..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo de profil (URL)
              </label>
              <input
                type="url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="input-field"
                placeholder="@votrecompte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialités
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  )
}