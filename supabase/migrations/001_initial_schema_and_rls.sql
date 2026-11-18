-- ==============================================================================
-- 001_initial_schema_and_rls.sql
-- 24p PHOTO DATABASE SCHEMA & RLS
-- ==============================================================================

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL DEFAULT '24p PHOTO',
  tagline text NOT NULL DEFAULT 'บันทึกทุกช่วงเวลาสำคัญ ด้วยอารมณ์และแสงที่จริงใจ',
  bio text DEFAULT 'ช่างภาพอิสระผู้หลงใหลในความทรงจำ รับถ่ายภาพงานแต่งงาน งานบวช และงานพิธีทั่วประเทศ ด้วยสไตล์ที่เป็นธรรมชาติ อบอุ่น และเหนือกาลเวลา',
  contact jsonb NOT NULL DEFAULT '{
    "phone": "089-123-4567",
    "line": "@24pphoto",
    "facebook": "24p PHOTO Studio",
    "instagram": "@24p.photo",
    "email": "contact@24pphoto.com"
  }'::jsonb,
  hero_image_paths text[] NOT NULL DEFAULT ARRAY[
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=82',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=82',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=82'
  ],
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure a default row exists
INSERT INTO public.site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;


-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('wedding', 'ordination', 'events')),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  cover_photo_id uuid,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_event_date ON public.jobs (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_published ON public.jobs (is_published);


-- 3. PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  thumb_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  width integer,
  height integer,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photos_job_id ON public.photos (job_id);
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON public.photos (sort_order ASC);


-- 4. TRIGGER: ENFORCE MAXIMUM 20 PHOTOS PER JOB
CREATE OR REPLACE FUNCTION public.check_max_photos_per_job()
RETURNS TRIGGER AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT count(*) INTO current_count FROM public.photos WHERE job_id = NEW.job_id;
  IF current_count >= 20 THEN
    RAISE EXCEPTION 'แต่ละงานสามารถมีรูปภาพได้ไม่เกิน 20 รูป (ปัจจุบันมี % รูปแล้ว)', current_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_photos_per_job ON public.photos;
CREATE TRIGGER enforce_max_photos_per_job
BEFORE INSERT ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.check_max_photos_per_job();


-- 5. TRIGGER: AUTO UPDATE updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_timestamp ON public.site_settings;
CREATE TRIGGER update_site_settings_timestamp
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS update_jobs_timestamp ON public.jobs;
CREATE TRIGGER update_jobs_timestamp
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();


-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Site Settings Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin can update site settings" ON public.site_settings;
CREATE POLICY "Admin can update site settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can insert site settings" ON public.site_settings;
CREATE POLICY "Admin can insert site settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Jobs Policies
DROP POLICY IF EXISTS "Public can view published jobs" ON public.jobs;
CREATE POLICY "Public can view published jobs"
ON public.jobs FOR SELECT
TO anon, authenticated
USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can insert jobs" ON public.jobs;
CREATE POLICY "Admin can insert jobs"
ON public.jobs FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update jobs" ON public.jobs;
CREATE POLICY "Admin can update jobs"
ON public.jobs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete jobs" ON public.jobs;
CREATE POLICY "Admin can delete jobs"
ON public.jobs FOR DELETE
TO authenticated
USING (true);

-- Photos Policies
DROP POLICY IF EXISTS "Public can view photos of published jobs" ON public.photos;
CREATE POLICY "Public can view photos of published jobs"
ON public.photos FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE public.jobs.id = public.photos.job_id
    AND (public.jobs.is_published = true OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "Admin can insert photos" ON public.photos;
CREATE POLICY "Admin can insert photos"
ON public.photos FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update photos" ON public.photos;
CREATE POLICY "Admin can update photos"
ON public.photos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete photos" ON public.photos;
CREATE POLICY "Admin can delete photos"
ON public.photos FOR DELETE
TO authenticated
USING (true);


-- 7. STORAGE BUCKET CONFIGURATION & POLICIES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  15728640, -- 15MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage bucket RLS policies
DROP POLICY IF EXISTS "Public Read Access for Gallery Bucket" ON storage.objects;
CREATE POLICY "Public Read Access for Gallery Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin Upload to Gallery Bucket" ON storage.objects;
CREATE POLICY "Admin Upload to Gallery Bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin Update in Gallery Bucket" ON storage.objects;
CREATE POLICY "Admin Update in Gallery Bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin Delete from Gallery Bucket" ON storage.objects;
CREATE POLICY "Admin Delete from Gallery Bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');
