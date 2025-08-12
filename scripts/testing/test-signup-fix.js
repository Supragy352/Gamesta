// Test script to verify user signup works after RLS fix
// Open your Gamesta app, open browser console (F12), and paste this script

console.log('🧪 Testing User Signup After RLS Fix...');

const testUserSignup = async () => {
    try {
        // Generate unique test data
        const timestamp = Date.now();
        const testEmail = `test-${timestamp}@example.com`;
        const testPassword = 'testpassword123';
        const testUsername = `testuser${timestamp}`;

        console.log('📝 Test Data:', {
            email: testEmail,
            username: testUsername
        });

        console.log('🔐 Step 1: Attempting auth signup...');

        // This assumes you have supabase available globally
        // If not, you can test through your app's signup form instead
        if (typeof supabase !== 'undefined') {
            const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword,
            });

            if (error) {
                console.error('❌ Auth signup failed:', error.message);
                return false;
            }

            console.log('✅ Auth signup successful! User ID:', data.user?.id);

            // Now test creating the profile
            console.log('👤 Step 2: Creating user profile...');

            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .insert([
                    {
                        id: data.user.id,
                        email: testEmail,
                        username: testUsername,
                        bio: 'Test user created by RLS fix test'
                    }
                ]);

            if (profileError) {
                console.error('❌ Profile creation failed:', profileError.message);
                return false;
            }

            console.log('✅ Profile created successfully!');

            // Test creating user preferences
            console.log('⚙️ Step 3: Creating user preferences...');

            const { data: prefData, error: prefError } = await supabase
                .from('user_preferences')
                .insert([
                    {
                        user_id: data.user.id,
                        theme: 'dark',
                        email_notifications: true
                    }
                ]);

            if (prefError) {
                console.error('❌ Preferences creation failed:', prefError.message);
                return false;
            }

            console.log('✅ User preferences created successfully!');
            console.log('🎉 ALL TESTS PASSED! User signup is now working!');

            return true;
        } else {
            console.log('⚠️ Supabase not available globally. Test through the app signup form instead.');
            console.log('📝 Try signing up with these credentials:');
            console.log(`Email: ${testEmail}`);
            console.log(`Password: ${testPassword}`);
            console.log(`Username: ${testUsername}`);
            return null;
        }

    } catch (error) {
        console.error('❌ Test failed with unexpected error:', error);
        return false;
    }
};

// Run the test
testUserSignup().then(result => {
    if (result === true) {
        console.log('🎯 RESULT: User signup is working correctly!');
    } else if (result === false) {
        console.log('🚨 RESULT: User signup still has issues. Check the errors above.');
    } else {
        console.log('ℹ️ RESULT: Test through the app manually.');
    }
});

console.log('');
console.log('📋 Manual Test Instructions:');
console.log('1. Go to your Gamesta app signup page');
console.log('2. Try creating a new account');
console.log('3. If it works without RLS errors, the fix is successful!');
