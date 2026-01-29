-- Fix: Add INSERT policy for profiles table
-- The upsert operation in settings page requires INSERT permission when profile doesn't exist

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
