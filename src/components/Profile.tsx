import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Gamepad2, User, Mail, Edit3, Save, X, Trophy, Lightbulb, Calendar, Star, Zap, Crown } from 'lucide-react'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user?.username || '',
    bio: user?.bio || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const success = await updateProfile(editData)
    if (success) {
      setIsEditing(false)
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setEditData({
      username: user?.username || '',
      bio: user?.bio || ''
    })
    setIsEditing(false)
  }

  // Mock user stats
  const userStats = {
    ideasSubmitted: 3,
    totalVotes: 47,
    joinedDate: new Date('2024-01-10')
  }
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Gaming Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-32 left-32 h-6 w-6 text-purple-400/20 float animate-pulse" />
        <Zap className="absolute top-40 right-40 h-5 w-5 text-pink-400/20 float delay-1000 animate-pulse" />
        <Crown className="absolute bottom-32 right-32 h-7 w-7 text-blue-400/20 float delay-500 animate-pulse" />
        <Trophy className="absolute bottom-40 left-40 h-6 w-6 text-purple-400/20 float delay-700 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-gray-700 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <Gamepad2 className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:rotate-12" />
              <span className="text-2xl font-bold text-white gaming-font group-hover:glow-purple transition-all duration-300">Gamesta</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-300 hover:text-white transition-all duration-200 hover:glow-purple px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="text-gray-300 hover:text-white transition-all duration-200 hover:glow-pink px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300 slide-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-24 h-24 rounded-full border-4 border-purple-400 shadow-lg shadow-purple-500/50"
                />
                <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 glow-purple">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 bg-yellow-500 rounded-full p-1">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1 gaming-font">Username</label>
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1 gaming-font">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg transition-all duration-300"
                        placeholder="Tell the gaming community about yourself..."
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 gaming-font glow-purple flex items-center">
                      {user?.username}
                      <Star className="h-6 w-6 ml-2 text-yellow-400 animate-pulse" />
                    </h1>
                    <div className="flex items-center space-x-2 text-gray-300 mb-2">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {user?.bio || 'Elite gamer with no bio yet. Click edit to add your gaming story!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
              <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 gaming-font"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600/50 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 backdrop-blur-lg border border-white/20"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 gaming-font"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 slide-in">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50 glow-purple">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 gaming-font glow-white">{userStats.ideasSubmitted}</h3>
            <p className="text-gray-300">Epic Ideas Submitted</p>
            <div className="mt-2 flex justify-center">
              <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:border-pink-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 slide-in delay-200">
            <div className="bg-gradient-to-r from-pink-600 to-pink-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/50 glow-pink">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 gaming-font glow-white">{userStats.totalVotes}</h3>
            <p className="text-gray-300">Victory Points Earned</p>
            <div className="mt-2 flex justify-center">
              <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 slide-in delay-400">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50 glow-blue">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 gaming-font glow-white">
              {Math.floor((Date.now() - userStats.joinedDate.getTime()) / (1000 * 60 * 60 * 24))}
            </h3>
            <p className="text-gray-300">Days in the Arena</p>
            <div className="mt-2 flex justify-center">
              <Crown className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300 slide-in delay-600">
          <h2 className="text-2xl font-bold text-white mb-6 gaming-font glow-purple flex items-center">
            <Zap className="h-6 w-6 mr-2 text-purple-400" />
            Recent Gaming Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-600 to-green-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white gaming-font">You submitted a legendary idea: "Retro Gaming Setup Contest"</p>
                <p className="text-gray-400 text-sm flex items-center">
                  <Star className="h-3 w-3 mr-1 text-yellow-400" />
                  2 days ago • +15 XP
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white gaming-font">Your epic idea "VR Experience Zone" gained massive support!</p>
                <p className="text-gray-400 text-sm flex items-center">
                  <Crown className="h-3 w-3 mr-1 text-yellow-400" />
                  3 days ago • +25 XP • 5 new upvotes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white gaming-font">Welcome to the elite Gamesta gaming community!</p>
                <p className="text-gray-400 text-sm flex items-center">
                  <Zap className="h-3 w-3 mr-1 text-yellow-400" />
                  {userStats.joinedDate.toLocaleDateString()} • Achievement Unlocked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-xl p-8 mt-8 text-center border border-white/20 backdrop-blur-lg slide-in delay-800">
          <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-white mb-4 gaming-font glow-purple">Ready to Dominate More Challenges?</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            The ultimate gaming fest is taking shape thanks to legendary contributions from elite gamers like you! 
            Join the battle and help shape the future of gaming events.
          </p>
          <Link 
            to="/dashboard" 
            className="bg-gradient-to-r from-white to-gray-100 text-purple-900 px-8 py-3 rounded-lg font-bold hover:from-gray-100 hover:to-white transition-all duration-300 transform hover:scale-105 gaming-font shadow-lg hover:shadow-xl"
          >
            Return to Arena
          </Link>
        </div>
      </div>
    </div>
  )
}
