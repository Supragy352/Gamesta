// Simple database connection test utility
import { supabase } from '../lib/supabaseClient'

export async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...')

        // Test 1: Check if supabase client is initialized
        if (!supabase) {
            throw new Error('Supabase client not initialized')
        }
        console.log('✅ Supabase client initialized')

        // Test 2: Test simple query
        const { data, error } = await supabase
            .from('categories')
            .select('count(*)')
            .limit(1)

        if (error) {
            console.error('❌ Database query failed:', error.message)
            throw error
        }

        console.log('✅ Database connection successful', data)

        // Test 3: Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        console.log('📋 Environment check:')
        console.log('- Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
        console.log('- Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing')

        return { success: true, message: 'Database connection successful' }

    } catch (error) {
        console.error('❌ Database connection test failed:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error
        }
    }
}

// Auto-run test on import for debugging
testDatabaseConnection()
