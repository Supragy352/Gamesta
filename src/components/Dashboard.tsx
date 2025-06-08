import { ChevronDown, ChevronUp, Filter, Gamepad2, LogOut, Plus, Search, Sparkles, Target, Trophy, User, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useAutoSave, useDraftManager, useSearchHistory, useUserPreferences } from '../hooks/useAutoSave'
import { FormValidation, validateContent, validateForm, VALIDATION_RULES } from '../utils/validation'
import { LoadingButton, SkeletonCard } from './LoadingComponents'

interface Idea {
  id: string
  title: string
  description: string
  author: string
  authorId: string
  votes: number
  userVote: 'up' | 'down' | null
  category: 'tournament' | 'activity' | 'other'
  createdAt: Date
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { showSuccess, showError } = useToast()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'activity' as Idea['category']
  })
  const [filter, setFilter] = useState<'all' | 'tournament' | 'activity' | 'other'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Auto-save and persistence hooks
  const ideasAutoSave = useAutoSave(ideas, 'ideas_cache', {
    delay: 2000,
    onSave: () => console.log('Ideas cached successfully')
  })

  const { saveDraft, getDrafts, deleteDraft } = useDraftManager()
  const { savePreferences, getPreferences } = useUserPreferences()
  const { addSearchTerm } = useSearchHistory()

  // Auto-save form data as draft
  useAutoSave(newIdea, 'idea_form_draft', {
    delay: 1000,
    enabled: newIdea.title.length > 0 || newIdea.description.length > 0,
    onSave: (data) => {
      if (data.title || data.description) {
        saveDraft({
          ...data,
          timestamp: Date.now()
        })
      }
    }
  })

  // Enhanced validation function with content sanitization
  const validateIdeaFormEnhanced = useCallback((): FormValidation => {
    const formData = {
      title: newIdea.title,
      description: newIdea.description,
      category: newIdea.category
    }

    const validationRules = {
      title: VALIDATION_RULES.IDEA_SUBMISSION.title,
      description: VALIDATION_RULES.IDEA_SUBMISSION.description
    }

    // Use comprehensive validation
    const validation = validateForm(formData, validationRules)

    // Additional content validation
    if (validation.isValid) {
      const titleValidation = validateContent(newIdea.title, {
        minLength: 5,
        maxLength: 100,
        fieldName: 'Title'
      })

      const descriptionValidation = validateContent(newIdea.description, {
        minLength: 10,
        maxLength: 1000,
        fieldName: 'Description'
      })

      if (!titleValidation.isValid) {
        validation.isValid = false
        validation.errors.title = titleValidation.error || 'Title validation failed'
      }

      if (!descriptionValidation.isValid) {
        validation.isValid = false
        validation.errors.description = descriptionValidation.error || 'Description validation failed'
      }
    }

    return validation
  }, [newIdea])

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {        // Load user preferences
        const prefs = getPreferences()
        if (prefs && typeof prefs === 'object' && 'defaultCategory' in prefs) {
          const defaultCategory = (prefs as any).defaultCategory
          if (defaultCategory && defaultCategory !== 'activity') {
            setFilter(defaultCategory as typeof filter)
          }
        }

        // Restore cached ideas if available
        const restoredIdeas = ideasAutoSave.restoreData()
        if (restoredIdeas && Array.isArray(restoredIdeas) && restoredIdeas.length > 0) {
          setIdeas(restoredIdeas)
          setLoading(false)
          showSuccess('Data Restored', 'Previously saved ideas have been restored')
          return
        }

        // Load draft if available
        const drafts = getDrafts()
        if (drafts.length > 0) {
          const latestDraft = drafts[0]
          setNewIdea({
            title: latestDraft.title || '',
            description: latestDraft.description || '',
            category: latestDraft.category || 'activity'
          })
        }
      } catch (error) {
        console.error('Failed to load persisted data:', error)
      }
    }

    loadPersistedData()
  }, []) // Empty dependency array is intentional here

  // Load mock data with loading state
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        setLoading(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockIdeas: Idea[] = [{
          id: '1',
          title: 'MIT AOE Inter-Department Gaming Championship',
          description: 'A massive tournament between Computer, Mechanical, Electronics, Civil, and Chemical departments. Team battles with department pride at stake!',
          author: 'CompSci_Champion',
          authorId: '2',
          votes: 34,
          userVote: null,
          category: 'tournament',
          createdAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Engineering Gaming Lab Setup',
          description: 'Convert the main auditorium into a gaming arena with high-end PCs, projectors, and gaming peripherals for the fest weekend.',
          author: 'TechSetup_Pro',
          authorId: '3',
          votes: 28,
          userVote: null,
          category: 'activity',
          createdAt: new Date('2024-01-14')
        },
        {
          id: '3',
          title: 'Faculty vs Students Gaming Battle',
          description: 'Epic showdown where MIT AOE faculty members take on students in various games. Let\'s see who really dominates!',
          author: 'StudentRevolt',
          authorId: '4',
          votes: 22,
          userVote: null,
          category: 'activity',
          createdAt: new Date('2024-01-13')
        }]

        // Save to cache
        ideasAutoSave.saveData(mockIdeas)
        setIdeas(mockIdeas)
      } catch (error) {
        showError('Loading Failed', 'Failed to load ideas. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    loadIdeas()
  }, [showError, ideasAutoSave])

  // Enhanced validation function
  const validateIdeaForm = (): string | null => {
    const validation = validateIdeaFormEnhanced()
    if (!validation.isValid) {
      // Return the first error found
      const firstError = Object.values(validation.errors)[0]
      return firstError || 'Validation failed'
    }
    return null
  }

  // Save search terms to history
  const handleSearch = useCallback((term: string) => {
    if (term.trim()) {
      addSearchTerm(term.trim())
    }
    setSearchTerm(term)
  }, [addSearchTerm])

  // Save preferences when filter changes
  useEffect(() => {
    savePreferences({
      defaultCategory: filter !== 'all' ? filter : undefined
    })
  }, [filter, savePreferences])

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateIdeaForm()
    if (validationError) {
      showError('Validation Error', validationError)
      return
    }

    setSubmitting(true)

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Sanitize inputs using our validation utilities
      const titleValidation = validateContent(newIdea.title.trim())
      const descriptionValidation = validateContent(newIdea.description.trim())

      const idea: Idea = {
        id: Date.now().toString(),
        title: titleValidation.sanitized,
        description: descriptionValidation.sanitized,
        author: user?.username || 'Anonymous',
        authorId: user?.id || '0',
        votes: 0,
        userVote: null,
        category: newIdea.category,
        createdAt: new Date()
      }

      const updatedIdeas = [idea, ...ideas]
      setIdeas(updatedIdeas)

      // Clear form and draft
      setNewIdea({ title: '', description: '', category: 'activity' })
      const drafts = getDrafts()
      if (drafts.length > 0) {
        drafts.forEach(draft => {
          if (draft.title === newIdea.title || draft.description === newIdea.description) {
            deleteDraft(draft.id)
          }
        })
      }

      setShowForm(false)
      showSuccess('Idea Added!', 'Your epic gaming idea has been shared with the community')

      // Auto-save updated ideas
      ideasAutoSave.saveData(updatedIdeas)
    } catch (error) {
      showError('Submission Failed', 'Failed to submit your idea. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    try {
      // Optimistic UI update
      const updatedIdeas = ideas.map(idea => {
        if (idea.id === ideaId) {
          let newVotes = idea.votes
          let newUserVote: 'up' | 'down' | null = voteType

          // Handle vote logic
          if (idea.userVote === voteType) {
            // Remove vote
            newUserVote = null
            newVotes = voteType === 'up' ? newVotes - 1 : newVotes + 1
          } else if (idea.userVote) {
            // Change vote
            newVotes = voteType === 'up' ? newVotes + 2 : newVotes - 2
          } else {
            // New vote
            newVotes = voteType === 'up' ? newVotes + 1 : newVotes - 1
          }

          return { ...idea, votes: newVotes, userVote: newUserVote }
        }
        return idea
      })

      setIdeas(updatedIdeas)

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 300))

      // Auto-save updated ideas
      ideasAutoSave.saveData(updatedIdeas)

      // In a real app, handle network errors and rollback on failure
      showSuccess('Vote Recorded!', `Your ${voteType}vote has been counted`)
    } catch (error) {
      // Rollback the optimistic update
      showError('Vote Failed', 'Failed to record your vote. Please try again.')
      // In a real app, you'd revert the optimistic update here
    }
  }

  const filteredIdeas = ideas
    .filter(idea => filter === 'all' || idea.category === filter)
    .filter(idea =>
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.votes - a.votes)

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
        <Trophy className="absolute top-32 left-32 h-6 w-6 text-purple-400/20 float animate-pulse" />
        <Zap className="absolute top-40 right-40 h-5 w-5 text-pink-400/20 float delay-1000 animate-pulse" />
        <Target className="absolute bottom-32 right-32 h-7 w-7 text-blue-400/20 float delay-500 animate-pulse" />
        <Sparkles className="absolute bottom-40 left-40 h-6 w-6 text-purple-400/20 float delay-700 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-gray-700 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <Gamepad2 className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:rotate-12" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white gaming-font group-hover:glow-purple transition-all duration-300">Gamesta</span>
                <span className="text-xs text-purple-300 font-medium">MIT Academy of Engineering</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:glow-purple px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <User className="h-5 w-5" />
                <span className="gaming-font">{user?.username}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:glow-pink px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 slide-in">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 gaming-font glow-purple">Idea Hub</h1>
            <p className="text-gray-300">Share your ideas and vote on what matters most for the gaming fest!</p>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Top Ideas: <span className="text-white font-bold">{filteredIdeas.length}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Active Gamers: <span className="text-white font-bold">127</span></span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 pulse-glow gaming-font"
          >
            <Plus className="h-5 w-5" />
            <span>Add Epic Idea</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 slide-in delay-200">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-transparent border-0 text-white focus:outline-none focus:ring-0 gaming-font"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              <option value="tournament" className="bg-gray-800">🏆 Tournaments</option>
              <option value="activity" className="bg-gray-800">🎮 Activities</option>
              <option value="other" className="bg-gray-800">⚡ Other</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for epic ideas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg transition-all duration-300 hover:bg-white/20 focus:shadow-lg focus:shadow-purple-500/20"
            />
          </div>
        </div>

        {/* Ideas List */}
        <div className="grid gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : filteredIdeas.length > 0 ? (
            filteredIdeas.map((idea, index) => (
              <div key={idea.id} className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-[1.02] slide-in`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold gaming-font ${idea.category === 'tournament' ? 'bg-purple-600 text-white glow-purple' :
                        idea.category === 'activity' ? 'bg-blue-600 text-white glow-blue' :
                          'bg-gray-600 text-white'
                        }`}>
                        {idea.category === 'tournament' ? '🏆 Tournament' :
                          idea.category === 'activity' ? '🎮 Activity' : '⚡ Other'}
                      </span>
                      <span className="text-gray-400 text-sm">by <span className="text-purple-300 gaming-font">{idea.author}</span></span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 gaming-font hover:glow-purple transition-all duration-300">{idea.title}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{idea.description}</p>
                    <div className="text-gray-400 text-sm flex items-center space-x-4">
                      <span>{idea.createdAt.toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">{idea.votes > 10 ? 'Hot!' : 'New'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2 ml-6 bg-black/20 rounded-lg p-3 backdrop-blur-lg">
                    <button
                      onClick={() => handleVote(idea.id, 'up')}
                      className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 ${idea.userVote === 'up' ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 glow-green' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-green-400'
                        }`}
                    >
                      <ChevronUp className="h-6 w-6" />
                    </button>
                    <span className="text-white font-bold text-lg gaming-font glow-white">{idea.votes}</span>
                    <button
                      onClick={() => handleVote(idea.id, 'down')}
                      className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 ${idea.userVote === 'down' ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 glow-red' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-red-400'
                        }`}
                    >
                      <ChevronDown className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 slide-in">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-400 text-lg gaming-font">No epic ideas found yet!</p>
                <p className="text-gray-500 mt-2">Be the first legendary gamer to share your vision!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 gaming-font"
                >
                  Create First Idea
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Idea Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-8 max-w-md w-full border border-white/20 slide-in">
            <h2 className="text-2xl font-bold text-white mb-6 gaming-font glow-purple flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
              Share Your Epic Idea
            </h2>
            <form onSubmit={handleSubmitIdea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 gaming-font">Category</label>
                <select
                  value={newIdea.category}
                  onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value as Idea['category'] })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg transition-all duration-300"
                >
                  <option value="tournament" className="bg-gray-800">🏆 Tournament</option>
                  <option value="activity" className="bg-gray-800">🎮 Activity</option>
                  <option value="other" className="bg-gray-800">⚡ Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 gaming-font">Title</label>
                <input
                  type="text"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg transition-all duration-300 hover:bg-white/20"
                  placeholder="Enter your epic idea title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 gaming-font">Description</label>
                <textarea
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg transition-all duration-300 hover:bg-white/20"
                  placeholder="Describe your legendary idea in detail..."
                  required
                />
              </div>

              <div className="flex space-x-4 pt-2">
                <LoadingButton
                  type="submit"
                  isLoading={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 gaming-font"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Launch Idea
                </LoadingButton>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 backdrop-blur-lg border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
