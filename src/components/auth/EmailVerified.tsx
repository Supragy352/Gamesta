import { CheckCircle, Gamepad2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabaseClient'
import { DatabaseService } from '../../services/database/databaseService'
import { logger } from '../../utils/logger'

export default function EmailVerified() {
    const [isProcessing, setIsProcessing] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { showSuccess, showError } = useToast()

    useEffect(() => {
        const handleEmailVerification = async () => {
            try {
                logger.info('AUTH', 'Processing email verification')

                // Get the current session after email verification
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    throw sessionError
                }

                if (session?.user && session.user.email_confirmed_at) {
                    const user = session.user
                    logger.info('AUTH', 'Email verified successfully', { userId: user.id })

                    // Check if user profile already exists
                    try {
                        const existingProfile = await DatabaseService.getCurrentUser()

                        if (existingProfile) {
                            // Profile already exists, redirect to dashboard
                            logger.info('AUTH', 'User profile found, redirecting to dashboard')
                            showSuccess('Welcome!', 'Your email has been verified and you\'re now logged in!')
                            navigate('/dashboard')
                            return
                        }
                    } catch (profileError) {
                        // Profile doesn't exist, create it
                        logger.info('AUTH', 'Creating user profile after email verification')
                    }

                    // Create user profile using metadata from signup
                    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user'

                    await DatabaseService.createUserProfile(
                        user.id,
                        user.email!,
                        username
                    )

                    logger.info('AUTH', 'User profile created successfully after verification')
                    showSuccess('Account Setup Complete!', 'Welcome to the MIT AOE Gaming Community!')
                    navigate('/dashboard')
                } else {
                    // No verified session found
                    setError('Email verification failed or session expired. Please try logging in.')
                    setTimeout(() => navigate('/login'), 3000)
                }
            } catch (error: any) {
                logger.error('AUTH', 'Email verification failed', error)
                setError(error.message || 'Email verification failed. Please try logging in manually.')
                setTimeout(() => navigate('/login'), 3000)
            } finally {
                setIsProcessing(false)
            }
        }

        handleEmailVerification()
    }, [navigate, showSuccess, showError])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
                        <Gamepad2 className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:rotate-12" />
                        <span className="text-2xl font-bold text-white gaming-font group-hover:glow-purple transition-all duration-300">Gamesta</span>
                    </Link>
                    <div className="text-sm text-purple-300 mb-2 font-medium">MIT Academy of Engineering</div>
                </div>

                {/* Verification Status Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                    {isProcessing ? (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                                <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 gaming-font">Verifying Email</h2>
                            <p className="text-gray-300">Setting up your gaming profile...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 gaming-font">Verification Failed</h2>
                            <p className="text-gray-300 mb-4">{error}</p>
                            <p className="text-sm text-gray-400">Redirecting to login page...</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 gaming-font">Email Verified!</h2>
                            <p className="text-gray-300 mb-4">Your account has been successfully verified and set up.</p>
                            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
                        </div>
                    )}
                </div>

                {/* Manual Actions */}
                {!isProcessing && (
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-purple-400 hover:text-purple-300 font-semibold transition-all duration-300 hover:glow-purple gaming-font"
                        >
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
