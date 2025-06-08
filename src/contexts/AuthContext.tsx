import React, { createContext, useContext, useEffect, useState } from 'react'
import { storageHelpers } from '../utils/localStorage'
import { validateForm, VALIDATION_RULES } from '../utils/validation'

interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
}

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
    // Check if user is logged in using new storage utilities
    setLoading(true)
    try {
      const savedUser = storageHelpers.getUser() as User | null
      if (savedUser && typeof savedUser === 'object' && savedUser.id && savedUser.email) {
        setUser(savedUser)
      }
    } catch (parseError) {
      console.error('Error loading user data:', parseError)
      storageHelpers.saveUser(null) // Clear corrupted data
    }
    setLoading(false)
  }, [])
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)

      // Enhanced validation using new validation utilities
      const validation = validateForm({ email, password }, VALIDATION_RULES.LOGIN)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        return { success: false, error: firstError }
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication - replace with real API call
      const mockUser: User = {
        id: '1',
        email: validation.data.email,
        username: validation.data.email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validation.data.email}`
      }

      setUser(mockUser)
      storageHelpers.saveUser(mockUser) // Use new storage helper
      return { success: true }
    } catch (networkError) {
      const errorMessage = 'Login failed. Please check your connection and try again.'
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

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))      // Check if user already exists (mock check)
      const existingUser = storageHelpers.getUser() as User | null
      if (existingUser && existingUser.email === validation.data.email) {
        return { success: false, error: 'An account with this email already exists' }
      }

      // Mock registration - replace with real API call
      const mockUser: User = {
        id: Date.now().toString(),
        email: validation.data.email,
        username: validation.data.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validation.data.username}`
      }

      setUser(mockUser)
      storageHelpers.saveUser(mockUser) // Use new storage helper
      return { success: true }
    } catch (networkError) {
      const errorMessage = 'Registration failed. Please check your connection and try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }
  const logout = () => {
    try {
      setUser(null)
      setError(null)
      storageHelpers.saveUser(null) // Use new storage helper
    } catch (storageError) {
      console.error('Error during logout:', storageError)
      // Continue with logout even if localStorage fails
      setUser(null)
      setError(null)
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)

      if (!user) return { success: false, error: 'No user logged in' }

      // Validate updates using new validation utilities
      const validationData: any = {}
      if (updates.username) validationData.username = updates.username
      if (updates.email) validationData.email = updates.email

      if (Object.keys(validationData).length > 0) {
        const validation = validateForm(validationData, VALIDATION_RULES.PROFILE_UPDATE)
        if (!validation.isValid) {
          const firstError = Object.values(validation.errors)[0]
          return { success: false, error: firstError }
        }
        // Use validated data
        Object.assign(updates, validation.data)
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      storageHelpers.saveUser(updatedUser) // Use new storage helper
      return { success: true }
    } catch (networkError) {
      const errorMessage = 'Failed to update profile. Please try again.'
      setError(errorMessage)
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
