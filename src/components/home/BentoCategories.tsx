import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Image as ImageIcon, Calendar } from 'lucide-react';
import { CATEGORIES } from '../../types';
import type { Job, Category } from '../../types';

interface BentoCategoriesProps {
  jobs: Job[];
}

export const BentoCategories: React.FC<BentoCategoriesProps> = ({ jobs }) => {
  // หาข้อมูลงานล่าสุดและจำนวนงาน/รูปในแต่ละหมวด
  const getCategoryStats = (cat: Category) => {
    const catJobs = jobs.filter((j) => j.category === cat && j.is_published);
    const latestJob = catJobs[0];
    const totalPhotos = catJobs.reduce(
      (sum, j) => sum + (j.photo_count || j.photos?.length || 0),
      0
    );

    // ภาพปกของหมวด
    let coverUrl = latestJob?.cover_photo?.storage_path;
    if (!coverUrl && latestJob?.photos?.[0]) {
      coverUrl = latestJob.photos[0].storage_path;
    }

    // fallback default placeholder ถ้ายังไม่มีรูป
    if (!coverUrl) {
      if (cat === 'wedding') {
        coverUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
      } else if (cat === 'ordination') {
        coverUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
      } else {
        coverUrl = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80';
      }
    }

    return {
      jobsCount: catJobs.length,
      photosCount: totalPhotos,
      coverUrl,
      latestTitle: latestJob?.title,
    };
  };

  const weddingStats = getCategoryStats('wedding');
  const ordinationStats = getCategoryStats('ordination');
  const eventsStats = getCategoryStats('events');

  return (
    <section id="categories" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-accent uppercase tracking-widest text-xs font-semibold font-heading">
            Portfolio Categories
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight mt-2">
            หมวดหมู่ผลงานภาพถ่าย
          </h2>
        </div>
        <p className="text-sm sm:text-base text-fg-light-muted dark:text-fg-dark-muted max-w-md mt-4 md:mt-0 font-light">
          เลือกชมผลงานตามประเภทงานที่ท่านสนใจ บันทึกเรื่องราวทุกรายละเอียดอย่างประณีต
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Card: งานแต่งงาน (Wedding) - spans 7 cols */}
        <Link
          to="/portfolio?category=wedding"
          className="lg:col-span-7 group relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[500px] flex flex-col justify-between p-8 border border-border-light dark:border-border-dark bg-card-dark text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {/* Background image with gentle hover zoom */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${weddingStats.coverUrl})` }}
          />
          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Top Badge & Arrow */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-4 py-1.5 rounded-full bg-accent text-accent-fg text-xs font-medium tracking-wider uppercase font-heading shadow-md">
              หมวดยอดนิยม
            </span>
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-accent group-hover:text-accent-fg group-hover:rotate-45 transition-all duration-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-4 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent" />
                {weddingStats.jobsCount} อัลบั้มงาน
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-accent" />
                {weddingStats.photosCount} รูปภาพ
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-white group-hover:text-white transition-colors">
              {CATEGORIES.wedding.title}
            </h3>
            <p className="text-sm text-white/80 max-w-lg font-light leading-relaxed">
              {CATEGORIES.wedding.description}
            </p>
          </div>
        </Link>

        {/* Right Stack: 2 Small Cards - spans 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Small Card 1: งานบวช (Ordination) */}
          <Link
            to="/portfolio?category=ordination"
            className="group relative rounded-3xl overflow-hidden min-h-[240px] flex-1 flex flex-col justify-between p-7 border border-border-light dark:border-border-dark bg-card-dark text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${ordinationStats.coverUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

            {/* Top */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wider uppercase font-heading">
                ORDINATION
              </span>
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-accent group-hover:rotate-45 transition-all duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-3 text-xs text-white/80">
                <span>{ordinationStats.jobsCount} อัลบั้ม</span>
                <span>•</span>
                <span>{ordinationStats.photosCount} รูปภาพ</span>
              </div>
              <h3 className="text-2xl font-heading font-light text-white tracking-tight">
                {CATEGORIES.ordination.title}
              </h3>
            </div>
          </Link>

          {/* Small Card 2: งานอื่นๆ (Events) */}
          <Link
            to="/portfolio?category=events"
            className="group relative rounded-3xl overflow-hidden min-h-[240px] flex-1 flex flex-col justify-between p-7 border border-border-light dark:border-border-dark bg-card-dark text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${eventsStats.coverUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

            {/* Top */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wider uppercase font-heading">
                EVENTS
              </span>
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-accent group-hover:rotate-45 transition-all duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-3 text-xs text-white/80">
                <span>{eventsStats.jobsCount} อัลบั้ม</span>
                <span>•</span>
                <span>{eventsStats.photosCount} รูปภาพ</span>
              </div>
              <h3 className="text-2xl font-heading font-light text-white tracking-tight">
                {CATEGORIES.events.title}
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
