import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../types';
import type { Category, Job, Photo } from '../types';
import { useJobs } from '../hooks/useJobs';
import { formatThaiDate } from '../lib/utils';
import { Lightbox } from '../components/common/Lightbox';
import { EmptyState } from '../components/common/EmptyState';
import { MasonrySkeleton } from '../components/common/Skeleton';

interface CategoryPageProps {
  initialCategory?: Category;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory }) => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  // ตัดสินใจเลือก category จาก prop หรือ url slug
  const currentCategory: Category = (
    initialCategory ||
    (categorySlug as Category) ||
    'wedding'
  );

  const categoryMeta = CATEGORIES[currentCategory] || CATEGORIES.wedding;
  const { jobs, loading } = useJobs(currentCategory, true);

  // Lightbox State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    photos: Photo[];
    currentIndex: number;
    jobTitle?: string;
  }>({
    isOpen: false,
    photos: [],
    currentIndex: 0,
  });

  const openLightbox = (photos: Photo[], index: number, title: string) => {
    setLightboxState({
      isOpen: true,
      photos,
      currentIndex: index,
      jobTitle: title,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const nextLightboxPhoto = () => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length,
    }));
  };

  const prevLightboxPhoto = () => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
    }));
  };

  const categoryTabs: { id: Category; label: string; path: string }[] = [
    { id: 'wedding', label: 'งานแต่งงาน', path: '/wedding' },
    { id: 'ordination', label: 'งานบวช', path: '/ordination' },
    { id: 'events', label: 'งานอื่นๆ', path: '/events' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24">
      {/* Category Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-fg-light-muted dark:text-fg-dark-muted mb-4 font-heading">
          <Link to="/" className="hover:text-accent transition-colors">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-fg-light dark:text-fg-dark">{categoryMeta.title}</span>
        </div>

        {/* Large Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-light dark:border-border-dark">
          <div>
            <span className="text-accent uppercase tracking-widest text-xs font-semibold font-heading block mb-1">
              {categoryMeta.subtitle}
            </span>
            <h1 className="text-4xl sm:text-6xl font-heading font-extralight text-fg-light dark:text-fg-dark uppercase tracking-tight">
              {categoryMeta.title}
            </h1>
            <p className="text-sm sm:text-base text-fg-light-muted dark:text-fg-dark-muted max-w-2xl mt-3 font-light leading-relaxed">
              {categoryMeta.description}
            </p>
          </div>

          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shrink-0">
            {categoryTabs.map((tab) => {
              const active = tab.id === currentCategory;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-accent text-accent-fg shadow-sm'
                      : 'text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area: Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-16">
            <MasonrySkeleton />
            <MasonrySkeleton />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title={`ยังไม่มีงานในหมวด "${categoryMeta.title}"`}
            description="ช่างภาพกำลังเตรียมอัปเดตผลงานชุดใหม่เร็วๆ นี้ สามารถเลือกชมหมวดหมู่อื่นๆ หรือกลับสู่หน้าแรกได้เลยครับ"
          />
        ) : (
          <div className="space-y-24">
            {jobs.map((job: Job) => {
              const photos = job.photos || [];

              return (
                <article
                  key={job.id}
                  className="rounded-3xl bg-card-light/40 dark:bg-card-dark/40 border border-border-light dark:border-border-dark p-6 sm:p-10 shadow-sm"
                >
                  {/* Job Header Info */}
                  <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-border-light/60 dark:border-border-dark/60">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-4 text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-accent" />
                          {formatThaiDate(job.event_date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-accent" />
                          {photos.length} รูปภาพในอัลบั้ม
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-heading font-light text-fg-light dark:text-fg-dark tracking-tight">
                        {job.title}
                      </h2>
                      {job.description && (
                        <p className="text-sm text-fg-light-muted dark:text-fg-dark-muted font-light leading-relaxed">
                          {job.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Lightbox Launch Button */}
                    {photos.length > 0 && (
                      <button
                        onClick={() => openLightbox(photos, 0, job.title)}
                        className="self-start px-5 py-2.5 rounded-full bg-accent/10 hover:bg-accent text-accent hover:text-white transition-colors text-xs font-medium border border-accent/20 shrink-0"
                      >
                        ดูภาพเต็มจอ (Fullscreen)
                      </button>
                    )}
                  </div>

                  {/* Masonry Grid of Photos */}
                  {photos.length === 0 ? (
                    <p className="text-sm text-fg-light-muted dark:text-fg-dark-muted text-center py-8">
                      ยังไม่มีรูปภาพในอัลบั้มนี้
                    </p>
                  ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                      {photos.map((photo, index) => (
                        <div
                          key={photo.id}
                          onClick={() => openLightbox(photos, index, job.title)}
                          className="break-inside-avoid group relative rounded-2xl overflow-hidden cursor-pointer bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                          {/* Image with Lazy Loading */}
                          <img
                            src={photo.thumb_path || photo.storage_path}
                            alt={photo.alt_text || `${job.title} - รูปที่ ${index + 1}`}
                            loading="lazy"
                            className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />

                          {/* Hover Overlay with Zoom Icon */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                              ขยายดูภาพเต็ม
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxState.isOpen}
        photos={lightboxState.photos}
        currentIndex={lightboxState.currentIndex}
        jobTitle={lightboxState.jobTitle}
        onClose={closeLightbox}
        onPrev={prevLightboxPhoto}
        onNext={nextLightboxPhoto}
        onSelectIndex={(index) =>
          setLightboxState((prev) => ({ ...prev, currentIndex: index }))
        }
      />
    </div>
  );
};
