export type Category = 'wedding' | 'ordination' | 'events';

export interface CategoryInfo {
  id: Category;
  title: string;
  subtitle: string;
  description: string;
  path: string;
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  wedding: {
    id: 'wedding',
    title: 'งานแต่งงาน',
    subtitle: 'Wedding Ceremony & Reception',
    description: 'บันทึกเรื่องราวความรัก ความสุข และความอบอุ่นในวันสำคัญที่สุดของชีวิตคู่',
    path: '/wedding',
  },
  ordination: {
    id: 'ordination',
    title: 'งานบวช',
    subtitle: 'Ordination Ceremony',
    description: 'พิธีอุปสมบทอันศักดิ์สิทธิ์ สายสัมพันธ์ครอบครัว และความปิติในร่มกาสาวพัสตร์',
    path: '/ordination',
  },
  events: {
    id: 'events',
    title: 'งานอื่นๆ',
    subtitle: 'Events, Concerts & Ceremonies',
    description: 'งานคอนเสิร์ต งานเปิดตัว งานอีเวนต์ และกิจกรรมพิเศษต่างๆ ทุกรูปแบบ',
    path: '/events',
  },
};

export interface Photo {
  id: string;
  job_id: string;
  storage_path: string;
  thumb_path: string;
  sort_order: number;
  width?: number;
  height?: number;
  alt_text?: string;
  created_at: string;
}

export interface Job {
  id: string;
  category: Category;
  title: string;
  description?: string;
  event_date: string;
  is_published: boolean;
  cover_photo_id?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  photos?: Photo[];
  cover_photo?: Photo;
  photo_count?: number;
}

export interface SiteContact {
  phone: string;
  line: string;
  facebook: string;
  instagram: string;
  email: string;
}

export interface SiteSettings {
  id: number;
  name: string;
  tagline: string;
  bio: string;
  contact: SiteContact;
  hero_image_paths: string[];
  updated_at: string;
}

export interface LightboxState {
  isOpen: boolean;
  photos: Photo[];
  currentIndex: number;
  jobTitle?: string;
}
