import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../types';
import type { Category, Job, Photo } from '../types';
import { useJobs } from '../hooks/useJobs';
import { formatThaiDate } from '../lib/utils';
import { Lightbox } from '../components/common/Lightbox';
import { EmptyState } from '../components/common/EmptyState';
import { MasonrySkeleton } from '../components/common/Skeleton';
import { ContactSection } from '../components/home/ContactSection';

type FilterCategory = 'all' | Category;

interface PortfolioPageProps {
  defaultCategory?: FilterCategory;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ defaultCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ดึง category จาก query string เช่น ?category=wedding หรือ fallback เป็น defaultCategory หรือ 'all'
  const queryCategory = searchParams.get('category') as Category | null;
  const activeCategory: FilterCategory =
    queryCategory && ['wedding', 'ordination', 'events'].includes(queryCategory)
      ? queryCategory
      : defaultCategory || 'all';

  // ดึงงานทั้งหมดที่เผยแพร่แล้ว (ดึงครั้งเดียวแล้วกรอง client-side ทันใจ)
  const { jobs, loading } = useJobs(undefined, true);

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

  const selectLightboxPhoto = (index: number) => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: index,
    }));
  };

  const handleSelectCategory = (cat: FilterCategory) => {
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  // กรองงานตามหมวดหมู่ที่เลือก
  const filteredJobs = activeCategory === 'all'
    ? jobs
    : jobs.filter((job) => job.category === activeCategory);

  // นับจำนวนงานในแต่ละหมวดหมู่
  const categoryCounts = {
    all: jobs.length,
    wedding: jobs.filter((j) => j.category === 'wedding').length,
    ordination: jobs.filter((j) => j.category === 'ordination').length,
    events: jobs.filter((j) => j.category === 'events').length,
  };

  const filterTabs: { id: FilterCategory; label: string; count: number }[] = [
    { id: 'all', label: 'ทั้งหมด', count: categoryCounts.all },
    { id: 'wedding', label: 'งานแต่งงาน', count: categoryCounts.wedding },
    { id: 'ordination', label: 'งานบวช', count: categoryCounts.ordination },
    { id: 'events', label: 'งานอื่นๆ', count: categoryCounts.events },
  ];

  // Header Title & Description ตามหมวดที่เลือก
  const headerInfo = {
    all: {
      title: 'ผลงานทั้งหมด',
      subtitle: 'Portfolio & Stories',
      description: 'รวมผลงานภาพถ่ายงานแต่งงาน งานบวช และงานพิธีทั่วประเทศ บันทึกทุกความรู้สึกอย่างเป็นธรรมชาติ',
    },
    wedding: {
      title: CATEGORIES.wedding.title,
      subtitle: CATEGORIES.wedding.subtitle,
      description: CATEGORIES.wedding.description,
    },
    ordination: {
      title: CATEGORIES.ordination.title,
      subtitle: CATEGORIES.ordination.subtitle,
      description: CATEGORIES.ordination.description,
    },
    events: {
      title: CATEGORIES.events.title,
      subtitle: CATEGORIES.events.subtitle,
      description: CATEGORIES.events.description,
    },
  }[activeCategory];

  return (
    <div className="min-h-screen pt-28 pb-24">
      {/* Portfolio Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-fg-light-muted dark:text-fg-dark-muted mb-4 font-heading">
          <Link to="/" className="hover:text-accent transition-colors">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-fg-light dark:text-fg-dark font-medium">ผลงาน</span>
          {activeCategory !== 'all' && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-accent">{headerInfo.title}</span>
            </>
          )}
        </div>

        {/* Large Header Title & Category Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-border-light dark:border-border-dark">
          <div>
            <span className="text-accent uppercase tracking-widest text-xs font-semibold font-heading block mb-1">
              {headerInfo.subtitle}
            </span>
            <h1 className="text-4xl sm:text-6xl font-heading font-extralight text-fg-light dark:text-fg-dark uppercase tracking-tight">
              {headerInfo.title}
            </h1>
            <p className="text-sm sm:text-base text-fg-light-muted dark:text-fg-dark-muted max-w-2xl mt-3 font-light leading-relaxed">
              {headerInfo.description}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl sm:rounded-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shrink-0">
            {filterTabs.map((tab) => {
              const active = tab.id === activeCategory;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                    active
                      ? 'bg-accent text-accent-fg shadow-sm'
                      : 'text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-heading ${
                      active
                        ? 'bg-black/15 dark:bg-white/20 text-accent-fg'
                        : 'bg-card-light-subtle dark:bg-card-dark-subtle text-fg-light-muted dark:text-fg-dark-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
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
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title={`ยังไม่มีงานในหมวด "${headerInfo.title}"`}
            description="ช่างภาพกำลังเตรียมอัปเดตผลงานชุดใหม่เร็วๆ นี้ สามารถเลือกชมหมวดหมู่อื่นๆ หรือกลับสู่หน้าแรกได้เลยครับ"
          />
        ) : (
          <div className="space-y-24">
            {filteredJobs.map((job: Job) => {
              const photos = job.photos || [];
              const catMeta = CATEGORIES[job.category] || CATEGORIES.wedding;

              return (
                <article
                  key={job.id}
                  className="rounded-3xl bg-card-light/40 dark:bg-card-dark/40 border border-border-light dark:border-border-dark p-6 sm:p-10 shadow-sm"
                >
                  {/* Job Header Info */}
                  <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-border-light/60 dark:border-border-dark/60">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted">
                        {/* Category Tag */}
                        <button
                          onClick={() => handleSelectCategory(job.category)}
                          className="px-2.5 py-1 rounded-full bg-accent/10 hover:bg-accent/20 text-accent font-medium text-[11px] transition-colors"
                        >
                          {catMeta.title}
                        </button>
                        <span>•</span>
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
                        className="self-start px-5 py-2.5 rounded-full bg-accent/10 hover:bg-accent text-accent hover:text-accent-fg transition-colors text-xs font-medium border border-accent/20 shrink-0 whitespace-nowrap"
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

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white text-xs font-light line-clamp-1">
                              {photo.alt_text || `ภาพที่ ${index + 1}`}
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

      {/* Contact & Inquiries Section */}
      <div className="mt-16">
        <ContactSection />
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxState.isOpen}
        photos={lightboxState.photos}
        currentIndex={lightboxState.currentIndex}
        jobTitle={lightboxState.jobTitle}
        onClose={closeLightbox}
        onNext={nextLightboxPhoto}
        onPrev={prevLightboxPhoto}
        onSelectIndex={selectLightboxPhoto}
      />
    </div>
  );
};
