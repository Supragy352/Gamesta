import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, type User } from '../lib/supabaseClient'
import { DatabaseService } from '../services/database/databaseService'
import { logger } from '../utils/logger'
import { validateForm, VALIDATION_RULES } from '../utils/validation/validation'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; userExists?: boolean }>
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
  checkUserExists: (email: string) => Promise<{ exists: boolean; error?: string }>
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
    logger.info('AUTH', 'Initializing auth state listener')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('AUTH', `Auth state changed: ${event}`, {
        userId: session?.user?.id,
        email: session?.user?.email
      })

      try {
        if (session?.user) {
          // Only proceed if the user is confirmed (email verified)
          if (session.user.email_confirmed_at || event === 'SIGNED_IN') {
            logger.info('AUTH', 'Loading verified user profile')

            try {
              // Add timeout to prevent hanging
              const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Profile loading timeout after 8 seconds')), 8000);
              });

              const profilePromise = DatabaseService.getCurrentUser();
              const userData = await Promise.race([profilePromise, timeoutPromise]);

              if (userData) {
                setUser(userData)
                setError(null)

                // Store safe user session info
                localStorage.setItem('gamesta_user_session', JSON.stringify({
                  userId: userData.id,
                  email: userData.email,
                  lastActivity: new Date().toISOString()
                }))

                logger.info('AUTH', 'User profile loaded successfully', { userId: userData.id })
              } else {
                logger.warn('AUTH', 'No user profile found for verified user')
                setError('User profile not found. Please try signing up again.')
                setUser(null)
              }
            } catch (profileError) {
              logger.error('AUTH', 'Failed to load user profile', profileError instanceof Error ? profileError : new Error('Unknown error'))

              if (profileError instanceof Error && profileError.message.includes('timeout')) {
                setError('Profile loading timed out. Please refresh the page.')
              } else {
                setError('Failed to load user profile. Please try logging in again.')
              }
              setUser(null)
            }
          } else {
            logger.info('AUTH', 'User not yet verified, waiting for email confirmation')
            setUser(null)
          }
        } else {
          logger.info('AUTH', 'User logged out, clearing session')
          setUser(null)
          setError(null)
          localStorage.removeItem('gamesta_user_session')
        }
      } catch (error) {
        logger.error('AUTH', 'Error in auth state change handler', error instanceof Error ? error : new Error('Unknown error'))
        setError('Authentication error occurred')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    // Check current session on app start
    const checkInitialSession = async () => {
      try {
        logger.info('AUTH', 'Checking initial session')

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          logger.error('AUTH', 'Error getting initial session', sessionError)
          setError('Failed to check authentication status')
          return
        } if (session?.user && session.user.email_confirmed_at) {
          logger.info('AUTH', 'Found existing verified session')

          try {
            // Add timeout to prevent hanging on initial load
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Initial profile loading timeout after 8 seconds')), 8000);
            });

            const profilePromise = DatabaseService.getCurrentUser();
            const userData = await Promise.race([profilePromise, timeoutPromise]);

            if (userData) {
              setUser(userData)

              // Store safe user session info
              localStorage.setItem('gamesta_user_session', JSON.stringify({
                userId: userData.id,
                email: userData.email,
                lastActivity: new Date().toISOString()
              }))

              logger.info('AUTH', 'Initial user profile loaded successfully', { userId: userData.id })
            }
          } catch (profileError) {
            logger.error('AUTH', 'Failed to load user profile on initial check', profileError instanceof Error ? profileError : new Error('Unknown error'))
            if (profileError instanceof Error && profileError.message.includes('timeout')) {
              setError('Profile loading timed out. Please refresh the page.')
            } else {
              setError('Failed to load user profile')
            }
          }
        } else {
          logger.info('AUTH', 'No verified session found')
        }
      } catch (error) {
        logger.error('AUTH', 'Error checking initial session', error instanceof Error ? error : new Error('Unknown error'))
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    checkInitialSession()

    return () => {
      logger.info('AUTH', 'Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  // Handle email verification and profile creation
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Check if this is a redirect from email verification
        const { data, error } = await supabase.auth.getSession()

        if (data.session?.user && !error) {
          const user = data.session.user

          // Check if this user needs profile creation (after email verification)
          if (user.email_confirmed_at && user.user_metadata?.username) {
            try {
              // Check if profile already exists
              const existingProfile = await DatabaseService.getCurrentUser()

              if (!existingProfile) {
                // Create profile for newly verified user
                logger.info('AUTH', 'Creating profile for newly verified user', { userId: user.id })
                await DatabaseService.createUserProfile(
                  user.id,
                  user.email!,
                  user.user_metadata.username
                )
                logger.info('AUTH', 'Profile created successfully for verified user')
              }
            } catch (profileError) {
              logger.error('AUTH', 'Failed to create profile for verified user', profileError instanceof Error ? profileError : new Error('Unknown error'))
            }
          }
        }
      } catch (error) {
        logger.error('AUTH', 'Error handling auth redirect', error instanceof Error ? error : new Error('Unknown error'))
      }
    }

    handleAuthRedirect()
  }, [])
  const checkUserExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      logger.info('AUTH', `Checking if user exists: ${email}`)

      // Check if user exists in our users table
      const { data, error: dbError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          // No rows returned = user doesn't exist in our database
          logger.info('AUTH', `User not found in database: ${email}`)
          return { exists: false }
        } else {
          // Other database error
          logger.error('AUTH', 'Database error checking user existence', dbError)
          return { exists: false, error: 'Failed to check user existence' }
        }
      }

      if (data) {
        // User exists in our database
        logger.info('AUTH', `User found in database: ${email}`)
        return { exists: true }
      }

      return { exists: false }
    } catch (error) {
      logger.error('AUTH', 'Error checking user existence', error instanceof Error ? error : new Error('Unknown error'))
      return { exists: false, error: 'Failed to check user existence' }
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; userExists?: boolean }> => {
    try {
      setError(null)
      logger.info('AUTH', `Login attempt for email: ${email}`)

      // Enhanced validation
      const validation = validateForm({ email, password }, VALIDATION_RULES.LOGIN)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        logger.warn('AUTH', `Login validation failed: ${firstError}`)
        return { success: false, error: firstError }
      }

      // First check if user exists
      const userCheck = await checkUserExists(email)
      if (userCheck.error) {
        return { success: false, error: userCheck.error }
      }

      if (!userCheck.exists) {
        logger.info('AUTH', `User does not exist: ${email}`)
        return { success: false, error: 'No account found with this email. Please sign up first.', userExists: false }
      }

      // Try to sign in
      const result = await DatabaseService.signIn(email, password)

      if (!result.user) {
        return { success: false, error: 'Login failed - invalid credentials' }
      }

      logger.info('AUTH', `Login successful for email: ${email}`, { userId: result.user.id })
      return { success: true, userExists: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.'
      logger.error('AUTH', `Login failed for email: ${email} - ${errorMessage}`)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    try {
      setError(null)
      logger.info('AUTH', `Registration attempt for email: ${email}, username: ${username}`)

      // Enhanced validation
      const validation = validateForm({ email, password, username }, VALIDATION_RULES.REGISTER)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        return { success: false, error: firstError }
      }

      // Check if user already exists
      const userCheck = await checkUserExists(email)
      if (userCheck.exists) {
        return { success: false, error: 'An account with this email already exists. Please try logging in instead.' }
      }      // Register with Supabase - this will send verification email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          },
          emailRedirectTo: `${window.location.origin}/email-verified`
        }
      })

      if (error) {
        logger.error('AUTH', 'Registration failed', error)
        return { success: false, error: error.message }
      }

      if (data.user && !data.user.email_confirmed_at) {
        logger.info('AUTH', 'Registration successful, verification email sent', { userId: data.user.id })
        return {
          success: true,
          needsVerification: true
        }
      }

      // If email is already confirmed (unlikely), create profile immediately
      if (data.user && data.user.email_confirmed_at) {
        await DatabaseService.createUserProfile(data.user.id, email, username)
        logger.info('AUTH', 'Registration and profile creation successful', { userId: data.user.id })
        return { success: true, needsVerification: false }
      }

      return { success: true, needsVerification: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.'
      logger.error('AUTH', 'Registration error', error instanceof Error ? error : new Error(errorMessage))
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      logger.info('AUTH', 'User logout initiated')
      await DatabaseService.signOut()
      setUser(null)
      setError(null)
      localStorage.removeItem('gamesta_user_session')
      logger.info('AUTH', 'User logout completed successfully')
    } catch (error) {
      logger.error('AUTH', 'Error during logout', error instanceof Error ? error : new Error('Unknown error'))
      console.error('Error during logout:', error)
      // Continue with logout even if there's an error
      setUser(null)
      setError(null)
      localStorage.removeItem('gamesta_user_session')
    }
  }

  const updateProfile = async (updates: Partial<Pick<User, 'username' | 'bio'>>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      logger.info('AUTH', 'Profile update requested', { userId: user.id, updates })
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      logger.error('AUTH', 'Profile update failed', error, { userId: user?.id })
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
      checkUserExists,
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
