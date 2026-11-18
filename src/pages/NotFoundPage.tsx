import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-center text-accent mx-auto shadow-sm">
          <Camera className="w-10 h-10 opacity-70" />
        </div>
        <div>
          <span className="text-accent text-xs font-semibold font-heading tracking-widest uppercase block mb-1">
            404 NOT FOUND
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight">
            ไม่พบหน้าที่คุณค้นหา
          </h1>
          <p className="text-xs sm:text-sm text-fg-light-muted dark:text-fg-dark-muted font-light mt-2 leading-relaxed">
            หน้านี้อาจถูกย้าย ลบออกไปแล้ว หรือลิงก์อาจไม่ถูกต้อง
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-fg hover:bg-accent-hover transition-colors text-xs font-medium shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าแรก</span>
        </Link>
      </div>
    </div>
  );
};
