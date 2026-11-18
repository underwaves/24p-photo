import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showBackHome?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'ยังไม่มีงานในหมวดนี้',
  description = 'ช่างภาพกำลังเตรียมอัปเดตผลงานชุดใหม่เร็วๆ นี้ สามารถเลือกชมหมวดหมู่อื่นๆ ได้เลยครับ',
  showBackHome = true,
}) => {
  return (
    <div className="py-20 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-center text-accent mb-6 shadow-sm">
        <Camera className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-xl font-heading font-medium text-fg-light dark:text-fg-dark mb-2">
        {title}
      </h3>
      <p className="text-sm text-fg-light-muted dark:text-fg-dark-muted mb-6 leading-relaxed">
        {description}
      </p>
      {showBackHome && (
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-fg hover:bg-accent-hover transition-colors text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าแรก</span>
        </Link>
      )}
    </div>
  );
};
