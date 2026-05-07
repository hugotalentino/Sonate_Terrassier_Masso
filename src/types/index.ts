// Types for MassageFlow application

export interface User {
  id: string
  email: string
  role: 'admin' | 'therapist'
  created_at: string
}

export interface TherapistProfile {
  id: string
  user_id: string
  slug: string // For public URL: /therapist/[slug]
  first_name: string
  last_name: string
  phone: string
  license_number: string
  company_name: string
  company_address: string
  company_phone: string
  tax_rate: number
  logo_url: string
  buffer_time: number // minutes between appointments
  bio?: string
  photo_url?: string
  instagram?: string
  specialties?: string[]
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  therapist_id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  date_of_birth: string | null
  notes: string
  allergies: string
  contraindications: string
  created_at: string
  updated_at: string
}

export interface HealthForm {
  current_pain?: string
  sensitive_zones?: string
  medical_conditions?: string
  pregnancy?: boolean
  stress_level?: number // 1-10
  massage_objective?: 'relaxation' | 'pain' | 'recovery' | 'other'
  additional_notes?: string
}

export interface Appointment {
  id: string
  therapist_id: string
  client_id: string
  date: string
  start_time: string
  end_time: string
  duration: number // minutes
  type: string // massage type
  status: 'confirmed' | 'cancelled' | 'completed'
  notes: string
  health_form_id?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  is_new_client?: boolean
  created_at: string
  updated_at: string
  // Joined fields
  client?: Client
}

export interface Session {
  id: string
  appointment_id: string
  therapist_id: string
  client_id: string
  date: string
  duration: number
  massage_type: string
  notes: string
  body_zones: string
  pain_areas: string
  post_session_recommendations: string
  created_at: string
  updated_at: string
  // Joined fields
  client?: Client
}

export interface Invoice {
  id: string
  therapist_id: string
  client_id: string
  session_id: string
  invoice_number: string
  date: string
  amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: 'paid' | 'pending' | 'overdue'
  notes: string
  created_at: string
}

export interface DashboardStats {
  today_appointments: number
  week_revenue: number
  new_clients: number
  pending_reminders: number
}

// Form types
export interface ClientFormData {
  first_name: string
  last_name: string
  phone: string
  email: string
  date_of_birth: string
  notes: string
  allergies: string
  contraindications: string
}

export interface AppointmentFormData {
  client_id: string
  date: string
  start_time: string
  duration: number
  type: string
  notes: string
}

export interface SessionFormData {
  date: string
  duration: number
  massage_type: string
  notes: string
  body_zones: string
  pain_areas: string
  post_session_recommendations: string
}

export interface BookingFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  massage_type: string
  notes: string
  health_form: HealthForm
}

export interface TherapistSettingsFormData {
  first_name: string
  last_name: string
  phone: string
  license_number: string
  company_name: string
  company_address: string
  company_phone: string
  tax_rate: number
  buffer_time: number
}

// Massage types
export const MASSAGE_TYPES = [
  'Suédois',
  'Deep tissue',
  'Sportif',
  'Thérapeutique',
  'Relaxation',
  ' Shiatsu',
  'Tui Na',
  'Réflexologie',
  'Ayurvédique',
  'Hot stone',
  'Autre',
] as const

// Body zones
export const BODY_ZONES = [
  'Cou',
  'Épaules',
  'Dos',
  'Bas du dos',
  'Membres supérieurs',
  'Membres inférieurs',
  'Abdomen',
  'Thorax',
  'Tête',
  'Visage',
] as const

// Pain areas
export const PAIN_AREAS = [
  'Nuque',
  'Trapèzes',
  'Épaules',
  'Dos haut',
  'Dos moyen',
  'Bas du dos',
  'Sciatique',
  'Fessiers',
  'Quadriceps',
  'Ischio-jambiers',
  'Mollets',
  'Pieds',
  'Poignets',
  'Coudes',
  'Autres',
] as const