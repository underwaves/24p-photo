import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, PhoneCall, Sparkles, ChevronRight } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import type { Job } from '../../types';

interface HeroSliderProps {
  jobs: Job[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ jobs }) => {
  const { settings } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  // สไลด์รูปจาก settings หรือ fallback
  const slides = settings.hero_image_paths?.length
    ? settings.hero_image_paths
    : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=82',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=82',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2000&q=82',
      ];

  // สลับภาพอัตโนมัติทุก 5 วินาที
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // คำนวณจำนวนงานและจำนวนภาพจริง
  const totalJobs = jobs.length;
  const totalPhotos = jobs.reduce((sum, j) => sum + (j.photo_count || j.photos?.length || 0), 0);

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slides with smooth fade */}
      <div className="absolute inset-0 z-0">
        {slides.map((url, index) => (
          <div
            key={url + index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{
              backgroundImage: `url(${url})`,
              transitionProperty: 'opacity, transform',
              transitionDuration: '1000ms',
            }}
          />
        ))}

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-bg-dark/40" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 flex flex-col items-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Professional Photography Portfolio</span>
        </div>

        {/* Large Photographer Name (Prompt 200-300 weight) */}
        <h1 className="font-heading font-extralight tracking-tight text-white uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none mb-6">
          {settings.name || '24p PHOTO'}
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          {settings.tagline || 'บันทึกทุกช่วงเวลาสำคัญ ด้วยอารมณ์และแสงที่จริงใจ'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-16">
          <Link
            to="/portfolio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-all duration-300 shadow-xl group"
          >
            <span>ดูผลงานทั้งหมด</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-md text-white font-medium hover:bg-white/25 transition-all duration-300 border border-white/20"
          >
            <PhoneCall className="w-4 h-4" />
            <span>ติดต่อจ้างงาน</span>
          </a>
        </div>

        {/* Stats Summary Counter */}
        <div className="grid grid-cols-3 gap-4 sm:gap-12 py-4 px-6 sm:px-10 rounded-3xl bg-black/40 backdrop-blur-lg border border-white/10 text-white">
          <div className="flex flex-col items-center">
            <span className="font-heading font-light text-2xl sm:text-4xl text-accent">
              {totalJobs > 0 ? `${totalJobs}+` : '3+'}
            </span>
            <span className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider font-heading mt-1">
              ผลงานที่บันทึก
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/10 px-4 sm:px-8">
            <span className="font-heading font-light text-2xl sm:text-4xl text-white">
              {totalPhotos > 0 ? `${totalPhotos}+` : '50+'}
            </span>
            <span className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider font-heading mt-1">
              ภาพถ่ายในแกลเลอรี่
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-heading font-light text-2xl sm:text-4xl text-accent">
              100%
            </span>
            <span className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider font-heading mt-1">
              แสงและอารมณ์จริง
            </span>
          </div>
        </div>

        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 h-2 bg-accent'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`ไปที่ภาพสไลด์ที่ ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 flex flex-col items-center animate-bounce hidden sm:flex">
        <span className="text-[10px] uppercase tracking-widest mb-1">เลื่อนลงเพื่อดูผลงาน</span>
        <ArrowDown className="w-4 h-4" />
      </div>
    </section>
  );
};
