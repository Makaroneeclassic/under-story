-- =========================================================
-- UNDERSTORY VENUE - SUPABASE DATABASE SCHEMA
-- =========================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project -> SQL Editor -> New Query
-- 3. Paste this entire file content and click "Run"
-- =========================================================

-- 1. CREATE LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT NOT NULL,
    event_month TEXT,
    status TEXT DEFAULT 'NEW',
    visit_date TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for sorting & searching leads
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone);

-- 2. CREATE SETTINGS TABLE (for GA4, GTM, Pixel & Tracking)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    enable_gtm BOOLEAN DEFAULT false,
    gtm_id TEXT DEFAULT '',
    enable_ga4 BOOLEAN DEFAULT false,
    ga4_id TEXT DEFAULT '',
    enable_fb_pixel BOOLEAN DEFAULT false,
    fb_pixel_id TEXT DEFAULT '',
    enable_tiktok_pixel BOOLEAN DEFAULT false,
    tiktok_pixel_id TEXT DEFAULT '',
    custom_head_script TEXT DEFAULT '',
    custom_body_script TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial settings row
INSERT INTO public.settings (id, enable_gtm, gtm_id, enable_ga4, ga4_id, enable_fb_pixel, fb_pixel_id, enable_tiktok_pixel, tiktok_pixel_id, custom_head_script, custom_body_script)
VALUES ('global', false, '', false, '', false, '', false, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 3. CREATE ADMIN USERS TABLE (for Login Authentication)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY DEFAULT 'admin_1',
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial admin credentials
INSERT INTO public.admin_users (id, username, password, role)
VALUES ('admin_1', 'adminunderstory', 'Under123story@', 'superadmin')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow Public / Anon Policies
CREATE POLICY "Allow public insert to leads" 
ON public.leads FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on leads" 
ON public.leads FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on leads" 
ON public.leads FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on leads" 
ON public.leads FOR DELETE 
USING (true);

CREATE POLICY "Allow public select on settings" 
ON public.settings FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on settings" 
ON public.settings FOR UPDATE 
USING (true);

CREATE POLICY "Allow public select on admin_users" 
ON public.admin_users FOR SELECT 
USING (true);
