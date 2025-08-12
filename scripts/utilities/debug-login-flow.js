/**
 * Debug Login Flow Test Script
 * Tests the login process step by step to identify where it's failing
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration (you'll need to update these)
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const TEST_CREDENTIALS = {
    email: 'mishra03supragya@gmail.com',
    password: '123456789'
}

async function debugLoginFlow() {
    console.log('🔍 Starting login flow debug...')
    console.log(`📧 Testing with email: ${TEST_CREDENTIALS.email}`)

    try {
        // Step 1: Check if user exists in auth.users
        console.log('\n📋 Step 1: Checking Supabase auth.users table...')
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) {
            console.error('❌ Error accessing auth.users:', authError.message)
        } else {
            const userExists = authUsers.users.find(user => user.email === TEST_CREDENTIALS.email)
            console.log(`✅ User in auth.users:`, userExists ? 'FOUND' : 'NOT FOUND')
            if (userExists) {
                console.log(`   📧 Email confirmed: ${userExists.email_confirmed_at ? 'YES' : 'NO'}`)
                console.log(`   🆔 User ID: ${userExists.id}`)
            }
        }

        // Step 2: Check if user exists in public.users table
        console.log('\n📋 Step 2: Checking public.users table...')
        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('*')
            .eq('email', TEST_CREDENTIALS.email)

        if (publicError) {
            console.error('❌ Error accessing public.users:', publicError.message)
            console.error('   Code:', publicError.code)
            console.error('   Details:', publicError.details)
        } else {
            console.log(`✅ User in public.users:`, publicUsers?.length > 0 ? 'FOUND' : 'NOT FOUND')
            if (publicUsers?.length > 0) {
                const user = publicUsers[0]
                console.log(`   👤 Username: ${user.username}`)
                console.log(`   🆔 User ID: ${user.id}`)
                console.log(`   📅 Created: ${user.created_at}`)
            }
        }

        // Step 3: Test authentication
        console.log('\n📋 Step 3: Testing authentication...')
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: TEST_CREDENTIALS.email,
            password: TEST_CREDENTIALS.password
        })

        if (signInError) {
            console.error('❌ Sign in failed:', signInError.message)
            console.error('   Code:', signInError.code)
            console.error('   Status:', signInError.status)
        } else {
            console.log('✅ Sign in successful!')
            console.log(`   🆔 User ID: ${authData.user?.id}`)
            console.log(`   📧 Email: ${authData.user?.email}`)
            console.log(`   ✅ Email confirmed: ${authData.user?.email_confirmed_at ? 'YES' : 'NO'}`)

            // Step 4: Test getting current user after sign in
            console.log('\n📋 Step 4: Testing getCurrentUser after sign in...')
            const { data: { user }, error: getUserError } = await supabase.auth.getUser()

            if (getUserError) {
                console.error('❌ Get user failed:', getUserError.message)
            } else {
                console.log('✅ Get user successful!')
                console.log(`   🆔 User ID: ${user?.id}`)

                if (user) {
                    // Try to get profile
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (profileError) {
                        console.error('❌ Get profile failed:', profileError.message)
                        console.error('   Code:', profileError.code)
                    } else {
                        console.log('✅ Profile retrieved successfully!')
                        console.log(`   👤 Username: ${profile.username}`)
                    }
                }
            }

            // Clean up - sign out
            await supabase.auth.signOut()
            console.log('\n🔄 Signed out for cleanup')
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error.message)
        console.error(error.stack)
    }

    console.log('\n🏁 Debug complete!')
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
    debugLoginFlow().catch(console.error)
} else {
    // Export for browser use
    window.debugLoginFlow = debugLoginFlow
}
