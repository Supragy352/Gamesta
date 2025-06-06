import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Gamepad2, Eye, EyeOff, Zap, Shield, Star } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let success = false
      if (isLogin) {
        success = await login(email, password)
      } else {
        success = await register(email, password, username)
      }

      if (success) {
        navigate('/dashboard')
      } else {
        setError(isLogin ? 'Invalid credentials' : 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Gaming Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Zap className="absolute top-20 left-20 h-6 w-6 text-purple-400/20 float animate-pulse" />
        <Shield className="absolute top-40 right-20 h-8 w-8 text-pink-400/20 float delay-1000 animate-pulse" />
        <Star className="absolute bottom-20 left-40 h-5 w-5 text-blue-400/20 float delay-500 animate-pulse" />
        <Gamepad2 className="absolute bottom-40 right-40 h-7 w-7 text-purple-400/20 float delay-700 animate-pulse" />
      </div>

      <div className="max-w-md w-full relative z-10 slide-in">        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <Gamepad2 className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:rotate-12" />
            <span className="text-2xl font-bold text-white gaming-font group-hover:glow-purple transition-all duration-300">Gamesta</span>
          </Link>
          <div className="text-sm text-purple-300 mb-2 font-medium">MIT Academy of Engineering</div>
          <h1 className="text-3xl font-bold text-white mb-2 gaming-font glow-purple">
            {isLogin ? 'Welcome Back, Gamer!' : 'Join MIT AOE Gaming'}
          </h1>
          <p className="text-gray-300">
            {isLogin 
              ? 'Ready to dive back into the Alandi campus gaming community?' 
              : 'Create your account and represent MIT AOE in the gaming revolution'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">            {!isLogin && (
              <div className="group">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-purple-300 transition-colors">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 focus:shadow-lg focus:shadow-purple-500/20"
                  placeholder="Choose your gaming alias"
                />
              </div>
            )}

            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-purple-300 transition-colors">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 focus:shadow-lg focus:shadow-purple-500/20"
                placeholder="Enter your email"
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-purple-300 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 transition-all duration-300 hover:bg-white/25 focus:shadow-lg focus:shadow-purple-500/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 pulse-glow animate-pulse">
                <p className="text-red-300 text-sm flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 pulse-glow gaming-font"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  {isLogin ? 'Enter the Arena' : 'Join the Elite'}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              {isLogin ? "New to the gaming community? " : "Already part of the elite? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-all duration-300 hover:glow-purple gaming-font"
              >
                {isLogin ? 'Create your legend' : 'Return to battle'}
              </button>
            </p>
          </div>
        </div>

        {/* Gaming Stats Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <div className="flex flex-col items-center">
              <span className="text-purple-400 font-bold gaming-font">500+</span>
              <span>Gamers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-pink-400 font-bold gaming-font">1K+</span>
              <span>Ideas</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-blue-400 font-bold gaming-font">50+</span>
              <span>Events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
