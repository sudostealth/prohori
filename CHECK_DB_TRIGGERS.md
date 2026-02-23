# Database Trigger Verification

If you are experiencing issues where users sign up but no profile is created, please run the following SQL commands in your **Supabase SQL Editor** to ensure the triggers are correctly set up.

## 1. Verify and Fix Triggers

Copy and paste the entire block below into the SQL Editor and click **Run**.

```sql
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
```

## 2. Verify RLS Policies

Run this block to ensure the new user can actually read their data.

```sql
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
```

## 3. Check Supabase Logs for SMTP Errors

If you still see "Error sending confirmation email" (500 Error):

1.  Go to your Supabase Project Dashboard.
2.  Navigate to **Project Settings** -> **Logs** -> **Auth**.
3.  Look for the `500` error entry.
4.  Expand it to see the `error` details. Common issues:
    *   `535 Authentication Failed`: Invalid Resend API Key.
    *   `550 Sender address rejected`: The "Sender Email" in Supabase Auth settings does not match the verified domain (`joruri.prohori.app`) in Resend.
    *   `Rate limit exceeded`: Resend has blocked sending temporarily.
