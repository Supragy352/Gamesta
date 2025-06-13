import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, type User } from '../lib/supabaseClient'
import { DatabaseService } from '../services/database/databaseService'
import { logger } from '../utils/logger'
import { validateForm, VALIDATION_RULES } from '../utils/validation/validation'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    // Set up Supabase auth state listener
    setLoading(true)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        try {
          const userData = await DatabaseService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Error loading user data:', error)
          setError('Failed to load user data')
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Check current session
    const checkSession = async () => {
      try {
        const userData = await DatabaseService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Error checking session:', error)
      }
      setLoading(false)
    }

    checkSession()

    return () => subscription.unsubscribe()
  }, [])
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      logger.info('AUTH', `Login attempt for email: ${email}`)

      // Enhanced validation using new validation utilities
      const validation = validateForm({ email, password }, VALIDATION_RULES.LOGIN)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        logger.warn('AUTH', `Login validation failed: ${firstError}`)
        return { success: false, error: firstError }
      }

      // Use real Supabase authentication
      await DatabaseService.signIn(email, password)
      logger.info('AUTH', `Login successful for email: ${email}`)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.'
      logger.error('AUTH', `Login failed for email: ${email} - ${errorMessage}`)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)

      // Enhanced validation using new validation utilities
      const validation = validateForm({ email, password, username }, VALIDATION_RULES.REGISTER)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        return { success: false, error: firstError }
      }

      // Use real Supabase authentication and profile creation
      await DatabaseService.signUp(email, password, username)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await DatabaseService.signOut()
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Error during logout:', error)
      // Continue with logout even if there's an error
      setUser(null)
      setError(null)
    }
  }

  const updateProfile = async (updates: Partial<Pick<User, 'username' | 'bio'>>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const updatedUser = await DatabaseService.updateUserProfile(user.id, updates)
      setUser(updatedUser)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      return { success: false, error: errorMessage }
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
