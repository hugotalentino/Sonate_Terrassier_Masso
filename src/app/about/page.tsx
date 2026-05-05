'use client'

import Link from 'next/link'
import { mockTherapist } from '@/lib/mock-data'
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

export default function TherapistPage() {
  const specialties = mockTherapist.specialties || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sage-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Photo */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-primary-200 to-sage-200 rounded-2xl flex items-center justify-center shadow-lg">
                {mockTherapist.photo_url ? (
                  <img 
                    src={mockTherapist.photo_url} 
                    alt={`${mockTherapist.first_name} ${mockTherapist.last_name}`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-6xl">💆</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {mockTherapist.first_name} {mockTherapist.last_name}
                </h1>
                <p className="text-xl text-primary-600 font-medium mt-1">
                  Massothérapeute
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed text-lg">
                {mockTherapist.bio}
              </p>

              {/* Specialties */}
              {specialties.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Spécialités:</h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map(specialty => (
                      <span
                        key={specialty}
                        className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="pt-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Prendre rendez-vous
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Coordonnées</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <a href={`tel:${mockTherapist.phone}`} className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors">
                    {mockTherapist.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-sage-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-gray-900">
                    contact@massageflow.fr
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="text-lg font-medium text-gray-900">
                    {mockTherapist.company_address}
                  </p>
                </div>
              </div>

              {mockTherapist.instagram && (
                <div className="flex items-start gap-4">
                  <Instagram className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Instagram</p>
                    <a 
                      href={`https://instagram.com/${mockTherapist.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-gray-900 hover:text-pink-600 transition-colors"
                    >
                      @{mockTherapist.instagram}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About/Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Formations</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Diplôme de Massothérapeute (2016)</li>
                <li>✓ Spécialisation Massage Sportif (2018)</li>
                <li>✓ Certification Deep Tissue (2020)</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Expérience</h3>
              </div>
              <p className="text-gray-600">
                Plus de 8 ans d'expérience dans le massage thérapeutique et bien-être. 
                Spécialisée dans la prise en charge des tensions musculaires et la prévention des blessures.
              </p>
            </div>

            <div className="bg-primary-50 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Disponibilités</h3>
              </div>
              <p className="text-gray-700">
                <strong>Lun-Ven:</strong> 9h-18h<br/>
                <strong>Sam:</strong> 10h-16h<br/>
                <strong>Dim:</strong> Fermé
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt(e) pour une séance ?</h2>
          <p className="text-primary-100 mb-6 text-lg">
            Réservez votre rendez-vous dès maintenant et découvrez les bienfaits du massage
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Réserver maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}