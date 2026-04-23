# Manual Instructions for Prohori Setup

## 1. Database Setup (Supabase SQL Editor)
Run the following SQL commands in your Supabase SQL Editor to create the `company_uploaded_logs` table and configure the storage bucket.

```sql
-- Create table for uploaded logs
CREATE TABLE IF NOT EXISTS company_uploaded_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  row_count INTEGER DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_uploaded_logs ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "logs_select_own" ON company_uploaded_logs FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "logs_insert_own" ON company_uploaded_logs FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "logs_delete_own" ON company_uploaded_logs FOR DELETE USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Create Storage Bucket for logs
INSERT INTO storage.buckets (id, name, public) VALUES ('company_logs', 'company_logs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Give users authenticated access to folder" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'company_logs' AND auth.role() = 'authenticated');

CREATE POLICY "Give users authenticated insert to folder" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'company_logs' AND auth.role() = 'authenticated');

CREATE POLICY "Give users authenticated delete to folder" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'company_logs' AND auth.role() = 'authenticated');
```

## 2. Environment Variables
Add the OpenRouter API Key to your `.env.local` file (and to your Vercel project environment variables):

```env
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```
