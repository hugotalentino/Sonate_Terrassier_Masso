'use client'

import { useState } from 'react'
import { supabase, createTherapistProfile } from '@/lib/supabase'
import { mockTherapist } from '@/lib/mock-data'
import toast from 'react-hot-toast'

export default function InitPage() {
  const [isLoading, setIsLoading] = useState(false)

  const initializeTherapist = async () => {
    setIsLoading(true)
    try {
      // Create a demo user first (in a real app, this would be done during signup)
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: 'marie.massage@example.com',
        password: 'demo123456'
      })

      if (userError && !userError.message.includes('already registered')) {
        throw userError
      }

      const userId = userData?.user?.id || 'demo-user-id'

      // Create therapist profile
      const therapistProfile = {
        user_id: userId,
        first_name: mockTherapist.first_name,
        last_name: mockTherapist.last_name,
        phone: mockTherapist.phone,
        license_number: mockTherapist.license_number,
        company_name: mockTherapist.company_name,
        company_address: mockTherapist.company_address,
        company_phone: mockTherapist.company_phone,
        tax_rate: 20,
        buffer_time: 15,
        logo_url: '',
        bio: mockTherapist.bio,
        photo_url: mockTherapist.photo_url,
        instagram: mockTherapist.instagram,
        specialties: mockTherapist.specialties
      }

      await createTherapistProfile(therapistProfile)

      toast.success('Profil thérapeute créé avec succès !')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création du profil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Initialisation MassageFlow</h1>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Créer le profil thérapeute</h3>
            <p className="text-sm text-blue-700">
              Cette action va créer le profil de Marie dans Supabase avec toutes ses informations.
            </p>
          </div>

          <button
            onClick={initializeTherapist}
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Création en cours...' : 'Initialiser le profil thérapeute'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-primary-600 hover:text-primary-700">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}