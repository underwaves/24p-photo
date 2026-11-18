import React, { useState } from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { TextTicker } from '../components/home/TextTicker';
import { BentoCategories } from '../components/home/BentoCategories';
import { RecentWorksSnap } from '../components/home/RecentWorksSnap';
import { ContactSection } from '../components/home/ContactSection';
import { Lightbox } from '../components/common/Lightbox';
import { useJobs } from '../hooks/useJobs';
import type { Job, Photo } from '../types';

export const HomePage: React.FC = () => {
  const { jobs } = useJobs(undefined, true);

  // Lightbox for Recent Works click
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

  const handleOpenJobLightbox = (job: Job) => {
    if (job.photos && job.photos.length > 0) {
      setLightboxState({
        isOpen: true,
        photos: job.photos,
        currentIndex: 0,
        jobTitle: job.title,
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Fullscreen Slider */}
      <HeroSlider jobs={jobs} />

      {/* 2. Marquee Text Ticker */}
      <TextTicker />

      {/* 3. Bento Category Cards */}
      <BentoCategories jobs={jobs} />

      {/* 4. Recent Works Horizontal Scroll-snap */}
      <RecentWorksSnap jobs={jobs} onOpenJobLightbox={handleOpenJobLightbox} />

      {/* 5. Contact Section */}
      <ContactSection />

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxState.isOpen}
        photos={lightboxState.photos}
        currentIndex={lightboxState.currentIndex}
        jobTitle={lightboxState.jobTitle}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        onPrev={() =>
          setLightboxState((prev) => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
          }))
        }
        onNext={() =>
          setLightboxState((prev) => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.photos.length,
          }))
        }
        onSelectIndex={(index) =>
          setLightboxState((prev) => ({ ...prev, currentIndex: index }))
        }
      />
    </div>
  );
};
