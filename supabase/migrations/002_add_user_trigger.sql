-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- 1. Create a new company
  INSERT INTO public.companies (name, email)
  VALUES (
    COALESCE(new.raw_user_meta_data->>'company_name', 'My Company'),
    new.email
  )
  RETURNING id INTO new_company_id;

  -- 2. Create a new profile linked to the user and company
  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (
    new.id,
    new_company_id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    'owner' -- First user is the owner
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
