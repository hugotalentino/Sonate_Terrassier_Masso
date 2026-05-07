'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getSession, getCurrentUser } from './supabase'
import { TherapistProfile } from '@/types'

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

          // Load therapist profile
          try {
            const { data } = await supabase
              .from('therapist_profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single()

            if (data) {
              setTherapistProfile(data)
            }
          } catch (error) {
            console.log('No therapist profile found yet')
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

        // Load therapist profile
        try {
          const { data } = await supabase
            .from('therapist_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (data) {
            setTherapistProfile(data)
          }
        } catch (error) {
          console.log('No therapist profile found')
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
