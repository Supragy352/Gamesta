import React, { createContext, useContext, useEffect, useState } from 'react'

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
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, username: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('gamesta_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])
  const login = async (email: string, _password: string): Promise<boolean> => {
    try {
      // Mock authentication - replace with real API call
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      setUser(mockUser)
      localStorage.setItem('gamesta_user', JSON.stringify(mockUser))
      return true
    } catch (error) {
      // Silent error handling for mock authentication
      return false
    }
  }
  const register = async (email: string, _password: string, username: string): Promise<boolean> => {
    try {
      // Mock registration - replace with real API call
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      }
      setUser(mockUser)
      localStorage.setItem('gamesta_user', JSON.stringify(mockUser))
      return true
    } catch (error) {
      // Silent error handling for mock authentication
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gamesta_user')
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('gamesta_user', JSON.stringify(updatedUser))
      return true
    } catch (error) {
      // Silent error handling for mock authentication
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile
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
