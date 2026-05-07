'use client'

import { useState } from 'react'
import { Bell, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { reminderService } from '@/lib/reminder-service'
import toast from 'react-hot-toast'

export default function AdminRemindersPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSendReminders = async () => {
    setLoading(true)
    setResult(null)

    try {
      const reminderResult = await reminderService.sendTomorrowReminders()
      setResult(reminderResult)

      if (reminderResult.sent > 0) {
        toast.success(`${reminderResult.sent} rappel(s) envoyé(s) avec succès !`)
      }

      if (reminderResult.failed > 0) {
        toast.error(`${reminderResult.failed} échec(s) d'envoi`)
      }
    } catch (error) {
      console.error('Erreur envoi rappels:', error)
      toast.error('Erreur lors de l\'envoi des rappels')
      setResult({ sent: 0, failed: 1, errors: [`Erreur: ${error}`] })
    } finally {
      setLoading(false)
    }
  }

  const handleTestReminder = async () => {
    setLoading(true)
    setResult(null)

    try {
      const reminderResult = await reminderService.sendTestReminder()
      setResult(reminderResult)

      if (reminderResult.sent > 0) {
        toast.success('Rappel de test envoyé avec succès !')
      } else {
        toast.error('Échec de l\'envoi du rappel de test')
      }
    } catch (error) {
      console.error('Erreur test rappel:', error)
      toast.error('Erreur lors du test du rappel')
      setResult({ sent: 0, failed: 1, errors: [`Erreur: ${error}`] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration - Rappels</h1>
          <p className="text-gray-600 mt-2">
            Outil de gestion des rappels de rendez-vous
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Send Daily Reminders */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Rappels quotidiens</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Envoie automatiquement des rappels pour tous les rendez-vous de demain.
              Cette fonction devrait être appelée quotidiennement via un cron job.
            </p>

            <button
              onClick={handleSendReminders}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer les rappels du jour
                </>
              )}
            </button>
          </div>

          {/* Test Reminder */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Test de rappel</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Envoie un rappel de test pour vérifier que le système fonctionne correctement.
            </p>

            <button
              onClick={handleTestReminder}
              disabled={loading}
              className="btn-secondary w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Test en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Envoyer un rappel de test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résultats</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.sent}</div>
                  <div className="text-sm text-green-700">Envoyés</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                  <div className="text-sm text-red-700">Échecs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.sent + result.failed}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Erreurs :</h4>
                  <ul className="space-y-1">
                    {result.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-600">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions d'utilisation</h3>

          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <strong>🔄 Automatisation :</strong> Pour automatiser l'envoi des rappels, configurez un cron job qui appelle cette fonction tous les jours à 9h00 :
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`# Cron job example (Linux/Mac)
0 9 * * * curl -X POST https://your-domain.com/api/reminders/send-daily

# Or using a serverless function
# Schedule a daily function call at 9 AM`}
              </pre>
            </div>

            <div>
              <strong>📧 Configuration email :</strong> Assurez-vous que les variables d'environnement pour le service d'email sont configurées (EmailJS, SendGrid, etc.)
            </div>

            <div>
              <strong>⚠️ Mode démo :</strong> En mode démo, les emails ne sont pas réellement envoyés mais simulés dans la console.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}