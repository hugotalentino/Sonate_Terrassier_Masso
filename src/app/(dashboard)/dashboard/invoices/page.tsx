'use client'

import { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Eye,
  X,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react'
import { mockInvoices, mockClients, mockSessions, mockTherapist } from '@/lib/mock-data'
import { Invoice, Client, Session } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [showModal, setShowModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    client_id: '',
    session_id: '',
    amount: 60,
    tax_rate: 20,
    notes: '',
  })

  const getClient = (clientId: string): Client | undefined => {
    return mockClients.find(c => c.id === clientId)
  }

  const getSession = (sessionId: string): Session | undefined => {
    return mockSessions.find(s => s.id === sessionId)
  }

  const filteredInvoices = invoices.filter(inv => {
    const client = getClient(inv.client_id)
    const searchLower = searchQuery.toLowerCase()
    return (
      inv.invoice_number.toLowerCase().includes(searchLower) ||
      client?.first_name.toLowerCase().includes(searchLower) ||
      client?.last_name.toLowerCase().includes(searchLower)
    )
  })

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF() as jsPDF & { autoTable: typeof autoTable }
    const client = getClient(invoice.client_id)
    const session = getSession(invoice.session_id)

    // Enable autoTable
    doc.autoTable = autoTable

    // Header
    doc.setFontSize(24)
    doc.setTextColor(14, 165, 233) // primary-500
    doc.text('MASSAGEFLOW', 20, 25)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(mockTherapist.company_name, 20, 32)
    doc.text(mockTherapist.company_address, 20, 37)
    doc.text(mockTherapist.company_phone, 20, 42)

    // Invoice title
    doc.setFontSize(18)
    doc.setTextColor(0)
    doc.text('REÇU / FACTURE', 140, 25)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`N°: ${invoice.invoice_number}`, 140, 32)
    doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}`, 140, 37)

    // Divider
    doc.setDrawColor(200)
    doc.line(20, 50, 190, 50)

    // Client info
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Client:', 20, 60)
    
    doc.setFontSize(10)
    doc.setTextColor(60)
    if (client) {
      doc.text(`${client.first_name} ${client.last_name}`, 20, 67)
      doc.text(client.email, 20, 72)
      doc.text(client.phone, 20, 77)
    }

    // Therapist info
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Thérapeute:', 120, 60)
    
    doc.setFontSize(10)
    doc.setTextColor(60)
    doc.text(`${mockTherapist.first_name} ${mockTherapist.last_name}`, 120, 67)
    doc.text(`N° Permis: ${mockTherapist.license_number}`, 120, 72)

    // Table
    const tableData = [
      ['Séance', session?.massage_type || 'Massage', `${invoice.amount}€`],
      ['TVA', `${invoice.tax_rate}%`, `${invoice.tax_amount}€`],
      ['Total', '', `${invoice.total_amount}€`],
    ]

    doc.autoTable({
      startY: 90,
      head: [['Description', 'Détails', 'Montant']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40, halign: 'right' },
      },
    })

    // Session details
    if (session) {
      const finalY = (doc as any).lastAutoTable.finalY + 15
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text('Détails de la séance:', 20, finalY)
      doc.text(`Date: ${format(new Date(session.date), 'dd/MM/yyyy', { locale: fr })}`, 20, finalY + 6)
      doc.text(`Durée: ${session.duration} minutes`, 20, finalY + 11)
      doc.text(`Type: ${session.massage_type}`, 20, finalY + 16)
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Merci pour votre confiance!', 105, 270, { align: 'center' })
    doc.text('MassageFlow - Logiciel de gestion pour massothérapeutes', 105, 275, { align: 'center' })

    // Signature line
    doc.setDrawColor(200)
    doc.line(130, 240, 180, 240)
    doc.setFontSize(8)
    doc.text('Signature du thérapeute', 155, 245, { align: 'center' })

    // Save
    doc.save(`recu-${invoice.invoice_number}.pdf`)
    toast.success('PDF téléchargé')
  }

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taxAmount = (formData.amount * formData.tax_rate) / 100
    const totalAmount = formData.amount + taxAmount

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      therapist_id: 'therapist-1',
      client_id: formData.client_id,
      session_id: formData.session_id || '',
      invoice_number: `2024-${String(invoices.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      amount: formData.amount,
      tax_rate: formData.tax_rate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: 'pending',
      notes: formData.notes,
      created_at: new Date().toISOString(),
    }

    setInvoices([...invoices, newInvoice])
    setShowCreateModal(false)
    toast.success('Reçu créé avec succès')
  }

  const updateStatus = (invoiceId: string, status: 'paid' | 'pending' | 'overdue') => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status } : inv
    ))
    toast.success('Statut mis à jour')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <Check className="w-3 h-3" />
            Payé
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            En retard
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reçus / Factures</h1>
          <p className="text-gray-600 mt-1">
            {invoices.length} reçu{invoices.length !== 1 ? 's' : ''} généré{invoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau reçu
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un reçu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Invoices list */}
      <div className="grid gap-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => {
            const client = getClient(invoice.client_id)
            return (
              <div key={invoice.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {client?.first_name} {client?.last_name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr })}</span>
                        <span>•</span>
                        <span className="font-medium text-gray-900">{invoice.total_amount}€</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => generatePDF(invoice)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun reçu trouvé</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Nouveau reçu
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {mockClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux de TVA (%)
                  </label>
                  <input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant HT</span>
                  <span className="font-medium">{formData.amount}€</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">TVA ({formData.tax_rate}%)</span>
                  <span className="font-medium">{(formData.amount * formData.tax_rate / 100).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
                  <span>Total TTC</span>
                  <span>{(formData.amount + formData.amount * formData.tax_rate / 100).toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer le reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Reçu {selectedInvoice.invoice_number}
              </h2>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Client</span>
                <span className="font-medium">
                  {getClient(selectedInvoice.client_id)?.first_name} {getClient(selectedInvoice.client_id)?.last_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {format(new Date(selectedInvoice.date), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Montant HT</span>
                <span className="font-medium">{selectedInvoice.amount}€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">TVA ({selectedInvoice.tax_rate}%)</span>
                <span className="font-medium">{selectedInvoice.tax_amount}€</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-semibold">Total TTC</span>
                <span className="font-bold text-lg">{selectedInvoice.total_amount}€</span>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Statut</span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateStatus(selectedInvoice.id, 'paid')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm ${
                      selectedInvoice.status === 'paid' 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Payé
                  </button>
                  <button
                    onClick={() => updateStatus(selectedInvoice.id, 'pending')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm ${
                      selectedInvoice.status === 'pending' 
                        ? 'bg-amber-100 border-amber-300 text-amber-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => updateStatus(selectedInvoice.id, 'overdue')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm ${
                      selectedInvoice.status === 'overdue' 
                        ? 'bg-red-100 border-red-300 text-red-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    En retard
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => generatePDF(selectedInvoice)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}