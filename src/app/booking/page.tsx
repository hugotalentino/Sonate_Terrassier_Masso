'use client'

import Link from 'next/link'

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50 flex items-center justify-center">
      <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-sm border p-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Lien de réservation manquant</h1>
        <p className="text-gray-600 mb-6">
          Cette page de réservation est réservée aux liens publics spécifiques au thérapeute.
          Utilisez le lien partagé par votre masseur ou demandez-lui d'accéder à son tableau de bord pour récupérer sa page publique.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors"
          >
            Créer un compte thérapeute
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-primary-600 px-6 py-3 text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
