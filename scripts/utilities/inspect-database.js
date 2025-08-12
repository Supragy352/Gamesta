/**
 * Database State Inspector
 * Checks the current state of users in both auth.users and public.users
 */

import { supabase } from './src/lib/supabaseClient.js'

const TEST_EMAIL = 'mishra03supragya@gmail.com'

async function inspectDatabaseState() {
    console.log('🔍 Inspecting database state...')
    console.log(`📧 Looking for user: ${TEST_EMAIL}`)

    try {
        // Check public.users table
        console.log('\n📋 Checking public.users table...')
        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('*')
            .eq('email', TEST_EMAIL)

        console.log('📊 Public users query:')
        console.log('   Data:', publicUsers)
        console.log('   Error:', publicError)
        console.log('   Count:', publicUsers?.length || 0)

        if (publicError) {
            console.error('❌ Error querying public.users:', publicError.message)
            console.error('   Code:', publicError.code)
            console.error('   Details:', publicError.details)
        }

        // Check if we can list all users (for debugging)
        console.log('\n📋 Getting all public users (first 10)...')
        const { data: allUsers, error: allUsersError } = await supabase
            .from('users')
            .select('id, email, username, created_at')
            .limit(10)

        if (allUsersError) {
            console.error('❌ Error listing users:', allUsersError.message)
        } else {
            console.log('📊 All users in database:')
            allUsers?.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email} (${user.username}) - ${user.created_at}`)
            })
        }

        // Try to get current auth session
        console.log('\n📋 Checking current auth session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
            console.error('❌ Session error:', sessionError.message)
        } else if (session) {
            console.log('✅ Active session found:')
            console.log('   User ID:', session.user.id)
            console.log('   Email:', session.user.email)
            console.log('   Email confirmed:', session.user.email_confirmed_at ? 'YES' : 'NO')
        } else {
            console.log('ℹ️ No active session')
        }

        // Test a simple sign in attempt
        console.log('\n📋 Testing sign in...')
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: '123456789'
        })

        if (authError) {
            console.error('❌ Auth error:', authError.message)
            console.error('   Code:', authError.code)
            console.error('   Status:', authError.status)
        } else {
            console.log('✅ Authentication successful!')
            console.log('   User ID:', authData.user?.id)
            console.log('   Email:', authData.user?.email)
            console.log('   Email confirmed:', authData.user?.email_confirmed_at ? 'YES' : 'NO')

            // Now try to get the profile
            if (authData.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single()

                if (profileError) {
                    console.error('❌ Profile lookup failed:', profileError.message)
                    console.error('   Code:', profileError.code)
                    console.log('🔧 This suggests the user exists in auth but not in public.users!')
                } else {
                    console.log('✅ Profile found:', profile)
                }
            }

            // Sign out for cleanup
            await supabase.auth.signOut()
            console.log('🔄 Signed out for cleanup')
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error)
    }

    console.log('\n🏁 Database inspection complete!')
}

// Make available globally for browser console
if (typeof window !== 'undefined') {
    window.inspectDatabaseState = inspectDatabaseState
    console.log('🎮 Inspector loaded! Run: inspectDatabaseState()')
}

export { inspectDatabaseState }

