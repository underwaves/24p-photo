import React from 'react';
import { Sparkles } from 'lucide-react';

export const TextTicker: React.FC = () => {
  const items = [
    'งานแต่งงาน (WEDDING)',
    'งานบวช (ORDINATION)',
    'งานอีเวนต์ & คอนเสิร์ต (EVENTS)',
    'ภาพพรีเวดดิ้ง (PRE-WEDDING)',
    'พิธีฉลองมงคลสมรส',
    'พิธีอุปสมบท',
    'NATURAL LIGHT & EMOTION',
  ];

  return (
    <div className="w-full overflow-hidden py-4 sm:py-6 bg-card-light-subtle/80 dark:bg-card-dark/80 border-y border-border-light dark:border-border-dark select-none backdrop-blur-md">
      <div className="flex w-max animate-marquee space-x-8 sm:space-x-12 items-center">
        {/* Double array for infinite seamless looping */}
        {[...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center space-x-8 sm:space-x-12 shrink-0">
            <span className="font-heading font-light tracking-widest text-sm sm:text-base uppercase text-fg-light-muted dark:text-fg-dark-muted">
              {text}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 opacity-70" />
          </div>
        ))}
      </div>
    </div>
  );
};
