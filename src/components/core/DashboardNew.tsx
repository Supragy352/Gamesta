import { ChevronDown, ChevronUp, Gamepad2, LogOut, Plus, Search, Sparkles, Target, Trophy, User, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { type Category, type Idea } from '../../lib/supabaseClient'
import { DatabaseService } from '../../services/database/databaseService'
import { validateForm, VALIDATION_RULES } from '../../utils/validation/validation'
import { LoadingButton, SkeletonCard } from '../ui/LoadingComponents'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const { showSuccess, showError } = useToast()
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [showForm, setShowForm] = useState(false)
    const [newIdea, setNewIdea] = useState({
        title: '',
        description: '',
        category_id: ''
    })
    const [filter, setFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)

                // Load categories and ideas in parallel
                const [categoriesData, ideasData] = await Promise.all([
                    DatabaseService.getCategories(),
                    DatabaseService.getIdeas({ limit: 50 })
                ])

                setCategories(categoriesData)
                setIdeas(ideasData)

                // Set first category as default if available
                if (categoriesData.length > 0) {
                    setNewIdea(prev => ({ ...prev, category_id: categoriesData[0].id }))
                }
            } catch (error) {
                showError('Loading Failed', 'Failed to load data. Please refresh the page.')
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [showError])

    const validateIdeaForm = (): string | null => {
        const validation = validateForm(newIdea, {
            title: VALIDATION_RULES.IDEA_SUBMISSION.title,
            description: VALIDATION_RULES.IDEA_SUBMISSION.description
        })

        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0]
            return typeof firstError === 'string' ? firstError : 'Validation failed'
        }
        return null
    }

    const handleSubmitIdea = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationError = validateIdeaForm()
        if (validationError) {
            showError('Validation Error', validationError)
            return
        }

        setSubmitting(true)

        try {
            await DatabaseService.createIdea({
                title: newIdea.title.trim(),
                description: newIdea.description.trim(),
                category_id: newIdea.category_id
            })

            // Reload ideas after successful submission
            const updatedIdeas = await DatabaseService.getIdeas({ limit: 50 })
            setIdeas(updatedIdeas)

            // Clear form
            setNewIdea({ title: '', description: '', category_id: categories[0]?.id || '' })
            setShowForm(false)
            showSuccess('Idea Added!', 'Your epic gaming idea has been shared with the community')
        } catch (error: any) {
            showError('Submission Failed', error.message || 'Failed to submit your idea. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
        try {
            const dbVoteType = voteType === 'up' ? 'upvote' : 'downvote'
            await DatabaseService.vote(ideaId, dbVoteType)

            // Reload ideas to get updated vote counts
            const updatedIdeas = await DatabaseService.getIdeas({ limit: 50 })
            setIdeas(updatedIdeas)

            showSuccess('Vote Recorded!', `Your ${voteType}vote has been counted`)
        } catch (error: any) {
            showError('Vote Failed', error.message || 'Failed to record your vote. Please try again.')
        }
    }

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
    }, [])

    const filteredIdeas = ideas
        .filter(idea => filter === 'all' || idea.category?.id === filter)
        .filter(idea =>
            idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            idea.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))

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
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Gamepad2 className="h-8 w-8 text-purple-400 glow-purple" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent gaming-font">
                                Gamesta
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                <User className="h-5 w-5" />
                                <span>{user?.username}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white gaming-font">Epic Gaming Ideas</h2>
                        <p className="text-gray-400 mt-2">Share your legendary tournament and activity concepts!</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 glow-purple"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add Idea</span>
                    </button>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-800/80 backdrop-blur border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="all">🔥 All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id} className="bg-gray-800">
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for epic ideas..."
                            className="w-full bg-gray-800/80 backdrop-blur border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Ideas List */}
                <div className="space-y-6">
                    {loading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))
                    ) : filteredIdeas.length > 0 ? (
                        filteredIdeas.map((idea, index) => (
                            <div key={idea.id} className={`bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] slide-in`} style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold gaming-font ${idea.category?.name?.toLowerCase().includes('tournament') ? 'bg-purple-600 text-white glow-purple' :
                                                idea.category?.name?.toLowerCase().includes('activity') ? 'bg-blue-600 text-white glow-blue' :
                                                    'bg-gray-600 text-white'
                                                }`}>
                                                {idea.category?.name || 'Other'}
                                            </span>
                                            <span className="text-gray-400 text-sm">{idea.author?.username}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 gaming-font">{idea.title}</h3>
                                        <p className="text-gray-300 leading-relaxed mb-4">{idea.description}</p>
                                        <div className="text-gray-400 text-sm flex items-center space-x-4">
                                            <span className="flex items-center space-x-1">
                                                <Zap className="h-4 w-4 text-yellow-400" />
                                                <span>{idea.upvotes - idea.downvotes} votes</span>
                                            </span>
                                            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => handleVote(idea.id, 'up')}
                                            className={`p-2 rounded-lg transition-all duration-300 ${idea.user_vote === 'upvote' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                                                }`}
                                        >
                                            <ChevronUp className="h-5 w-5" />
                                        </button>
                                        <span className="text-white font-semibold min-w-[3rem] text-center">
                                            {idea.upvotes - idea.downvotes}
                                        </span>
                                        <button
                                            onClick={() => handleVote(idea.id, 'down')}
                                            className={`p-2 rounded-lg transition-all duration-300 ${idea.user_vote === 'downvote' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                                                }`}
                                        >
                                            <ChevronDown className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 slide-in">
                            <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg gaming-font">No epic ideas found yet!</p>
                            <p className="text-gray-500 mt-2">Be the first legendary gamer to share your vision!</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Add Your Idea
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Idea Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-8 max-w-md w-full border border-white/20 slide-in">
                        <h3 className="text-2xl font-bold text-white mb-6 gaming-font">Share Your Epic Idea</h3>
                        <form onSubmit={handleSubmitIdea} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newIdea.title}
                                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter your legendary idea title..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">Description</label>
                                <textarea
                                    value={newIdea.description}
                                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32 resize-none"
                                    placeholder="Describe your epic gaming concept..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">Category</label>
                                <select
                                    value={newIdea.category_id}
                                    onChange={(e) => setNewIdea({ ...newIdea, category_id: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id} className="bg-gray-800">
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>                                <LoadingButton
                                    type="submit"
                                    isLoading={submitting}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300"
                                >
                                    Submit Idea
                                </LoadingButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
