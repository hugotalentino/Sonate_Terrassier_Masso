import { createClient } from '@supabase/supabase-js'
import type { Client, Appointment, Invoice, Session, User, TherapistProfile, HealthForm } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
    .from('therapist_profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTherapistProfile = async (userId: string) => {
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