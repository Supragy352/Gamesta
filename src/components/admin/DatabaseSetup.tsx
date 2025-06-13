import { AlertTriangle, CheckCircle, Copy, Database, ExternalLink, Loader, Play, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { SchemaVerification, type TableInfo } from '../../utils/database/schemaVerification'
import { testSupabaseConnection } from '../../utils/testConnection'

export const DatabaseSetup: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; error?: string } | null>(null)
    const [tableStatus, setTableStatus] = useState<TableInfo[]>([])
    const [isChecking, setIsChecking] = useState(false)
    const [showSQL, setShowSQL] = useState(false)
    const [sqlSchema, setSqlSchema] = useState('')
    const [detailedTestResults, setDetailedTestResults] = useState<any>(null)
    const checkDatabaseStatus = async () => {
        setIsChecking(true)
        try {
            // Check connection
            const connectionResult = await SchemaVerification.checkDatabaseConnection()
            setConnectionStatus(connectionResult)

            // Check tables
            const tableResults = await SchemaVerification.checkRequiredTables()
            setTableStatus(tableResults)

            // Generate SQL schema
            const sql = await SchemaVerification.generateCreateTableSQL()
            setSqlSchema(sql)
        } catch (error) {
            console.error('Database status check failed:', error)
            setConnectionStatus({ connected: false, error: (error as Error).message })
        }
        setIsChecking(false)
    }

    const runComprehensiveTest = async () => {
        setIsChecking(true)
        try {
            const testResults = await testSupabaseConnection()
            setDetailedTestResults(testResults)

            // Also update the basic status
            if (testResults.success) {
                setConnectionStatus({ connected: true })
            } else {
                setConnectionStatus({ connected: false, error: testResults.error })
            }
        } catch (error) {
            console.error('Comprehensive test failed:', error)
            setDetailedTestResults({ success: false, error: (error as Error).message })
        }
        setIsChecking(false)
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            alert('SQL copied to clipboard!')
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
        }
    }

    const openSupabaseConsole = () => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        if (supabaseUrl) {
            const projectRef = supabaseUrl.split('//')[1].split('.')[0]
            window.open(`https://supabase.com/dashboard/project/${projectRef}/editor`, '_blank')
        }
    }

    useEffect(() => {
        checkDatabaseStatus()
    }, [])

    const missingTables = tableStatus.filter(table => !table.exists)
    const existingTables = tableStatus.filter(table => table.exists)

    return (<div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Database Setup</h2>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={runComprehensiveTest}
                    disabled={isChecking}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                >
                    {isChecking ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {isChecking ? 'Testing...' : 'Comprehensive Test'}
                </button>
                <button
                    onClick={checkDatabaseStatus}
                    disabled={isChecking}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
                >
                    {isChecking ? <Loader className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    {isChecking ? 'Checking...' : 'Refresh Status'}
                </button>
            </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Connection Status</h3>
            {connectionStatus ? (
                <div className={`flex items-center gap-2 ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                    {connectionStatus.connected ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <XCircle className="h-5 w-5" />
                    )}
                    <span>
                        {connectionStatus.connected
                            ? 'Successfully connected to Supabase'
                            : `Connection failed: ${connectionStatus.error}`
                        }
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Checking connection...</span>
                </div>
            )}      </div>

        {/* Detailed Test Results */}
        {detailedTestResults && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Comprehensive Test Results</h3>

                <div className={`flex items-center gap-2 mb-4 ${detailedTestResults.success ? 'text-green-400' : 'text-red-400'}`}>
                    {detailedTestResults.success ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                        {detailedTestResults.success ? 'All tests passed!' : `Test failed: ${detailedTestResults.error}`}
                    </span>
                </div>

                {detailedTestResults.tableResults && (
                    <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">Table Accessibility:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(detailedTestResults.tableResults).map(([tableName, exists]) => (
                                <div key={tableName} className={`flex items-center gap-2 ${exists ? 'text-green-400' : 'text-red-400'}`}>
                                    {exists ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    <span className="text-sm">{tableName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {detailedTestResults.data && (
                    <div className="mt-4">
                        <h4 className="text-white font-medium mb-2">Sample Data:</h4>
                        <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                            {JSON.stringify(detailedTestResults.data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        )}

        {/* Table Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Table Status</h3>

            {existingTables.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-green-400 font-medium mb-2">✓ Existing Tables ({existingTables.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {existingTables.map(table => (
                            <div key={table.table_name} className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">{table.table_name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {missingTables.length > 0 && (
                <div>
                    <h4 className="text-red-400 font-medium mb-2">✗ Missing Tables ({missingTables.length})</h4>
                    <div className="space-y-2">
                        {missingTables.map(table => (
                            <div key={table.table_name} className="flex items-center gap-2 text-red-400">
                                <XCircle className="h-4 w-4" />
                                <span className="text-sm">{table.table_name}</span>
                                {table.error && <span className="text-xs text-gray-400">({table.error})</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tableStatus.length === 0 && !isChecking && (
                <div className="text-gray-400 text-center py-4">
                    No table status available. Click "Refresh Status" to check.
                </div>
            )}
        </div>

        {/* Setup Instructions */}
        {missingTables.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-3">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Setup Required</h3>
                </div>
                <p className="text-gray-300 mb-4">
                    Some required tables are missing from your Supabase database. You need to create them using the SQL editor in your Supabase dashboard.
                </p>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowSQL(!showSQL)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                        <Database className="h-4 w-4" />
                        {showSQL ? 'Hide SQL' : 'Show SQL Schema'}
                    </button>

                    <button
                        onClick={openSupabaseConsole}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open Supabase Console
                    </button>
                </div>

                {showSQL && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-300">SQL Schema (Copy and paste into Supabase SQL Editor)</h4>
                            <button
                                onClick={() => copyToClipboard(sqlSchema)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            >
                                <Copy className="h-3 w-3" />
                                Copy
                            </button>
                        </div>
                        <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-gray-300 overflow-x-auto max-h-96">
                            {sqlSchema}
                        </pre>
                    </div>
                )}
            </div>
        )}

        {/* Success State */}
        {connectionStatus?.connected && missingTables.length === 0 && tableStatus.length > 0 && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Database Ready!</h3>
                </div>
                <p className="text-gray-300 mt-2">
                    All required tables are present and the database connection is working properly.
                </p>
            </div>
        )}
    </div>
    )
}

export default DatabaseSetup
