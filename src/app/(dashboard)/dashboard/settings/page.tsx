'use client'

import { useState } from 'react'
import { 
  Settings, 
  User, 
  Building, 
  Percent, 
  Clock,
  Upload,
  Save,
  X
} from 'lucide-react'
import { mockTherapist } from '@/lib/mock-data'
import { TherapistProfile } from '@/types'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [therapist, setTherapist] = useState<TherapistProfile>(mockTherapist)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setTherapist(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      toast.success('Paramètres enregistrés avec succès')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Gérez votre profil et les informations de votre entreprise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profil du thérapeute</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                name="first_name"
                value={therapist.first_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="last_name"
                value={therapist.last_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={therapist.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de permis
              </label>
              <input
                type="text"
                name="license_number"
                value={therapist.license_number}
                onChange={handleChange}
                className="input-field"
                placeholder="MT-2024-XXXXX"
              />
            </div>
          </div>
        </div>

        {/* Company Info Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5 text-sage-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informations entreprise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                name="company_name"
                value={therapist.company_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="company_phone"
                value={therapist.company_phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <textarea
                name="company_address"
                value={therapist.company_address}
                onChange={handleChange}
                className="input-field"
                rows={2}
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {logoPreview || therapist.logo_url ? (
                  <img 
                    src={logoPreview || therapist.logo_url} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Choisir un fichier
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG jusqu'à 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Percent className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Facturation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                value={therapist.tax_rate}
                onChange={handleChange}
                className="input-field"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps tampon entre RDV (minutes)
              </label>
              <select
                name="buffer_time"
                value={therapist.buffer_time}
                onChange={handleChange}
                className="input-field"
              >
                <option value={0}>Aucun</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Rappels de rendez-vous</p>
                <p className="text-sm text-gray-500">Envoyer un rappel 24h avant le rendez-vous</p>
              </div>
              <input 
                type="checkbox" 
                defaultChecked
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Suivi client</p>
                <p className="text-sm text-gray-500">Rappeler les clients après X semaines</p>
              </div>
              <input 
                type="checkbox" 
                defaultChecked
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Notifications par email</p>
                <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
              </div>
              <input 
                type="checkbox" 
                defaultChecked
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}