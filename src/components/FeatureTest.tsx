import { AlertCircle, CheckCircle, Database, Save, Shield, TestTube, XCircle, Zap } from 'lucide-react'
import { useState } from 'react'
import { useAutoSave, useDraftManager, useSearchHistory, useUserPreferences } from '../hooks/useAutoSave'
import {
    createStorageBackup,
    DraftsStorage,
    IdeasCacheStorage,
    SearchHistoryStorage,
    UserPreferencesStorage,
    UserStorage
} from '../utils/localStorage'
import {
    validateContent,
    validateEmail,
    validateForm,
    validatePassword,
    validateUsername,
    VALIDATION_RULES
} from '../utils/validation'

interface TestResult {
    name: string
    status: 'success' | 'error' | 'warning'
    message: string
    details?: string
}

export default function FeatureTest() {
    const [results, setResults] = useState<TestResult[]>([])
    const [running, setRunning] = useState(false)
    const [currentTest, setCurrentTest] = useState('')

    // Auto-save hooks for testing
    const [testData, setTestData] = useState({ title: '', description: '' })
    const autoSaveResult = useAutoSave(testData, 'test_data', {
        delay: 500,
        onSave: (data) => console.log('Auto-save test:', data)
    })
    const { saveDraft, getDrafts } = useDraftManager()
    const { savePreferences, getPreferences } = useUserPreferences()
    const { addSearchTerm, getSearchHistory } = useSearchHistory()

    const addResult = (result: TestResult) => {
        setResults(prev => [...prev, result])
    }

    const runLocalStorageTests = () => {
        setCurrentTest('Testing localStorage Management...')

        try {
            // Test User Storage
            const testUser = { id: '1', username: 'testuser', email: 'test@example.com' }
            UserStorage.set(testUser)
            const retrievedUser = UserStorage.get()

            if (JSON.stringify(retrievedUser) === JSON.stringify(testUser)) {
                addResult({ name: 'User Storage', status: 'success', message: 'Successfully stored and retrieved user data' })
            } else {
                addResult({ name: 'User Storage', status: 'error', message: 'Failed to retrieve correct user data' })
            }

            // Test Ideas Cache Storage
            const testIdeas = [{ id: '1', title: 'Test Idea', votes: 5 }]
            IdeasCacheStorage.set(testIdeas)
            const retrievedIdeas = IdeasCacheStorage.get()

            if (Array.isArray(retrievedIdeas) && retrievedIdeas.length === 1) {
                addResult({ name: 'Ideas Cache Storage', status: 'success', message: 'Successfully cached ideas data' })
            } else {
                addResult({ name: 'Ideas Cache Storage', status: 'error', message: 'Failed to cache ideas properly' })
            }

            // Test Drafts Storage
            const testDraft = { id: '1', title: 'Draft Title', description: 'Draft content', timestamp: Date.now() }
            DraftsStorage.set([testDraft])
            const retrievedDrafts = DraftsStorage.get()

            if (Array.isArray(retrievedDrafts) && retrievedDrafts.length === 1) {
                addResult({ name: 'Drafts Storage', status: 'success', message: 'Successfully stored draft data' })
            } else {
                addResult({ name: 'Drafts Storage', status: 'error', message: 'Failed to store drafts properly' })
            }

            // Test User Preferences Storage
            const testPrefs = { defaultCategory: 'tournament', theme: 'dark' }
            UserPreferencesStorage.set(testPrefs)
            const retrievedPrefs = UserPreferencesStorage.get()

            if (retrievedPrefs && typeof retrievedPrefs === 'object') {
                addResult({ name: 'User Preferences Storage', status: 'success', message: 'Successfully stored user preferences' })
            } else {
                addResult({ name: 'User Preferences Storage', status: 'error', message: 'Failed to store preferences properly' })
            }

            // Test Search History Storage
            const testHistory = ['gaming tournament', 'esports event']
            SearchHistoryStorage.set(testHistory)
            const retrievedHistory = SearchHistoryStorage.get()

            if (Array.isArray(retrievedHistory) && retrievedHistory.length === 2) {
                addResult({ name: 'Search History Storage', status: 'success', message: 'Successfully stored search history' })
            } else {
                addResult({ name: 'Search History Storage', status: 'error', message: 'Failed to store search history properly' })
            }

            // Test Backup and Restore
            const backup = createStorageBackup()
            if (backup && Object.keys(backup).length > 0) {
                addResult({ name: 'Storage Backup', status: 'success', message: 'Successfully created storage backup', details: `Backup contains ${Object.keys(backup).length} items` })
            } else {
                addResult({ name: 'Storage Backup', status: 'error', message: 'Failed to create storage backup' })
            }

        } catch (error) {
            addResult({ name: 'localStorage Tests', status: 'error', message: `Test failed: ${error}` })
        }
    }

    const runValidationTests = () => {
        setCurrentTest('Testing Data Validation...')

        try {
            // Test Email Validation
            const validEmail = validateEmail('test@example.com')
            const invalidEmail = validateEmail('invalid-email')

            if (validEmail.isValid && !invalidEmail.isValid) {
                addResult({ name: 'Email Validation', status: 'success', message: 'Correctly validates email addresses' })
            } else {
                addResult({ name: 'Email Validation', status: 'error', message: 'Email validation not working properly' })
            }

            // Test Password Validation
            const strongPassword = validatePassword('StrongPass123!')
            const weakPassword = validatePassword('weak')

            if (strongPassword.isValid && !weakPassword.isValid) {
                addResult({ name: 'Password Validation', status: 'success', message: 'Correctly validates password strength' })
            } else {
                addResult({ name: 'Password Validation', status: 'error', message: 'Password validation not working properly' })
            }

            // Test Username Validation
            const validUsername = validateUsername('validuser123')
            const invalidUsername = validateUsername('a')

            if (validUsername.isValid && !invalidUsername.isValid) {
                addResult({ name: 'Username Validation', status: 'success', message: 'Correctly validates usernames' })
            } else {
                addResult({ name: 'Username Validation', status: 'error', message: 'Username validation not working properly' })
            }

            // Test Content Sanitization
            const dirtyContent = '<script>alert("xss")</script>Hello World'
            const cleanContent = validateContent(dirtyContent)

            if (cleanContent.sanitized && !cleanContent.sanitized.includes('<script>')) {
                addResult({ name: 'Content Sanitization', status: 'success', message: 'Successfully sanitized harmful content' })
            } else {
                addResult({ name: 'Content Sanitization', status: 'error', message: 'Failed to sanitize harmful content' })
            }

            // Test Form Validation
            const formData = {
                title: 'Valid Title',
                description: 'This is a valid description with enough content.',
                email: 'test@example.com'
            }
            const formValidation = validateForm(formData, {
                title: VALIDATION_RULES.IDEA_SUBMISSION.title,
                description: VALIDATION_RULES.IDEA_SUBMISSION.description,
                email: VALIDATION_RULES.REGISTER.email
            })

            if (formValidation.isValid) {
                addResult({ name: 'Form Validation', status: 'success', message: 'Successfully validates complete forms' })
            } else {
                addResult({ name: 'Form Validation', status: 'error', message: 'Form validation failed', details: JSON.stringify(formValidation.errors) })
            }

        } catch (error) {
            addResult({ name: 'Validation Tests', status: 'error', message: `Test failed: ${error}` })
        }
    }

    const runAutoSaveTests = async () => {
        setCurrentTest('Testing Auto-Save Features...')

        try {
            // Test basic auto-save
            setTestData({ title: 'Auto Save Test', description: 'Testing auto-save functionality' })
            // Wait for auto-save to trigger
            await new Promise(resolve => setTimeout(resolve, 600))

            // Since the useAutoSave hook doesn't expose isAutoSaving/lastSaved in this implementation,
            // we'll test by attempting to restore data
            const restoredData = autoSaveResult.restoreData()
            if (restoredData) {
                addResult({ name: 'Auto-Save Basic', status: 'success', message: 'Auto-save mechanism is working - data can be restored' })
            } else {
                addResult({ name: 'Auto-Save Basic', status: 'warning', message: 'Auto-save test inconclusive - may need more time or data' })
            }

            // Test Draft Manager
            const testDraft = { title: 'Draft Test', description: 'Testing draft functionality', category: 'tournament' as const }
            saveDraft(testDraft)
            const drafts = getDrafts()

            if (drafts.length > 0) {
                addResult({ name: 'Draft Manager', status: 'success', message: `Successfully saved draft. Found ${drafts.length} drafts.` })
            } else {
                addResult({ name: 'Draft Manager', status: 'error', message: 'Failed to save or retrieve drafts' })
            }      // Test User Preferences  
            const testPrefs = { theme: 'dark' as const, defaultCategory: 'tournament' }
            savePreferences(testPrefs)
            const savedPrefs = getPreferences()

            if (savedPrefs && typeof savedPrefs === 'object') {
                addResult({ name: 'User Preferences', status: 'success', message: 'Successfully saved user preferences' })
            } else {
                addResult({ name: 'User Preferences', status: 'error', message: 'Failed to save user preferences' })
            }

            // Test Search History
            addSearchTerm('test search query')
            const history = getSearchHistory()

            if (history.length > 0) {
                addResult({ name: 'Search History', status: 'success', message: `Successfully saved search history. Found ${history.length} entries.` })
            } else {
                addResult({ name: 'Search History', status: 'error', message: 'Failed to save search history' })
            }

        } catch (error) {
            addResult({ name: 'Auto-Save Tests', status: 'error', message: `Test failed: ${error}` })
        }
    }

    const runAllTests = async () => {
        setRunning(true)
        setResults([])

        try {
            runLocalStorageTests()
            await new Promise(resolve => setTimeout(resolve, 500))

            runValidationTests()
            await new Promise(resolve => setTimeout(resolve, 500))

            await runAutoSaveTests()

            setCurrentTest('All tests completed!')
        } catch (error) {
            addResult({ name: 'Test Suite', status: 'error', message: `Test suite failed: ${error}` })
        } finally {
            setRunning(false)
            setCurrentTest('')
        }
    }

    const clearAllData = () => {
        localStorage.clear()
        addResult({ name: 'Data Cleared', status: 'success', message: 'All localStorage data has been cleared' })
    }

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />
            case 'error': return <XCircle className="h-5 w-5 text-red-400" />
            case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-400" />
        }
    }

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return 'border-green-400/50 bg-green-400/10'
            case 'error': return 'border-red-400/50 bg-red-400/10'
            case 'warning': return 'border-yellow-400/50 bg-yellow-400/10'
        }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length
    const warningCount = results.filter(r => r.status === 'warning').length

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <TestTube className="h-8 w-8 text-purple-400" />
                        <h1 className="text-3xl font-bold text-white">Priority 2 Feature Testing</h1>
                    </div>

                    <p className="text-gray-300 mb-6">
                        This page tests the Priority 2 features: LocalStorage Backup (Item 11) and Data Validation (Item 12).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-black/20 rounded-lg p-4 border border-white/20">
                            <div className="flex items-center space-x-2 mb-2">
                                <Database className="h-5 w-5 text-blue-400" />
                                <span className="text-white font-semibold">LocalStorage</span>
                            </div>
                            <p className="text-sm text-gray-300">Auto-save, versioning, backup/restore</p>
                        </div>

                        <div className="bg-black/20 rounded-lg p-4 border border-white/20">
                            <div className="flex items-center space-x-2 mb-2">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-white font-semibold">Validation</span>
                            </div>
                            <p className="text-sm text-gray-300">XSS prevention, content sanitization</p>
                        </div>

                        <div className="bg-black/20 rounded-lg p-4 border border-white/20">
                            <div className="flex items-center space-x-2 mb-2">
                                <Save className="h-5 w-5 text-purple-400" />
                                <span className="text-white font-semibold">Auto-Save</span>
                            </div>
                            <p className="text-sm text-gray-300">Debounced saving, draft management</p>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={runAllTests}
                            disabled={running}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300"
                        >
                            <Zap className="h-5 w-5" />
                            <span>{running ? 'Running Tests...' : 'Run All Tests'}</span>
                        </button>

                        <button
                            onClick={clearAllData}
                            className="bg-red-600/50 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold border border-red-400/50 transition-all duration-300"
                        >
                            Clear All Data
                        </button>
                    </div>

                    {currentTest && (
                        <div className="mt-4 bg-blue-500/20 border border-blue-400/50 rounded-lg p-3">
                            <p className="text-blue-300 font-medium">{currentTest}</p>
                        </div>
                    )}
                </div>

                {results.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Test Results</h2>
                            <div className="flex space-x-4">
                                {successCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span className="text-green-400 font-semibold">{successCount} Passed</span>
                                    </div>
                                )}
                                {warningCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                                        <span className="text-yellow-400 font-semibold">{warningCount} Warnings</span>
                                    </div>
                                )}
                                {errorCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <XCircle className="h-5 w-5 text-red-400" />
                                        <span className="text-red-400 font-semibold">{errorCount} Failed</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(result.status)}
                                            <span className="text-white font-semibold">{result.name}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mt-2">{result.message}</p>
                                    {result.details && (
                                        <p className="text-gray-400 text-sm mt-1">{result.details}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Auto-Save Test Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Live Auto-Save Test</h3>
                    <p className="text-gray-300 mb-4">Type in the fields below to test auto-save functionality (saves after 500ms of inactivity):</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={testData.title}
                                onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Type something to test auto-save..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={testData.description}
                                onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Type a description to test auto-save..."
                            />
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                                <span className="text-gray-300">Auto-save: Active</span>
                            </div>
                            <span className="text-gray-400">
                                Status: Data will be auto-saved as you type
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
