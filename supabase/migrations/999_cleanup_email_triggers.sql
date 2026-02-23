-- 1. Remove the old database trigger that called the custom Edge Function
DROP TRIGGER IF EXISTS "send_auth_email" ON auth.users;
DROP FUNCTION IF EXISTS "public"."send_auth_email"();

-- 2. Remove any leftover webhooks if you manually created them via the UI or SQL
-- This cleans up any 'http_request' triggers that might be failing (500 error)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
        AND event_object_table = 'users'
        AND trigger_name LIKE '%webhook%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trigger_record.trigger_name) || ' ON auth.users;';
    END LOOP;
END $$;

-- 3. Verify that ONLY the profile creation trigger remains
-- (This is the critical one for creating companies/profiles)
-- If this was missing or broken, signup would also fail, but usually with a different error.
-- We re-assert it here just in case.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
  user_full_name TEXT;
  user_company_name TEXT;
BEGIN
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.email);
  user_company_name := COALESCE(new.raw_user_meta_data->>'company_name', 'My Company');

  INSERT INTO public.companies (name, email, subscription_plan, subscription_status)
  VALUES (user_company_name, new.email, 'basic', 'trial')
  RETURNING id INTO new_company_id;

  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (new.id, new_company_id, user_full_name, new.email, 'owner');

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent signup failure if profile creation fails (log it instead)
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
