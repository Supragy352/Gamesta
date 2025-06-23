// Debug script for login issues
// Open your Gamesta app, open browser console (F12), and paste this script

console.log('🔍 Debugging Login Issues...');

// Helper function to safely get auth data
const getAuthData = async () => {
    try {
        if (typeof supabase === 'undefined') {
            console.log('⚠️ Supabase not available globally. Using manual test.');
            return null;
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    } catch (error) {
        console.error('❌ Error getting auth data:', error);
        return null;
    }
};

// Test function to debug login process
const debugLoginFlow = async (email = 'test@example.com', password = 'password123') => {
    console.log('🔐 Step 1: Testing Authentication...');

    try {
        // Step 1: Test Supabase Auth
        const authResult = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authResult.error) {
            console.error('❌ Auth failed:', authResult.error.message);
            return false;
        }

        console.log('✅ Auth successful! User ID:', authResult.data.user?.id);

        // Step 2: Test getting current user from auth
        console.log('👤 Step 2: Testing auth.getUser()...');
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();

        if (getUserError) {
            console.error('❌ getUser failed:', getUserError.message);
            return false;
        }

        if (!user) {
            console.error('❌ No user returned from getUser');
            return false;
        }

        console.log('✅ getUser successful! User ID:', user.id);

        // Step 3: Test getting user profile from database
        console.log('📊 Step 3: Testing user profile fetch...');
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Profile fetch failed:', profileError.message);
            console.log('🔍 Profile error details:', profileError);
            return false;
        }

        if (!profile) {
            console.error('❌ No profile found for user');
            return false;
        }

        console.log('✅ Profile fetch successful!');
        console.log('📋 Profile data:', profile);

        // Step 4: Test localStorage operations
        console.log('💾 Step 4: Testing localStorage...');
        try {
            const sessionData = {
                userId: profile.id,
                email: profile.email,
                lastActivity: new Date().toISOString()
            };

            localStorage.setItem('gamesta_user_session', JSON.stringify(sessionData));
            const retrieved = localStorage.getItem('gamesta_user_session');

            if (retrieved) {
                console.log('✅ localStorage working correctly');
                console.log('📋 Stored session:', JSON.parse(retrieved));
            } else {
                console.error('❌ localStorage not working');
            }
        } catch (error) {
            console.error('❌ localStorage error:', error);
        }

        console.log('🎉 All login steps completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Unexpected error in login flow:', error);
        return false;
    }
};

// Test auth state changes
const testAuthStateChanges = () => {
    console.log('🔄 Step 5: Testing auth state listener...');

    let listenerCount = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        listenerCount++;
        console.log(`🔔 Auth state change #${listenerCount}:`, {
            event,
            user: session?.user ? {
                id: session.user.id,
                email: session.user.email
            } : null
        });

        if (listenerCount > 5) {
            console.log('🛑 Stopping auth listener after 5 events');
            subscription.unsubscribe();
        }
    });

    return subscription;
};

// Main debug function
const runFullDebug = async () => {
    console.log('🚀 Starting comprehensive login debug...');

    // Test auth state listener
    const authSubscription = testAuthStateChanges();

    // Test current auth state
    const currentAuth = await getAuthData();
    if (currentAuth?.user) {
        console.log('✅ Already logged in as:', currentAuth.user.email);
    } else {
        console.log('ℹ️ Not currently logged in');
    }

    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Try logging in through the app');
    console.log('2. Watch the console for auth state changes');
    console.log('3. If login gets stuck, check the network tab for failed requests');
    console.log('4. Check localStorage for gamesta_user_session');
    console.log('');
    console.log('💡 To test with specific credentials, run:');
    console.log('debugLoginFlow("your-email@example.com", "your-password")');
};

// Export functions for manual testing
window.debugLoginFlow = debugLoginFlow;
window.runFullDebug = runFullDebug;
window.getAuthData = getAuthData;

// Run initial debug
runFullDebug();
