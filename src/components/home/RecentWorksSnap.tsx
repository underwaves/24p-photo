import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../../types';
import type { Job } from '../../types';
import { formatThaiDate } from '../../lib/utils';

interface RecentWorksSnapProps {
  jobs: Job[];
  onOpenJobLightbox?: (job: Job) => void;
}

export const RecentWorksSnap: React.FC<RecentWorksSnapProps> = ({ jobs, onOpenJobLightbox }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const publishedJobs = jobs.filter((j) => j.is_published);

  if (publishedJobs.length === 0) return null;

  return (
    <section className="py-20 bg-card-light-subtle/30 dark:bg-card-dark/30 border-y border-border-light dark:border-border-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-accent uppercase tracking-widest text-xs font-semibold font-heading">
              Recent Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight mt-1">
              ผลงานล่าสุดที่เพิ่งบันทึก
            </h2>
          </div>

          {/* Scroll Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light dark:text-fg-dark hover:text-accent transition-colors flex items-center justify-center shadow-sm"
              aria-label="เลื่อนซ้าย"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light dark:text-fg-dark hover:text-accent transition-colors flex items-center justify-center shadow-sm"
              aria-label="เลื่อนขวา"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Snap Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-4"
        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
      >
        {publishedJobs.map((job) => {
          const coverUrl =
            job.cover_photo?.storage_path ||
            job.photos?.[0]?.storage_path ||
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
          const categoryInfo = CATEGORIES[job.category];

          return (
            <div
              key={job.id}
              className="snap-start shrink-0 w-[300px] sm:w-[360px] group rounded-3xl overflow-hidden bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex flex-col shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Photo Cover with click to lightbox */}
              <div
                className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-card-dark-subtle"
                onClick={() => onOpenJobLightbox && onOpenJobLightbox(job)}
              >
                <img
                  src={coverUrl}
                  alt={job.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Badge Category */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wider uppercase font-heading border border-white/20">
                    {categoryInfo?.title || job.category}
                  </span>
                </div>

                {/* Photo Count badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                  <ImageIcon className="w-3.5 h-3.5 text-accent" />
                  <span>{job.photo_count || job.photos?.length || 0} รูป</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-fg-light-muted dark:text-fg-dark-muted">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{formatThaiDate(job.event_date)}</span>
                  </div>
                  <h3 className="font-heading font-medium text-lg text-fg-light dark:text-fg-dark line-clamp-2 group-hover:text-accent transition-colors">
                    {job.title}
                  </h3>
                  {job.description && (
                    <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-border-light dark:border-border-dark text-xs">
                  <button
                    onClick={() => onOpenJobLightbox && onOpenJobLightbox(job)}
                    className="text-accent font-medium hover:underline flex items-center gap-1"
                  >
                    เปิดดูแกลเลอรี่ ({job.photo_count || job.photos?.length || 0} ภาพ)
                  </button>
                  <Link
                    to={categoryInfo?.path || `/${job.category}`}
                    className="text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark transition-colors"
                  >
                    ดูหมวดนี้ →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
