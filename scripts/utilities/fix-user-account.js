// Quick fix script to create missing user profile
// Run this in browser console if user exists in auth but not in database

import { supabase } from './src/lib/supabaseClient.js';

async function fixUserAccount() {
    console.log('🔧 Starting user account fix...');

    try {
        // Get current auth user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('❌ Auth error:', authError);
            return;
        }

        if (!user) {
            console.log('ℹ️ No authenticated user found');
            return;
        }

        console.log('👤 Found auth user:', user.email);

        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ Profile check error:', profileError);
            return;
        }

        if (existingProfile) {
            console.log('✅ User profile already exists:', existingProfile);
            return;
        }

        console.log('🛠️ Creating missing user profile...');

        // Create user profile
        const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
                id: user.id,
                email: user.email,
                username: user.email.split('@')[0], // Use email prefix as username
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Profile creation error:', createError);
            return;
        }

        console.log('✅ User profile created successfully:', newProfile);

        // Create user preferences
        const { error: prefError } = await supabase
            .from('user_preferences')
            .insert({
                user_id: user.id,
            });

        if (prefError) {
            console.warn('⚠️ User preferences creation failed (non-critical):', prefError);
        } else {
            console.log('✅ User preferences created successfully');
        }

        console.log('🎉 User account fix completed successfully!');
        return newProfile;

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    fixUserAccount();
}

export { fixUserAccount };
