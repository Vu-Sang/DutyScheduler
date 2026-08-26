-- SUPABASE DATABASE SCHEMA CHO HỆ THỐNG QUẢN LÝ LỊCH TRỰC NHẬT
-- Chạy đoạn script SQL này trong mục "SQL Editor" trên Dashboard Supabase của bạn:
-- https://fixasasxirdzlkrmphjo.supabase.co

-- 1. BANG NHAN VIEN (employees)
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Nhân viên trực nhật',
  department TEXT DEFAULT 'Vận hành',
  email TEXT,
  phone TEXT,
  avatar TEXT,
  accent_color TEXT DEFAULT 'primary',
  shifts_completed INT DEFAULT 0,
  off_days_used INT DEFAULT 0,
  max_off_days_per_month INT DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. BANG HANG MUC TRUC NHAT (duty_categories)
CREATE TABLE IF NOT EXISTS public.duty_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'cleaning_services',
  color TEXT DEFAULT '#003d9b',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. BANG DANG KY NGAY NGHI (off_days)
CREATE TABLE IF NOT EXISTS public.off_days (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_avatar TEXT,
  employee_role TEXT,
  date DATE NOT NULL,
  day_formatted TEXT,
  reason TEXT,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. BANG PHAN CONG TRUC NHAT (duty_assignments)
CREATE TABLE IF NOT EXISTS public.duty_assignments (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.duty_categories(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_icon TEXT,
  category_color TEXT,
  assigned_employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  assigned_employee_name TEXT NOT NULL,
  assigned_employee_role TEXT,
  assigned_employee_avatar TEXT,
  notes TEXT,
  status TEXT DEFAULT 'upcoming',
  proof_image TEXT,
  completed_at TEXT,
  completion_notes TEXT,
  admin_notes TEXT,
  penalty_status TEXT DEFAULT 'normal',
  fine_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.off_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script to avoid duplicate policy error (42710)
DROP POLICY IF EXISTS "Allow public select employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public insert employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public update employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public delete employees" ON public.employees;

DROP POLICY IF EXISTS "Allow public select categories" ON public.duty_categories;
DROP POLICY IF EXISTS "Allow public insert categories" ON public.duty_categories;
DROP POLICY IF EXISTS "Allow public update categories" ON public.duty_categories;
DROP POLICY IF EXISTS "Allow public delete categories" ON public.duty_categories;

DROP POLICY IF EXISTS "Allow public select off_days" ON public.off_days;
DROP POLICY IF EXISTS "Allow public insert off_days" ON public.off_days;
DROP POLICY IF EXISTS "Allow public update off_days" ON public.off_days;
DROP POLICY IF EXISTS "Allow public delete off_days" ON public.off_days;

DROP POLICY IF EXISTS "Allow public select assignments" ON public.duty_assignments;
DROP POLICY IF EXISTS "Allow public insert assignments" ON public.duty_assignments;
DROP POLICY IF EXISTS "Allow public update assignments" ON public.duty_assignments;
DROP POLICY IF EXISTS "Allow public delete assignments" ON public.duty_assignments;

-- Create Policies for Anonymous & Public Access
CREATE POLICY "Allow public select employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update employees" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete employees" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Allow public select categories" ON public.duty_categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON public.duty_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update categories" ON public.duty_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete categories" ON public.duty_categories FOR DELETE USING (true);

CREATE POLICY "Allow public select off_days" ON public.off_days FOR SELECT USING (true);
CREATE POLICY "Allow public insert off_days" ON public.off_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update off_days" ON public.off_days FOR UPDATE USING (true);
CREATE POLICY "Allow public delete off_days" ON public.off_days FOR DELETE USING (true);

CREATE POLICY "Allow public select assignments" ON public.duty_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert assignments" ON public.duty_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update assignments" ON public.duty_assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete assignments" ON public.duty_assignments FOR DELETE USING (true);

-- OPTIONAL: XOA TRONG DU LIEU MAU BAN DAU
TRUNCATE TABLE public.duty_assignments CASCADE;
TRUNCATE TABLE public.off_days CASCADE;
TRUNCATE TABLE public.duty_categories CASCADE;
TRUNCATE TABLE public.employees CASCADE;
