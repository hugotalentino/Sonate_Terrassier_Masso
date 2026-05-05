import Link from 'next/link'
import { ArrowRight, Calendar, Users, FileText, Bell, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">MassageFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/signup" 
                className="btn-primary"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Gérez votre cabinet de massage
            <span className="text-primary-600"> en toute simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            La solution tout-en-un pour les massothérapeutes autonomes. 
            Clients, rendez-vous, reçus d'assurance et plus encore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center gap-2"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="btn-secondary text-lg px-8 py-3"
            >
              Voir la démo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion des clients</h3>
            <p className="text-gray-600">
              Fiches clients complètes avec historique, allergies, contre-indications et notes privées.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-sage-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Agenda intelligent</h3>
            <p className="text-gray-600">
              Calendrier jour/semaine/mois avec gestion des statuts et temps tampon configurable.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reçus PDF</h3>
            <p className="text-gray-600">
              Générez automatiquement des reçus professionnels avec votre numéro de permis.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-sage-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Notifications</h3>
            <p className="text-gray-600">
              Rappels automatiques par email et suivi client après X semaines.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Paramètres complets</h3>
            <p className="text-gray-600">
              Personnalisez votre profil, logo, informations d'entreprise et taux de taxes.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-primary-50 to-sage-50">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">+</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Et bien plus...</h3>
            <p className="text-gray-600">
              Tableau de bord, fiches de séance, historique complet et interface responsive.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à simplifier votre quotidien ?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez les massothérapeutes qui font confiance à MassageFlow pour gérer leur cabinet.
          </p>
          <Link 
            href="/signup" 
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Créer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-gray-900 font-medium">MassageFlow</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 MassageFlow. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}