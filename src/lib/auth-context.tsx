'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getSession, getCurrentUser } from './supabase'
import { TherapistProfile } from '@/types'

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const buildProfileSlug = (firstName: string, lastName: string) => {
  const base = `${slugify(firstName)}-${slugify(lastName)}`.replace(/^-+|-+$/g, '')
  const fallback = 'therapeute'
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base || fallback}-${suffix}`
}

interface AuthContextType {
  user: User | null
  therapistProfile: TherapistProfile | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const ensureTherapistProfile = async (authUser: User) => {
    const { data, error } = await supabase
      .from('therapist_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (!error && data) {
      return data as TherapistProfile
    }

    const firstName = (authUser.user_metadata?.first_name as string) || ''
    const lastName = (authUser.user_metadata?.last_name as string) || ''
    const phone = (authUser.user_metadata?.phone as string) || ''

    const { data: created, error: insertError } = await supabase
      .from('therapist_profiles')
      .insert([
        {
          user_id: authUser.id,
          slug: buildProfileSlug(firstName, lastName),
          first_name: firstName,
          last_name: lastName,
          phone,
          license_number: '',
          company_name: '',
          company_address: '',
          company_phone: '',
          tax_rate: 20,
          logo_url: '',
          buffer_time: 15,
          bio: '',
          photo_url: '',
          instagram: '',
          specialties: [],
        },
      ])
      .select('*')
      .single()

    if (insertError) {
      throw insertError
    }

    return created as TherapistProfile
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('therapist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setTherapistProfile(data)
      }
    } catch (error) {
      console.error('Error loading therapist profile:', error)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await getSession()
        const currentUser = await getCurrentUser()

        if (currentUser) {
          setUser(currentUser)

          try {
            const profile = await ensureTherapistProfile(currentUser)
            setTherapistProfile(profile)
          } catch (error) {
            console.error('Error loading/creating therapist profile:', error)
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)

        try {
          const profile = await ensureTherapistProfile(session.user)
          setTherapistProfile(profile)
        } catch (error) {
          console.error('Error loading/creating therapist profile:', error)
        }
      } else {
        setUser(null)
        setTherapistProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTherapistProfile(null)
  }

  const value: AuthContextType = {
    user,
    therapistProfile,
    loading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
