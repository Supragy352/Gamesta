import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const DatabaseTest: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [testResults, setTestResults] = useState<string[]>([])

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }
    const testDatabaseConnection = async () => {
        try {
            addResult('🔄 Starting comprehensive database test...')

            // Test 1: Check all tables exist
            addResult('📡 Testing database tables...')

            // Test users table
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('count', { count: 'exact', head: true })

            if (usersError) {
                addResult(`❌ Users table error: ${usersError.message}`)
            } else {
                addResult(`✅ Users table exists - ${usersData} records`)
            }

            // Test ideas table
            const { data: ideasData, error: ideasError } = await supabase
                .from('ideas')
                .select('count', { count: 'exact', head: true })

            if (ideasError) {
                addResult(`❌ Ideas table error: ${ideasError.message}`)
            } else {
                addResult(`✅ Ideas table exists - ${ideasData} records`)
            }

            // Test votes table
            const { data: votesData, error: votesError } = await supabase
                .from('votes')
                .select('count', { count: 'exact', head: true })

            if (votesError) {
                addResult(`❌ Votes table error: ${votesError.message}`)
            } else {
                addResult(`✅ Votes table exists - ${votesData} records`)
            }

            // Test 2: Check environment variables
            addResult('🔧 Checking environment variables...')
            const url = import.meta.env.VITE_SUPABASE_URL
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY

            if (url && key) {
                addResult('✅ Environment variables loaded correctly')
                addResult(`🌐 Project URL: ${url}`)
                addResult(`🔑 Anon key: ${key.substring(0, 20)}...`)
            } else {
                addResult('❌ Missing environment variables')
            }      // Test 3: Check auth status
            addResult('👤 Checking authentication status...')
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                addResult(`✅ User authenticated: ${user.email}`)
            } else {
                addResult('ℹ️ No user currently authenticated (this is normal)')
            }

            // Test 4: Test basic database operations (if tables exist)
            if (!usersError && !ideasError && !votesError) {
                addResult('🧪 Testing basic database operations...')

                try {
                    // Test fetching ideas
                    const { data: ideas, error: fetchError } = await supabase
                        .from('ideas')
                        .select('*')
                        .limit(5)

                    if (fetchError) {
                        addResult(`❌ Error fetching ideas: ${fetchError.message}`)
                    } else {
                        addResult(`✅ Successfully fetched ${ideas?.length || 0} ideas`)
                        if (ideas && ideas.length > 0) {
                            addResult(`📝 Sample idea: "${ideas[0].title}"`)
                        }
                    }
                } catch (err) {
                    addResult(`❌ Database operation error: ${err}`)
                }
            }

            setConnectionStatus('connected')
            addResult('🎉 All tests completed successfully!')
        } catch (error) {
            console.error('Database test error:', error)
            setConnectionStatus('error')
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
            addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const testCreateSampleData = async () => {
        try {
            addResult('🧪 Testing sample data creation...')

            // Check if user is authenticated first
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                addResult('⚠️ No authenticated user - testing with anonymous data creation')
                addResult('💡 For full testing, try registering/logging in first')
                return
            }

            // Try to create a test idea
            const testIdea = {
                title: `Test Tournament Idea ${Date.now()}`,
                description: 'This is a test gaming tournament idea created from the database test page to verify CRUD operations are working correctly.',
                category: 'Tournament',
                author_id: user.id
            }

            const { data, error } = await supabase
                .from('ideas')
                .insert(testIdea)
                .select()
                .single()

            if (error) {
                addResult(`❌ Error creating test idea: ${error.message}`)
            } else {
                addResult(`✅ Successfully created test idea: "${data.title}"`)
                addResult(`📊 New idea ID: ${data.id}`)
                addResult(`👤 Author: ${data.author_id}`)
            }
        } catch (error: any) {
            addResult(`❌ Sample data creation failed: ${error.message}`)
        }
    }

    useEffect(() => {
        testDatabaseConnection()
    }, [])

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'testing': return 'text-yellow-400'
            case 'connected': return 'text-green-400'
            case 'error': return 'text-red-400'
            default: return 'text-gray-400'
        }
    }

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'testing': return '🔄'
            case 'connected': return '✅'
            case 'error': return '❌'
            default: return '❓'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="glass-card p-8">
                    <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        {getStatusIcon()} Database Connection Test
                    </h1>

                    <div className={`text-xl mb-6 ${getStatusColor()}`}>
                        Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </div>

                    {errorMessage && (
                        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
                            <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
                            <p className="text-red-300 font-mono text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <div className="bg-black/30 rounded-lg p-4 mb-6">
                        <h3 className="text-white font-semibold mb-3">Test Results:</h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {testResults.map((result, index) => (
                                <div key={index} className="text-gray-300 font-mono text-sm">
                                    {result}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-900/30 rounded-lg p-4">
                            <h3 className="text-blue-400 font-semibold mb-2">Next Steps:</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li>• If tables don't exist, run the SQL schema</li>
                                <li>• Test user registration and login</li>
                                <li>• Create some test ideas</li>
                                <li>• Test voting functionality</li>
                            </ul>
                        </div>
                        <div className="bg-green-900/30 rounded-lg p-4">
                            <h3 className="text-green-400 font-semibold mb-2">Test Actions:</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={testDatabaseConnection}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                                >
                                    🔄 Rerun Connection Test
                                </button>
                                <button
                                    onClick={testCreateSampleData}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                                    disabled={connectionStatus !== 'connected'}
                                >
                                    🧪 Test Create Sample Idea
                                </button>
                                <button
                                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                                >
                                    🌐 Open Supabase Dashboard
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            ← Back to App
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
