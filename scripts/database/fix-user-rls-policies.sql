-- ========================================
-- FIX USER RLS POLICIES FOR SIGNUP
-- Run this SQL in your Supabase SQL Editor
-- ========================================

-- First, let's check current policies on users table
-- (You can run this to see what policies exist)
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Create proper RLS policies for users table
-- Allow anyone to view user profiles (for public display)
CREATE POLICY "Anyone can view user profiles" ON users 
    FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- CRITICAL: Allow users to insert their own profile during signup
-- This policy allows the authenticated user to create their profile row
CREATE POLICY "Users can create own profile" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- Also fix user_preferences table policies
-- ========================================

-- Drop existing policies on user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create own preferences" ON user_preferences;

-- Create proper policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences 
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to create their own preferences
CREATE POLICY "Users can create own preferences" ON user_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Optional: Grant necessary permissions
-- ========================================

-- Ensure authenticated users can insert into users table
GRANT INSERT ON users TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT SELECT ON users TO authenticated, anon;

-- Ensure authenticated users can manage their preferences
GRANT INSERT ON user_preferences TO authenticated;
GRANT UPDATE ON user_preferences TO authenticated;
GRANT SELECT ON user_preferences TO authenticated;

-- ========================================
-- Test the fix with a verification query
-- ========================================

-- You can run this to verify the policies are correctly set:
/*
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename IN ('users', 'user_preferences')
ORDER BY tablename, policyname;
*/

-- ========================================
-- Additional debugging info
-- ========================================

-- Check if RLS is enabled (should be true)
/*
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'user_preferences');
*/

-- Success message
SELECT 'RLS policies for users table have been fixed for signup!' as status;
