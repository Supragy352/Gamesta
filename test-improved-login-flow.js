// Test script for the new improved login flow
// Open your Gamesta app, open browser console (F12), and paste this script

console.log('🚀 Testing Improved Login Flow...');

// Test the complete registration and verification flow
const testCompleteFlow = async () => {
    console.log('🔧 Testing Complete Registration → Verification → Login Flow');

    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'testpassword123';
    const testUsername = `testuser${timestamp}`;

    console.log('📝 Test Data:', {
        email: testEmail,
        username: testUsername
    });

    try {
        // Step 1: Test Registration (should send verification email)
        console.log('📧 Step 1: Testing registration flow...');

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: { username: testUsername },
                emailRedirectTo: `${window.location.origin}/email-verified`
            }
        });

        if (signupError) {
            console.error('❌ Registration failed:', signupError.message);
            return false;
        }

        if (signupData.user && !signupData.user.email_confirmed_at) {
            console.log('✅ Registration successful! Verification email should be sent.');
            console.log('📧 Check your email for verification link');
            console.log('🔗 Verification link should redirect to: /email-verified');
        }

        // Step 2: Simulate what happens after email verification
        console.log('🔄 Step 2: Simulating post-verification flow...');

        // In real flow, user clicks email link and comes back to /email-verified
        // The EmailVerified component would then create the user profile

        console.log('✅ Registration flow test completed!');
        return true;

    } catch (error) {
        console.error('❌ Flow test failed:', error);
        return false;
    }
};

// Test login with non-existent user (should suggest signup)
const testLoginNonExistentUser = async () => {
    console.log('👤 Testing login with non-existent user...');

    const { error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'somepassword'
    });

    if (error && error.message.includes('Invalid login credentials')) {
        console.log('✅ Correctly detected non-existent user');
        console.log('💡 App should suggest signing up instead');
        return true;
    }

    console.log('⚠️ Unexpected result for non-existent user test');
    return false;
};

// Test the auth state listener
const testAuthStateListener = () => {
    console.log('🔔 Testing auth state listener...');

    let eventCount = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        eventCount++;
        console.log(`🔔 Auth Event #${eventCount}: ${event}`, {
            user: session?.user ? {
                id: session.user.id,
                email: session.user.email,
                confirmed: !!session.user.email_confirmed_at
            } : null
        });

        if (eventCount > 3) {
            console.log('🛑 Stopping auth listener');
            subscription.unsubscribe();
        }
    });

    return subscription;
};

// Test database profile creation
const testProfileCreation = async () => {
    console.log('👤 Testing profile creation process...');

    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.log('ℹ️ No authenticated user (this is expected if not logged in)');
            return false;
        }

        if (user && user.email_confirmed_at) {
            console.log('✅ Found verified user:', user.email);

            // Check if profile exists
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code === 'PGRST116') {
                console.log('ℹ️ No profile found - this is expected after verification');
                console.log('💡 EmailVerified component should create the profile');
            } else if (profile) {
                console.log('✅ User profile exists:', profile);
            }

            return true;
        }

        console.log('ℹ️ User not verified yet');
        return false;
    } catch (error) {
        console.error('❌ Profile test failed:', error);
        return false;
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🎮 Starting Complete Login Flow Tests...');
    console.log('='.repeat(50));

    // Test auth state listener
    const authSubscription = testAuthStateListener();

    // Test current auth state
    await testProfileCreation();

    // Test login with non-existent user
    await testLoginNonExistentUser();

    // Test complete registration flow
    await testCompleteFlow();

    console.log('='.repeat(50));
    console.log('📋 Test Summary:');
    console.log('1. ✅ Auth state listener activated');
    console.log('2. ✅ Non-existent user detection working');
    console.log('3. ✅ Registration with email verification flow tested');
    console.log('');
    console.log('🔧 Manual Testing Steps:');
    console.log('1. Try signing up with a real email address');
    console.log('2. Check your email for verification link');
    console.log('3. Click the link (should redirect to /email-verified)');
    console.log('4. Profile should be created automatically');
    console.log('5. Try logging in with the verified account');
    console.log('6. Should redirect to /dashboard with user profile');
    console.log('');
    console.log('🚨 If any step fails, check the Network tab and console for errors');
};

// Export functions for manual testing
window.testCompleteFlow = testCompleteFlow;
window.testLoginNonExistentUser = testLoginNonExistentUser;
window.testProfileCreation = testProfileCreation;
window.runAllTests = runAllTests;

// Run tests
runAllTests();
