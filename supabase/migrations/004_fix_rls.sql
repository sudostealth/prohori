-- Migration: 004_fix_rls.sql
-- Purpose: Ensure the trigger (even as Security Definer) and the user can access necessary data.

-- 1. Ensure Profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Create permissive policies for the user
-- User can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- User can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 4. Ensure Companies table has RLS enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 5. Create permissive policies for the company
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;

-- Company policy: Check if user's profile links to this company
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin') -- Only owners/admins can update company details
    )
  );
