import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ตรวจสอบว่าได้กำหนดค่าเชื่อมต่อ Supabase จริงแล้วหรือไม่
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key-here')
);

// สร้าง client ตัวจริง (หรือ dummy instance ปลอดภัยหากยังไม่ตั้งค่า)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(
      'https://placeholder-domain-palm-gallery.supabase.co',
      'placeholder-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

/**
 * ดึง Public URL ของรูปภาพใน Storage bucket 'gallery'
 */
export function getStoragePublicUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (!isSupabaseConfigured) {
    return path;
  }
  const { data } = supabase.storage.from('gallery').getPublicUrl(path);
  return data.publicUrl;
}
