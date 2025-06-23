-- Check and Fix User Data
-- Run this in Supabase SQL Editor to check and fix the user account

-- First, check if user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'mishra03supragya@gmail.com';

-- Check if user exists in public.users
SELECT 
    id,
    email,
    username,
    created_at
FROM public.users 
WHERE email = 'mishra03supragya@gmail.com';

-- If user exists in auth.users but not in public.users, create the profile
-- Replace 'USER_ID_FROM_AUTH_QUERY' with the actual ID from the first query
/*
INSERT INTO public.users (id, email, username, avatar_url)
VALUES (
    'USER_ID_FROM_AUTH_QUERY', -- Replace with actual auth user ID
    'mishra03supragya@gmail.com',
    'supragya_mishra', -- Or whatever username you prefer
    'https://api.dicebear.com/7.x/avataaars/svg?seed=supragya_mishra'
);

-- Also create user preferences
INSERT INTO public.user_preferences (user_id)
VALUES ('USER_ID_FROM_AUTH_QUERY'); -- Replace with actual auth user ID
*/

-- Check all users to see current state
SELECT 
    u.id,
    u.email,
    u.username,
    au.email_confirmed_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC
LIMIT 10;
