import React from 'react'
import { supabase } from '../../lib/supabaseClient'

const LoginDebugPage: React.FC = () => {
    const TEST_EMAIL = 'mishra03supragya@gmail.com'
    const TEST_PASSWORD = '123456789'

    const [results, setResults] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)

    const addResult = (message: string) => {
        console.log(message)
        setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    const testCheckUserExists = async () => {
        setLoading(true)
        addResult('🔍 Testing checkUserExists logic...')

        try {
            const { data, error: dbError } = await supabase
                .from('users')
                .select('email, username, id')
                .eq('email', TEST_EMAIL)
                .single()

            if (dbError) {
                if (dbError.code === 'PGRST116') {
                    addResult('❌ User not found in database (PGRST116)')
                    setLoading(false)
                    return false
                } else {
                    addResult(`❌ Database error: ${dbError.code} - ${dbError.message}`)
                    setLoading(false)
                    return false
                }
            }

            if (data) {
                addResult(`✅ User found: ${data.username} (${data.email})`)
                setLoading(false)
                return true
            }

            addResult('❌ No data returned but no error')
            setLoading(false)
            return false
        } catch (error) {
            addResult(`❌ Exception: ${error}`)
            setLoading(false)
            return false
        }
    }

    const testSignIn = async () => {
        setLoading(true)
        addResult('🔐 Testing direct sign in...')

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
            })

            if (error) {
                addResult(`❌ Sign in error: ${error.message}`)
                setLoading(false)
                return false
            }

            if (data.user) {
                addResult(`✅ Sign in successful! User ID: ${data.user.id}`)
                setLoading(false)
                return true
            }

            addResult('❌ Sign in returned no user')
            setLoading(false)
            return false
        } catch (error) {
            addResult(`❌ Sign in exception: ${error}`)
            setLoading(false)
            return false
        }
    }

    const inspectDatabase = async () => {
        setLoading(true)
        addResult('🔍 Inspecting database users...')

        try {
            const { data: allUsers, error } = await supabase
                .from('users')
                .select('id, email, username, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) {
                addResult(`❌ Database error: ${error.message}`)
                setLoading(false)
                return
            }

            addResult(`📊 Found ${allUsers?.length || 0} users in database:`)
            allUsers?.forEach((user, index) => {
                const isTestUser = user.email === TEST_EMAIL ? ' 👈 TEST USER' : ''
                addResult(`   ${index + 1}. ${user.email} (${user.username})${isTestUser}`)
            })
            setLoading(false)
        } catch (error) {
            addResult(`❌ Exception: ${error}`)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white mb-4">🐛 Login Debug Console</h1>
                    <p className="text-purple-200 mb-4">
                        Testing login flow for: <span className="font-mono text-yellow-300">{TEST_EMAIL}</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <button
                            onClick={testCheckUserExists}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            🔍 Check User
                        </button>

                        <button
                            onClick={testSignIn}
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            🔐 Test Login
                        </button>

                        <button
                            onClick={inspectDatabase}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            🔍 Inspect DB
                        </button>

                        <button
                            onClick={() => {
                                setResults([])
                                console.clear()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </div>

                <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">📊 Debug Results</h2>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                        {results.length === 0 ? (
                            <p className="text-gray-400">No results yet. Click a test button above.</p>
                        ) : (
                            results.map((result, index) => (
                                <div key={index} className="text-green-400 mb-1 whitespace-pre-wrap">
                                    {result}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a
                        href="/login"
                        className="text-purple-300 hover:text-purple-100 underline"
                    >
                        ← Back to Login
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LoginDebugPage
