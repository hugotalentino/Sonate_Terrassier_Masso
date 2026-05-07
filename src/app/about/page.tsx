'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  ArrowRight,
  Star,
  Award,
  Zap
} from 'lucide-react'

export default function AboutPage() {
  const { therapistProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && therapistProfile?.slug) {
      router.replace(`/therapist/${therapistProfile.slug}`)
    }
  }, [loading, therapistProfile, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl shadow-sm border p-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profil public et réservation</h1>
          <p className="text-gray-600 mb-8">
            MassageFlow vous permet de partager un lien public de rendez-vous avec vos clients et de gérer vos réservations depuis un tableau de bord sécurisé.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="rounded-3xl bg-primary-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Votre page publique</h2>
              <p className="text-gray-600 mb-4">
                Les clients peuvent découvrir votre profil, vos services et réserver en ligne via un lien unique.
              </p>
              <div className="inline-flex items-center gap-2 text-primary-700 font-semibold">
                <Zap className="w-5 h-5" />
                Exemple : /therapist/votre-nom
              </div>
            </div>
            <div className="rounded-3xl bg-sage-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Votre tableau de bord</h2>
              <p className="text-gray-600 mb-4">
                Gérez vos rendez-vous, vos clients et vos reçus en un seul endroit. Retournez à votre tableau de bord pour récupérer votre lien de réservation.</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 mt-2 text-primary-600 font-semibold hover:text-primary-700"
              >
                Aller au tableau de bord <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
