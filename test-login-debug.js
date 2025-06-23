/**
 * Login Debug Test - Direct Test of AuthContext Logic
 * This script tests the exact same flow as the AuthContext
 */

// First, let's create a simple test that uses the browser console
console.log('🔍 Login Debug Test Starting...')

const TEST_EMAIL = 'mishra03supragya@gmail.com'

// Test the checkUserExists function logic
async function testCheckUserExists() {
    console.log('📋 Testing checkUserExists logic...')

    try {
        // Import the supabase client (assuming we're in browser context)
        const { supabase } = await import('./src/lib/supabaseClient.js')

        console.log('✅ Supabase client loaded')

        // Check if user exists in our users table (same as AuthContext)
        const { data, error: dbError } = await supabase
            .from('users')
            .select('email')
            .eq('email', TEST_EMAIL)
            .single()

        console.log('📊 Database query result:')
        console.log('   Data:', data)
        console.log('   Error:', dbError)

        if (dbError) {
            console.log('   Error code:', dbError.code)
            console.log('   Error message:', dbError.message)

            if (dbError.code === 'PGRST116') {
                console.log('❌ User NOT FOUND in database (PGRST116 = no rows)')
                return { exists: false }
            } else {
                console.log('❌ Database error checking user existence')
                return { exists: false, error: 'Failed to check user existence' }
            }
        }

        if (data) {
            console.log('✅ User FOUND in database')
            return { exists: true }
        }

        console.log('❓ Unexpected result - no data, no error')
        return { exists: false }

    } catch (error) {
        console.error('💥 Error in testCheckUserExists:', error)
        return { exists: false, error: error.message }
    }
}

// Test the actual sign in
async function testSignIn() {
    console.log('📋 Testing sign in...')

    try {
        const { supabase } = await import('./src/lib/supabaseClient.js')

        const { data, error } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: '123456789'
        })

        console.log('📊 Sign in result:')
        console.log('   Data:', data)
        console.log('   Error:', error)

        if (error) {
            console.error('❌ Sign in failed:', error.message)
            return { success: false, error: error.message }
        }

        if (data.user) {
            console.log('✅ Sign in successful!')
            console.log('   User ID:', data.user.id)
            console.log('   Email confirmed:', data.user.email_confirmed_at ? 'YES' : 'NO')

            // Test getting current user profile
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single()

            console.log('📊 Profile query result:')
            console.log('   Profile data:', profile)
            console.log('   Profile error:', profileError)

            // Clean up
            await supabase.auth.signOut()
            console.log('🔄 Signed out')

            return { success: true }
        }

        return { success: false, error: 'No user data returned' }

    } catch (error) {
        console.error('💥 Error in testSignIn:', error)
        return { success: false, error: error.message }
    }
}

// Run the full test
async function runFullTest() {
    console.log('🚀 Starting full login debug test...')

    // Test 1: Check if user exists
    const userExistsResult = await testCheckUserExists()
    console.log('🎯 User exists result:', userExistsResult)

    // Test 2: Try to sign in
    const signInResult = await testSignIn()
    console.log('🎯 Sign in result:', signInResult)

    console.log('🏁 Full test complete!')

    // Summary
    console.log('\n📋 SUMMARY:')
    console.log(`   User exists in DB: ${userExistsResult.exists ? 'YES' : 'NO'}`)
    console.log(`   Sign in successful: ${signInResult.success ? 'YES' : 'NO'}`)

    if (!userExistsResult.exists) {
        console.log('\n💡 ISSUE IDENTIFIED:')
        console.log('   The user does not exist in the public.users table!')
        console.log('   This is why the login says "account not found"')
        console.log('   The user might exist in auth.users but not in public.users')
    }
}

// Export for browser console use
if (typeof window !== 'undefined') {
    window.testCheckUserExists = testCheckUserExists
    window.testSignIn = testSignIn
    window.runFullTest = runFullTest

    console.log('🎮 Test functions loaded! Run: runFullTest()')
} else {
    // Run directly if in Node.js
    runFullTest().catch(console.error)
}

export { runFullTest, testCheckUserExists, testSignIn }

