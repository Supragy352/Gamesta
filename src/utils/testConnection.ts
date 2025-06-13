import { supabase } from '../lib/supabaseClient'

export async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...')

    try {
        // Test 1: Check if Supabase client is configured
        console.log('📋 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
        console.log('🔑 Supabase Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')

        // Test 2: Test basic connection
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Database query failed:', error)
            return {
                success: false,
                error: error.message,
                details: error
            }
        }

        console.log('✅ Database query successful')
        console.log('📊 Sample data:', data)

        // Test 3: Check available tables by trying common queries
        const tableTests = [
            { name: 'users', query: () => supabase.from('users').select('count').limit(1) },
            { name: 'ideas', query: () => supabase.from('ideas').select('count').limit(1) },
            { name: 'categories', query: () => supabase.from('categories').select('count').limit(1) },
            { name: 'votes', query: () => supabase.from('votes').select('count').limit(1) }
        ]

        const tableResults: { [key: string]: boolean } = {}

        for (const test of tableTests) {
            try {
                await test.query()
                tableResults[test.name] = true
                console.log(`✅ Table ${test.name} exists`)
            } catch (error) {
                tableResults[test.name] = false
                console.log(`❌ Table ${test.name} missing or inaccessible:`, error)
            }
        }

        return {
            success: true,
            data,
            tableResults,
            message: 'Connection successful'
        }

    } catch (error) {
        console.error('💥 Connection test failed:', error)
        return {
            success: false,
            error: (error as Error).message,
            details: error
        }
    }
}

// Auto-run the test when imported in development
if (import.meta.env.DEV) {
    console.log('🚀 Auto-running Supabase connection test...')
    testSupabaseConnection()
}
