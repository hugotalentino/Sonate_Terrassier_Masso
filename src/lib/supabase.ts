import { createClient } from '@supabase/supabase-js'
import type { Client, Appointment, Invoice, Session, User, TherapistProfile, HealthForm } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Create client with fallback for build time
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if we're in demo mode (no real Supabase connection)
export const isDemoMode = () => !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co'

// ============ HEALTH FORMS ============
export const createHealthForm = async (healthForm: Omit<HealthForm, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('health_forms')
    .insert([healthForm])
    .select()
    .single()

  if (error) throw error
  return data
}

// ============ APPOINTMENTS ============
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAppointments = async (therapistId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('therapist_id', therapistId)

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error } = await query.order('date', { ascending: true })

  if (error) throw error
  return data as Appointment[]
}

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteAppointment = async (id: string) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============ CLIENTS ============
export const createClientRecord = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getClients = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Client[]
}

export const updateClient = async (id: string, updates: Partial<Client>) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteClient = async (id: string) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============ SESSIONS ============
export const createSession = async (session: Omit<Session, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([session])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSessions = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('date', { ascending: false })

  if (error) throw error
  return data as Session[]
}

// ============ INVOICES ============
export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getInvoices = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('date', { ascending: false })

  if (error) throw error
  return data as Invoice[]
}

export const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============ THERAPIST PROFILE ============
export const createTherapistProfile = async (profile: Omit<TherapistProfile, 'id' | 'created_at' | 'updated_at'>) => {
  if (isDemoMode()) {
    console.log('Demo mode: skipping Supabase operation')
    return profile as TherapistProfile
  }

  const { data, error } = await supabase
    .from('therapist_profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTherapistProfile = async (userId: string) => {
  if (isDemoMode()) {
    // Return mock data in demo mode
    const { mockTherapist } = await import('@/lib/mock-data')
    return mockTherapist as TherapistProfile
  }

  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as TherapistProfile
}

export const updateTherapistProfile = async (userId: string, updates: Partial<TherapistProfile>) => {
  const { data, error } = await supabase
    .from('therapist_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTherapistProfileBySlug = async (slug: string) => {
  if (isDemoMode()) {
    const { mockTherapist } = await import('@/lib/mock-data')
    return mockTherapist as TherapistProfile
  }

  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as TherapistProfile
}

// ============ AUTHENTICATION ============
export const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
  if (isDemoMode()) {
    // Demo mode: simulate signup
    return { user: { id: 'demo-user-id', email }, session: { access_token: 'demo-token' } }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: appUrl ? `${appUrl}/login` : undefined,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
    },
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  if (isDemoMode()) {
    // Demo mode: simulate login
    return { user: { id: 'demo-user-id', email }, session: { access_token: 'demo-token' } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  if (isDemoMode()) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  if (isDemoMode()) {
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  if (isDemoMode()) {
    return { data: { session: null }, error: null }
  }

  return await supabase.auth.getSession()
}