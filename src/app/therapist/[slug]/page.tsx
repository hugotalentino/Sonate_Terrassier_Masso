'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getTherapistProfileBySlug } from '@/lib/supabase'
import { TherapistProfile } from '@/types'
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  ArrowRight,
  Star,
  Award,
  Zap,
} from 'lucide-react'

export default function TherapistProfilePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!slug) return
      try {
        const profile = await getTherapistProfileBySlug(slug)
        setTherapist(profile)
      } catch (cause) {
        console.error('Profil thérapeute non trouvé:', cause)
        setError('Profil thérapeute non trouvé. Vérifiez le lien de réservation.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50 flex items-center justify-center">
        <div className="max-w-xl bg-white rounded-3xl shadow-sm border p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Therapeute introuvable</h1>
          <p className="text-gray-600 mb-6">{error ?? 'Le lien de réservation est invalide ou le profil est indisponible.'}</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const specialties = therapist.specialties || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-56 h-56 bg-gradient-to-br from-primary-200 to-sage-200 rounded-3xl overflow-hidden shadow-xl mx-auto md:mx-0">
                {therapist.photo_url ? (
                  <img
                    src={therapist.photo_url}
                    alt={`${therapist.first_name} ${therapist.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">💆</div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary-600 font-semibold">Massothérapeute</p>
                <h1 className="text-5xl font-bold text-gray-900 mt-3">
                  {therapist.first_name} {therapist.last_name}
                </h1>
                <p className="text-lg text-gray-600 mt-4">{therapist.bio || 'Votre thérapeute bien-être de confiance.'}</p>
              </div>

              {specialties.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {specialties.map((specialty) => (
                    <span key={specialty} className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
                      <Zap className="w-4 h-4" />
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                  <p className="text-sm text-gray-500">Cabinet</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{therapist.company_name || 'Cabinet massage'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{therapist.phone}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/therapist/${therapist.slug}/booking`}
                  className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors"
                >
                  Prendre rendez-vous
                </Link>
                <a
                  href={`tel:${therapist.phone}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Appeler
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-3xl shadow-sm border p-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coordonnées</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Téléphone</h3>
                <p>{therapist.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-sage-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p>contact@massageflow.fr</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Adresse</h3>
                <p>{therapist.company_address || 'Adresse non renseignée'}</p>
              </div>
            </div>
            {therapist.instagram && (
              <div className="flex items-start gap-3">
                <Instagram className="w-5 h-5 text-pink-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Instagram</h3>
                  <a href={`https://instagram.com/${therapist.instagram}`} target="_blank" rel="noreferrer" className="text-primary-700 hover:underline">
                    @{therapist.instagram}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border p-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">À propos</h2>
          <p className="text-gray-600 leading-relaxed">
            {therapist.bio || 'Je suis massothérapeute et je vous accompagne pour un moment de détente et de bien-être.'}
          </p>
        </div>
      </div>
    </div>
  )
}
