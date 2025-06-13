import { ArrowRight, Gamepad2, Lightbulb, Star, Trophy, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
// import { useAuth } from '../../contexts/AuthContext'; // (unused)
// import { useToast } from '../../contexts/ToastContext'; // (unused)

export default function Landing() {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-500/10 rounded-full blur-xl float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-purple-400/10 rounded-full blur-xl float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-enhanced">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 slide-in-left">
              <div className="relative">
                <Gamepad2 className="h-10 w-10 text-purple-400 pulse-glow" />
                <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-3xl font-bold text-white gaming-font">Gamesta</span>
            </div>
            <Link
              to="/login"
              className="btn-gradient text-white px-8 py-3 rounded-xl font-semibold slide-in-right glow-purple"
            >
              Enter Arena
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="slide-in-up">            <div className="inline-flex items-center space-x-2 bg-purple-900/30 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-purple-500/30">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="text-purple-300 font-medium">MIT Academy of Engineering presents</span>
            <Star className="h-5 w-5 text-yellow-400" />
          </div>
          </div>

          <h1 className="text-7xl font-bold text-white mb-6 slide-in-up gaming-font" style={{ animationDelay: '0.2s' }}>
            GAMESTA 2025
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 pulse-glow">
              Gaming Fest
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto slide-in-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
            🎮 Join MIT AOE's most epic gaming festival! Share your tournament ideas, vote on legendary activities,
            and help shape the <span className="text-purple-400 font-semibold">ultimate gaming experience</span> for our Alandi campus community.
          </p>

          <div className="slide-in-up" style={{ animationDelay: '0.6s' }}>
            <Link
              to="/login"
              className="inline-flex items-center space-x-3 btn-gradient text-white px-10 py-5 rounded-2xl text-xl font-bold transition duration-300 glow-purple hover:scale-105"
            >
              <Gamepad2 className="h-6 w-6" />
              <span>Start Your Journey</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Enhanced Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="glass-card rounded-2xl p-8 text-center slide-in-up glow-purple" style={{ animationDelay: '0.8s' }}>
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">💡</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 gaming-font">Share Epic Ideas</h3>
            <p className="text-gray-300 leading-relaxed">
              Submit your most creative and wild ideas for tournaments, activities, and events.
              From retro gaming marathons to VR adventures - let your imagination run wild!
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center slide-in-up glow-pink" style={{ animationDelay: '1s' }}>
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-pink-600 to-pink-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">🏆</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 gaming-font">Vote & Dominate</h3>
            <p className="text-gray-300 leading-relaxed">
              Power up the best ideas with your votes! Help determine which epic activities and
              legendary tournaments make it to the final boss battle - the main event!
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center slide-in-up glow-blue" style={{ animationDelay: '1.2s' }}>
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">👥</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 gaming-font">Build Your Guild</h3>
            <p className="text-gray-300 leading-relaxed">
              Connect with fellow gamers, level up your profile, and become part of the legendary
              planning committee for the ultimate gaming festival experience!
            </p>
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className="relative mt-24 slide-in-up" style={{ animationDelay: '1.4s' }}>
          <div className="glass-enhanced rounded-3xl p-12 text-center glow-purple relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 text-4xl">🎮</div>
              <div className="absolute top-4 right-4 text-4xl">🏆</div>
              <div className="absolute bottom-4 left-4 text-4xl">⚡</div>
              <div className="absolute bottom-4 right-4 text-4xl">🚀</div>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6 gaming-font">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Level Up</span> Gaming History?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join hundreds of elite gamers who are already contributing legendary ideas and voting on what matters most.
                <span className="text-purple-400 font-semibold"> Your next move could change everything!</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/login"
                  className="btn-gradient text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 glow-purple flex items-center space-x-3"
                >
                  <Gamepad2 className="h-6 w-6" />
                  <span>Join the Elite</span>
                </Link>
                <div className="text-gray-400 text-sm">
                  ⚡ No registration fees • 🚀 Instant access • 🎮 Epic rewards
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
