-- Schema for Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT '24p PHOTO',
  tagline TEXT NOT NULL DEFAULT 'บันทึกทุกช่วงเวลาสำคัญ ด้วยอารมณ์และแสงที่จริงใจ',
  bio TEXT DEFAULT 'ช่างภาพอิสระผู้หลงใหลในความทรงจำ รับถ่ายภาพงานแต่งงาน งานบวช และงานพิธีทั่วประเทศ ด้วยสไตล์ที่เป็นธรรมชาติ อบอุ่น และเหนือกาลเวลา ไม่เน้นโพสเกร็ง เน้นอารมณ์จริงและเรื่องราวที่เกิดขึ้น',
  contact TEXT NOT NULL DEFAULT '{"phone":"089-123-4567","line":"@24pphoto","facebook":"24p PHOTO Studio","instagram":"@24p.photo","email":"contact@24pphoto.com"}',
  hero_image_paths TEXT NOT NULL DEFAULT '["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=82","https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=82","https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2000&q=82"]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('wedding', 'ordination', 'events')),
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 1,
  cover_photo_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_event_date ON jobs (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_published ON jobs (is_published);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumb_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_job_id ON photos (job_id);
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos (sort_order ASC);

CREATE TRIGGER IF NOT EXISTS enforce_max_photos_per_job
BEFORE INSERT ON photos
BEGIN
  SELECT CASE
    WHEN (SELECT COUNT(*) FROM photos WHERE job_id = NEW.job_id) >= 20
    THEN RAISE(ABORT, 'แต่ละงานสามารถมีรูปภาพได้ไม่เกิน 20 รูป')
  END;
END;
