/*
# Create Velva user profiles

1. New Tables
- `velva_profiles`
  - `id`: UUID matching auth.users id (primary key).
  - `first_name`: customer first name.
  - `last_name`: customer last name.
  - `phone`: Pakistani mobile number starting with 03.
  - `created_at`: registration timestamp.

2. Security
- RLS enabled.
- Authenticated users can read and update only their own profile.
- Insert allowed on sign-up (user_id defaults to auth.uid()).
*/
CREATE TABLE IF NOT EXISTS public.velva_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 2 AND 60),
  last_name text NOT NULL CHECK (char_length(last_name) BETWEEN 2 AND 60),
  phone text NOT NULL CHECK (phone ~ '^03[0-9]{9}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.velva_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.velva_profiles TO authenticated;
DROP POLICY IF EXISTS "Profiles: owner select" ON public.velva_profiles;
CREATE POLICY "Profiles: owner select" ON public.velva_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles: owner insert" ON public.velva_profiles;
CREATE POLICY "Profiles: owner insert" ON public.velva_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles: owner update" ON public.velva_profiles;
CREATE POLICY "Profiles: owner update" ON public.velva_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
