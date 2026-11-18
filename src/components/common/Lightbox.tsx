import React, { useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Photo } from '../../types';

interface LightboxProps {
  isOpen: boolean;
  photos: Photo[];
  currentIndex: number;
  jobTitle?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  photos,
  currentIndex,
  jobTitle,
  onClose,
  onPrev,
  onNext,
  onSelectIndex,
}) => {
  const currentPhoto = photos[currentIndex];
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      onNext();
    } else if (distance < -minSwipeDistance) {
      onPrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="pt-safe px-6 py-4 flex items-center justify-between z-20 text-white/90">
        <div className="flex flex-col">
          {jobTitle && <span className="text-xs uppercase tracking-wider text-white/60 font-heading">{jobTitle}</span>}
          <span className="text-sm font-medium tracking-wide">
            รูปที่ {currentIndex + 1} จาก {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Open original image */}
          <a
            href={currentPhoto.storage_path}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="ดูภาพต้นฉบับขนาดเต็ม"
            aria-label="ดูภาพขนาดเต็ม"
          >
            <Maximize2 className="w-4 h-4" />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white hover:text-black text-white transition-colors"
            title="ปิด (Esc)"
            aria-label="ปิดกล่องภาพเต็มจอ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-black/50 hover:bg-white hover:text-black text-white transition-colors border border-white/10 shadow-lg hidden sm:flex"
            aria-label="ภาพก่อนหน้า"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Photo */}
        <div className="max-w-full max-h-[82vh] flex items-center justify-center relative">
          <img
            key={currentPhoto.id}
            src={currentPhoto.storage_path}
            alt={currentPhoto.alt_text || `ภาพที่ ${currentIndex + 1}`}
            className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl transition-all duration-300 pointer-events-auto"
            loading="eager"
          />
        </div>

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-black/50 hover:bg-white hover:text-black text-white transition-colors border border-white/10 shadow-lg hidden sm:flex"
            aria-label="ภาพถัดไป"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Thumbnail Strip & Caption */}
      <div className="pb-safe px-4 py-3 z-20 flex flex-col items-center gap-2">
        {currentPhoto.alt_text && (
          <p className="text-xs text-white/70 max-w-xl text-center px-4 truncate">
            {currentPhoto.alt_text}
          </p>
        )}

        {/* Thumbnail Preview Strip */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar py-1 px-4">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => onSelectIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-white scale-105 shadow-md ring-1 ring-white/50'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                aria-label={`ไปที่ภาพที่ ${idx + 1}`}
              >
                <img
                  src={photo.thumb_path || photo.storage_path}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
