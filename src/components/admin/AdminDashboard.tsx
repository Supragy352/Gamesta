import { Activity, AlertTriangle, CheckCircle, Database, Eye, EyeOff, Lightbulb, Monitor, Save, Shield, Tag, TrendingUp, UserPlus, Users, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { DatabaseService } from '../../services/database/databaseService';
import { logger } from '../../utils/logger';
import { testSupabaseConnection } from '../../utils/testConnection';
import { LoadingSpinner } from '../ui/LoadingComponents';
import DatabaseSetup from './DatabaseSetup';
import { LogViewer } from './LogViewer';

interface TestResult {
    name: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    duration?: number;
}

interface DatabaseStats {
    totalUsers: number;
    totalIdeas: number;
    totalVotes: number;
    totalCategories: number;
    activeUsersToday: number;
    topIdeaTitle: string;
    topIdeaVotes: number;
}

interface CreateFormData {
    user: {
        email: string;
        password: string;
        username: string;
    };
    idea: {
        title: string;
        description: string;
        category_id: string;
    };
    category: {
        name: string;
        description: string;
        color: string;
    };
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'tests' | 'logs'>('overview');
    const [createFormData, setCreateFormData] = useState<CreateFormData>({
        user: { email: '', password: '', username: '' },
        idea: { title: '', description: '', category_id: '' },
        category: { name: '', description: '', color: '#9333ea' }
    });// Admin password (in production, this should be environment-based)
    const ADMIN_PASSWORD = 'gamesta_admin_2024';

    useEffect(() => {
        if (isAuthenticated) {
            loadCategories();
        }
    }, [isAuthenticated]); const loadCategories = async () => {
        try {
            const categoriesData = await DatabaseService.getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleCreateUser = async () => {
        setIsCreating(true);
        try {
            await DatabaseService.signUp(
                createFormData.user.email,
                createFormData.user.password,
                createFormData.user.username
            );
            showToast({ type: 'success', title: 'User created successfully' });
            setCreateFormData(prev => ({ ...prev, user: { email: '', password: '', username: '' } }));
            setShowCreateModal(null);
            loadDashboardData();
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Failed to create user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateIdea = async () => {
        setIsCreating(true);
        try {
            await DatabaseService.createIdea(createFormData.idea);
            showToast({ type: 'success', title: 'Idea created successfully' });
            setCreateFormData(prev => ({ ...prev, idea: { title: '', description: '', category_id: '' } }));
            setShowCreateModal(null);
            loadDashboardData();
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Failed to create idea',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsCreating(false);
        }
    }; const handleCreateCategory = async () => {
        setIsCreating(true);
        try {
            await DatabaseService.createCategory(createFormData.category);
            showToast({ type: 'success', title: 'Category created successfully' });
            setCreateFormData(prev => ({ ...prev, category: { name: '', description: '', color: '#9333ea' } }));
            setShowCreateModal(null);
            loadCategories();
            loadDashboardData();
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Failed to create category',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const resetCreateForm = () => {
        setCreateFormData({
            user: { email: '', password: '', username: '' },
            idea: { title: '', description: '', category_id: '' },
            category: { name: '', description: '', color: '#9333ea' }
        });
        setShowCreateModal(null);
    }; const handleAdminLogin = () => {
        logger.info('ADMIN', 'Admin authentication attempt', { email: user?.email });

        if (adminPassword === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            logger.info('ADMIN', 'Admin access granted successfully', {
                userId: user?.id,
                email: user?.email,
                timestamp: new Date().toISOString()
            });
            showToast({ type: 'success', title: 'Admin access granted' });
            loadDashboardData();
        } else {
            logger.warn('ADMIN', 'Invalid admin password attempt', {
                email: user?.email,
                timestamp: new Date().toISOString()
            });
            showToast({ type: 'error', title: 'Invalid admin password' });
            setAdminPassword('');
        }
    }; const loadDashboardData = async () => {
        setIsLoading(true);

        try {
            logger.info('ADMIN', '📊 Loading dashboard data...');

            // Run comprehensive connection test
            const connectionTest = await testSupabaseConnection(); if (!connectionTest.success) {
                logger.error('DATABASE', `Database connection failed: ${connectionTest.error}`);
                throw new Error(`Database connection failed: ${connectionTest.error}`);
            }

            logger.info('DATABASE', '✅ Database connection test passed', {
                tableResults: connectionTest.tableResults
            });

            // Load data with individual error handling
            let users: any[] = [], ideas: any[] = [], votes: any[] = [], categories: any[] = [];

            try {
                users = await DatabaseService.getAllUsers();
                console.log(`✅ Loaded ${users.length} users`);
            } catch (error) {
                console.error('❌ Failed to load users:', error);
                users = [];
            }

            try {
                ideas = await DatabaseService.getAllIdeas();
                console.log(`✅ Loaded ${ideas.length} ideas`);
            } catch (error) {
                console.error('❌ Failed to load ideas:', error);
                ideas = [];
            }

            try {
                votes = await DatabaseService.getAllVotes();
                console.log(`✅ Loaded ${votes.length} votes`);
            } catch (error) {
                console.error('❌ Failed to load votes:', error);
                votes = [];
            }

            try {
                categories = await DatabaseService.getCategories();
                console.log(`✅ Loaded ${categories.length} categories`);
            } catch (error) {
                console.error('❌ Failed to load categories:', error);
                categories = [];
            }

            // Calculate top idea safely
            let topIdea = null;
            let topIdeaVotes = 0;

            if (ideas.length > 0 && votes.length > 0) {
                const ideaVoteCounts = ideas.map((idea: any) => ({
                    ...idea,
                    voteCount: votes.filter((vote: any) => vote.idea_id === idea.id && vote.vote_type === 'upvote').length -
                        votes.filter((vote: any) => vote.idea_id === idea.id && vote.vote_type === 'downvote').length
                }));

                topIdea = ideaVoteCounts.sort((a: any, b: any) => b.voteCount - a.voteCount)[0];
                topIdeaVotes = topIdea?.voteCount || 0;
            }

            // Calculate active users today safely
            let activeUsersToday = 0;
            if (users.length > 0 || ideas.length > 0 || votes.length > 0) {
                const today = new Date().toDateString();
                const activeUserIds = new Set([
                    ...votes.filter((vote: any) => vote.created_at && new Date(vote.created_at).toDateString() === today).map((vote: any) => vote.user_id),
                    ...ideas.filter((idea: any) => idea.created_at && new Date(idea.created_at).toDateString() === today).map((idea: any) => idea.user_id)
                ]);
                activeUsersToday = activeUserIds.size;
            }

            setDbStats({
                totalUsers: users.length,
                totalIdeas: ideas.length,
                totalVotes: votes.length,
                totalCategories: categories.length,
                activeUsersToday,
                topIdeaTitle: topIdea?.title || 'No ideas yet',
                topIdeaVotes
            });

            console.log('✅ Dashboard data loaded successfully');

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            showToast({
                type: 'error',
                title: 'Error loading dashboard data',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const runDatabaseTests = async () => {
        setIsRunningTests(true);
        const results: TestResult[] = [];

        try {
            // Test 1: Database Connection
            const startTime = Date.now();
            try {
                await DatabaseService.getCategories();
                results.push({
                    name: 'Database Connection',
                    status: 'success',
                    message: 'Successfully connected to Supabase',
                    duration: Date.now() - startTime
                });
            } catch (error) {
                results.push({
                    name: 'Database Connection',
                    status: 'error',
                    message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 2: User Operations
            try {
                const startTime2 = Date.now();
                const users = await DatabaseService.getAllUsers();
                results.push({
                    name: 'User Operations',
                    status: 'success',
                    message: `Retrieved ${users.length} users`,
                    duration: Date.now() - startTime2
                });
            } catch (error) {
                results.push({
                    name: 'User Operations',
                    status: 'error',
                    message: `User operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 3: Idea Operations
            try {
                const startTime3 = Date.now();
                const ideas = await DatabaseService.getAllIdeas();
                results.push({
                    name: 'Idea Operations',
                    status: 'success',
                    message: `Retrieved ${ideas.length} ideas`,
                    duration: Date.now() - startTime3
                });
            } catch (error) {
                results.push({
                    name: 'Idea Operations',
                    status: 'error',
                    message: `Idea operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 4: Vote Operations
            try {
                const startTime4 = Date.now();
                const votes = await DatabaseService.getAllVotes();
                results.push({
                    name: 'Vote Operations',
                    status: 'success',
                    message: `Retrieved ${votes.length} votes`,
                    duration: Date.now() - startTime4
                });
            } catch (error) {
                results.push({
                    name: 'Vote Operations',
                    status: 'error',
                    message: `Vote operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 5: Category Operations
            try {
                const startTime5 = Date.now();
                const categories = await DatabaseService.getCategories();
                results.push({
                    name: 'Category Operations',
                    status: 'success',
                    message: `Retrieved ${categories.length} categories`,
                    duration: Date.now() - startTime5
                });
            } catch (error) {
                results.push({
                    name: 'Category Operations',
                    status: 'error',
                    message: `Category operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }      // Test 6: Real-time Subscriptions
            try {
                const startTime6 = Date.now();
                const subscription = DatabaseService.subscribeToIdeas(() => { });
                if (subscription) {
                    subscription.unsubscribe();
                    results.push({
                        name: 'Real-time Subscriptions',
                        status: 'success',
                        message: 'Real-time subscriptions working',
                        duration: Date.now() - startTime6
                    });
                } else {
                    results.push({
                        name: 'Real-time Subscriptions',
                        status: 'warning',
                        message: 'Subscription created but validation incomplete'
                    });
                }
            } catch (error) {
                results.push({
                    name: 'Real-time Subscriptions',
                    status: 'error',
                    message: `Real-time subscriptions failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            } setTestResults(results);
            showToast({ type: 'success', title: 'Database tests completed' });
        } catch (error) {
            showToast({ type: 'error', title: 'Test execution failed' });
        } finally {
            setIsRunningTests(false);
        }
    };

    const runFeatureTests = async () => {
        setIsRunningTests(true);
        const results: TestResult[] = [];

        try {
            // Test 1: Authentication Check
            if (user) {
                results.push({
                    name: 'Authentication',
                    status: 'success',
                    message: `User authenticated: ${user.email}`
                });
            } else {
                results.push({
                    name: 'Authentication',
                    status: 'warning',
                    message: 'No user currently authenticated'
                });
            }      // Test 2: Create Test Idea (if user is authenticated)
            if (user) {
                try {
                    const testIdea = await DatabaseService.createIdea({
                        title: 'Test Idea ' + Date.now(),
                        description: 'This is a test idea created by admin dashboard',
                        category_id: '1' // Assuming tournament category exists
                    });

                    results.push({
                        name: 'Idea Creation',
                        status: 'success',
                        message: `Test idea created with ID: ${testIdea.id}`
                    });

                    // Test 3: Vote on Test Idea
                    try {
                        await DatabaseService.voteOnIdea(testIdea.id, user.id, 'upvote');
                        results.push({
                            name: 'Voting System',
                            status: 'success',
                            message: 'Successfully voted on test idea'
                        });
                    } catch (error) {
                        results.push({
                            name: 'Voting System',
                            status: 'error',
                            message: `Voting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        });
                    }

                    // Clean up test idea
                    try {
                        await DatabaseService.deleteIdea(testIdea.id);
                        results.push({
                            name: 'Idea Deletion',
                            status: 'success',
                            message: 'Test idea cleaned up successfully'
                        });
                    } catch (error) {
                        results.push({
                            name: 'Idea Deletion',
                            status: 'warning',
                            message: 'Test idea created but cleanup failed'
                        });
                    }
                } catch (error) {
                    results.push({
                        name: 'Idea Creation',
                        status: 'error',
                        message: `Idea creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    });
                }
            }

            // Test 4: Search Functionality
            try {
                const searchResults = await DatabaseService.searchIdeas('test', []);
                results.push({
                    name: 'Search Functionality',
                    status: 'success',
                    message: `Search returned ${searchResults.length} results`
                });
            } catch (error) {
                results.push({
                    name: 'Search Functionality',
                    status: 'error',
                    message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            } setTestResults(results);
            showToast({ type: 'success', title: 'Feature tests completed' });
        } catch (error) {
            showToast({ type: 'error', title: 'Feature test execution failed' });
        } finally {
            setIsRunningTests(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            default:
                return null;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-purple-400" />
                        <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Admin Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                                    placeholder="Enter admin password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAdminLogin}
                            disabled={!adminPassword}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            Access Admin Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-purple-400" />
                            <div>
                                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-gray-300">Gamesta Database & Feature Testing</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsAuthenticated(false);
                                setAdminPassword('');
                                setTestResults([]);
                                setDbStats(null);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>                </div>

                {/* Tab Navigation */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
                    <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'overview'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Activity className="w-4 h-4" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('database')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'database'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Database className="w-4 h-4" />
                            Database Setup
                        </button>                        <button
                            onClick={() => setActiveTab('tests')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'tests'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Tests & Management
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'logs'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Monitor className="w-4 h-4" />
                            System Logs
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Statistics Grid */}
                        {dbStats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-8 h-8 text-blue-400" />
                                        <div>
                                            <p className="text-gray-300 text-sm">Total Users</p>
                                            <p className="text-2xl font-bold text-white">{dbStats.totalUsers}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-8 h-8 text-green-400" />
                                        <div>
                                            <p className="text-gray-300 text-sm">Total Ideas</p>
                                            <p className="text-2xl font-bold text-white">{dbStats.totalIdeas}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-8 h-8 text-purple-400" />
                                        <div>
                                            <p className="text-gray-300 text-sm">Total Votes</p>
                                            <p className="text-2xl font-bold text-white">{dbStats.totalVotes}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <Database className="w-8 h-8 text-yellow-400" />
                                        <div>
                                            <p className="text-gray-300 text-sm">Active Today</p>
                                            <p className="text-2xl font-bold text-white">{dbStats.activeUsersToday}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Idea */}
                        {dbStats && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                                <h3 className="text-xl font-bold text-white mb-3">Top Performing Idea</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{dbStats.topIdeaTitle}</p>
                                        <p className="text-gray-300 text-sm">Most voted idea</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-400">{dbStats.topIdeaVotes}</p>
                                        <p className="text-gray-300 text-sm">net votes</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Test Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Database Tests</h3>
                                <p className="text-gray-300 mb-4">Test all database operations and connections</p>
                                <button
                                    onClick={runDatabaseTests}
                                    disabled={isRunningTests}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isRunningTests ? <LoadingSpinner size="sm" /> : <Database className="w-5 h-5" />}
                                    {isRunningTests ? 'Running Tests...' : 'Run Database Tests'}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Feature Tests</h3>
                                <p className="text-gray-300 mb-4">Test application features and workflows</p>
                                <button
                                    onClick={runFeatureTests}
                                    disabled={isRunningTests}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isRunningTests ? <LoadingSpinner size="sm" /> : <Activity className="w-5 h-5" />}
                                    {isRunningTests ? 'Running Tests...' : 'Run Feature Tests'}
                                </button>                    </div>
                        </div>

                        {/* Database Creation Controls */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">Database Management</h3>
                            <p className="text-gray-300 mb-6">Create new database entries for testing and administration</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setShowCreateModal('user')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Create User
                                </button>

                                <button
                                    onClick={() => setShowCreateModal('idea')}
                                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lightbulb className="w-5 h-5" />
                                    Create Idea
                                </button>

                                <button
                                    onClick={() => setShowCreateModal('category')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Tag className="w-5 h-5" />
                                    Create Category
                                </button>
                            </div>
                        </div>

                        {/* Test Results */}
                        {testResults.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>
                                <div className="space-y-3">
                                    {testResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border-l-4 ${result.status === 'success'
                                                ? 'bg-green-900/20 border-green-400'
                                                : result.status === 'error'
                                                    ? 'bg-red-900/20 border-red-400'
                                                    : 'bg-yellow-900/20 border-yellow-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(result.status)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">{result.name}</p>
                                                    <p className="text-gray-300 text-sm">{result.message}</p>
                                                    {result.duration && (
                                                        <p className="text-gray-400 text-xs mt-1">
                                                            Completed in {result.duration}ms
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}                {/* Loading States */}
                        {isLoading && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                                <LoadingSpinner size="lg" />
                                <p className="text-white mt-4">Loading dashboard data...</p>
                            </div>
                        )}
                    </>
                )}

                {/* Database Setup Tab */}
                {activeTab === 'database' && (
                    <div className="space-y-6">
                        <DatabaseSetup />
                    </div>
                )}

                {/* Tests & Management Tab */}
                {activeTab === 'tests' && (
                    <>
                        {/* Test Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Database Tests</h3>
                                <p className="text-gray-300 mb-4">Test all database operations and connections</p>
                                <button
                                    onClick={runDatabaseTests}
                                    disabled={isRunningTests}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isRunningTests ? <LoadingSpinner size="sm" /> : <Database className="w-5 h-5" />}
                                    {isRunningTests ? 'Running Tests...' : 'Run Database Tests'}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Feature Tests</h3>
                                <p className="text-gray-300 mb-4">Test application features and workflows</p>
                                <button
                                    onClick={runFeatureTests}
                                    disabled={isRunningTests}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isRunningTests ? <LoadingSpinner size="sm" /> : <Activity className="w-5 h-5" />}
                                    {isRunningTests ? 'Running Tests...' : 'Run Feature Tests'}
                                </button>
                            </div>
                        </div>

                        {/* Database Creation Controls */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">Database Management</h3>
                            <p className="text-gray-300 mb-6">Create new database entries for testing and administration</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setShowCreateModal('user')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Create User
                                </button>

                                <button
                                    onClick={() => setShowCreateModal('idea')}
                                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lightbulb className="w-5 h-5" />
                                    Create Idea
                                </button>

                                <button
                                    onClick={() => setShowCreateModal('category')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Tag className="w-5 h-5" />
                                    Create Category
                                </button>
                            </div>
                        </div>

                        {/* Test Results */}
                        {testResults.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>
                                <div className="space-y-3">
                                    {testResults.map((result, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                                            {getStatusIcon(result.status)}
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{result.name}</p>
                                                <p className="text-sm text-gray-300">{result.message}</p>
                                            </div>
                                            {result.duration && (
                                                <span className="text-xs text-gray-400">{result.duration}ms</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Create Modals */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    Create {showCreateModal.charAt(0).toUpperCase() + showCreateModal.slice(1)}
                                </h3>
                                <button
                                    onClick={resetCreateForm}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {showCreateModal === 'user' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={createFormData.user.email}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                user: { ...prev.user, email: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={createFormData.user.username}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                user: { ...prev.user, username: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={createFormData.user.password}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                user: { ...prev.user, password: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter password"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={resetCreateForm}
                                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateUser}
                                            disabled={isCreating || !createFormData.user.email || !createFormData.user.username || !createFormData.user.password}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                                            {isCreating ? 'Creating...' : 'Create User'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showCreateModal === 'idea' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={createFormData.idea.title}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                idea: { ...prev.idea, title: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter idea title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                        <textarea
                                            value={createFormData.idea.description}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                idea: { ...prev.idea, description: e.target.value }
                                            }))}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter idea description"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                        <select
                                            value={createFormData.idea.category_id}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                idea: { ...prev.idea, category_id: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id} className="bg-gray-800">
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={resetCreateForm}
                                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateIdea}
                                            disabled={isCreating || !createFormData.idea.title || !createFormData.idea.description}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                                            {isCreating ? 'Creating...' : 'Create Idea'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showCreateModal === 'category' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={createFormData.category.name}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                category: { ...prev.category, name: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter category name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                        <textarea
                                            value={createFormData.category.description}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                category: { ...prev.category, description: e.target.value }
                                            }))}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter category description"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                                        <input
                                            type="color"
                                            value={createFormData.category.color}
                                            onChange={(e) => setCreateFormData(prev => ({
                                                ...prev,
                                                category: { ...prev.category, color: e.target.value }
                                            }))}
                                            className="w-full h-12 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={resetCreateForm}
                                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateCategory}
                                            disabled={isCreating || !createFormData.category.name}
                                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                                            {isCreating ? 'Creating...' : 'Create Category'}
                                        </button>                        </div>
                                </div>
                            )}

                            {/* Logs Tab */}
                            {activeTab === 'logs' && (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Monitor className="w-8 h-8 text-green-400" />
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">System Logs</h2>
                                            <p className="text-gray-300">Monitor application logs and system events</p>
                                        </div>
                                    </div>

                                    <LogViewer maxHeight="500px" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
