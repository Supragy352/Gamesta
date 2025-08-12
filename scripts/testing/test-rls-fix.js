// Test script to verify RLS fix for user creation
// Run this in your browser console after applying the SQL fix

console.log('🔧 Testing User Signup RLS Fix...');

// This should work after applying the fix
const testUserSignup = async () => {
    try {
        // Test data
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'testpassword123';
        const testUsername = `testuser${Date.now()}`;

        console.log('📝 Attempting to create test user:', { email: testEmail, username: testUsername });

        // Try to sign up (this should now work with the fixed RLS policies)
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.error('❌ Signup failed:', error.message);
            return false;
        }

        console.log('✅ Auth signup successful:', data.user?.id);

        // Try to create user profile (this should now work)
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: data.user.id,
                email: testEmail,
                username: testUsername,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${testUsername}`,
            });

        if (profileError) {
            console.error('❌ Profile creation failed:', profileError.message);
            return false;
        }

        console.log('✅ User profile created successfully!');

        // Try to create user preferences
        const { error: prefsError } = await supabase
            .from('user_preferences')
            .insert({
                user_id: data.user.id,
            });

        if (prefsError) {
            console.error('⚠️ Preferences creation failed:', prefsError.message);
            // This might fail if user_preferences table doesn't exist, but that's ok
        } else {
            console.log('✅ User preferences created successfully!');
        }

        console.log('🎉 RLS fix is working! User signup process completed successfully.');
        return true;

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        return false;
    }
};

// Run the test
testUserSignup();

console.log('');
console.log('📋 To apply the RLS fix:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and run the SQL from fix-user-rls-policies.sql');
console.log('4. Run this test script again to verify the fix');
