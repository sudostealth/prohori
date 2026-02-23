-- Migration: 003_fix_profile_trigger.sql
-- Purpose: Ensure the user creation trigger correctly handles edge cases and data insertion.

-- 1. Drop the existing trigger to recreate it cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass RLS during signup
AS $$
DECLARE
  new_company_id UUID;
  user_full_name TEXT;
  user_company_name TEXT;
BEGIN
  -- Extract metadata safely (default to email if missing)
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.email);
  user_company_name := COALESCE(new.raw_user_meta_data->>'company_name', 'My Company');

  -- A. Create a Company for the user
  INSERT INTO public.companies (
    name,
    email,
    subscription_plan,
    subscription_status
  )
  VALUES (
    user_company_name,
    new.email,
    'basic', -- Default plan
    'trial'  -- Default status
  )
  RETURNING id INTO new_company_id;

  -- B. Create a Profile linked to the user and the new company
  INSERT INTO public.profiles (
    id,
    company_id,
    full_name,
    email,
    role
  )
  VALUES (
    new.id,
    new_company_id,
    user_full_name,
    new.email,
    'owner' -- The first user is the owner
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error (visible in Postgres logs) but try to allow user creation to succeed
    -- Note: In Supabase, if this fails, the signup fails.
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$;

-- 3. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
