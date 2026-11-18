import React, { useState } from 'react';
import { X, Calendar, Tag, FileText } from 'lucide-react';
import { CATEGORIES } from '../../types';
import type { Category, Job } from '../../types';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: {
    category: Category;
    title: string;
    description: string;
    event_date: string;
    is_published: boolean;
    sort_order: number;
  }) => Promise<void>;
  initialData?: Job | null;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [category, setCategory] = useState<Category>(initialData?.category || 'wedding');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [eventDate, setEventDate] = useState(
    initialData?.event_date || new Date().toISOString().split('T')[0]
  );
  const [isPublished, setIsPublished] = useState(
    initialData !== undefined && initialData !== null ? initialData.is_published : true
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('กรุณากรอกชื่องาน');
      return;
    }
    if (!eventDate) {
      setErrorMsg('กรุณาเลือกวันที่จัดงาน');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        event_date: eventDate,
        is_published: isPublished,
        sort_order: initialData?.sort_order || 0,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-lg w-full rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-light dark:border-border-dark mb-6">
          <h3 className="text-xl font-heading font-medium text-fg-light dark:text-fg-dark">
            {initialData ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงานใหม่ในแกลเลอรี่'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-fg-light-muted dark:text-fg-dark-muted hover:text-accent hover:bg-card-light-subtle dark:hover:bg-card-dark-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
              หมวดหมู่งาน *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as Category[]).map((catKey) => (
                <button
                  type="button"
                  key={catKey}
                  onClick={() => setCategory(catKey)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-medium border text-center transition-all ${
                    category === catKey
                      ? 'bg-accent text-accent-fg border-accent shadow-sm'
                      : 'bg-card-light-subtle dark:bg-card-dark-subtle text-fg-light dark:text-fg-dark border-border-light dark:border-border-dark hover:border-accent/40'
                  }`}
                >
                  {CATEGORIES[catKey].title}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
              ชื่องาน *
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-fg-light-muted dark:text-fg-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น พิธีฉลองมงคลสมรส คุณบี & คุณเอ"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
              วันที่จัดงาน *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-fg-light-muted dark:text-fg-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
              รายละเอียด / บรรยากาศของงาน (ไม่บังคับ)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-fg-light-muted dark:text-fg-dark-muted absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น บรรยากาศงานเลี้ยงฉลองตอนค่ำท่ามกลางแสงเทียนและเพื่อนสนิท"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark">
            <div>
              <span className="text-xs font-medium text-fg-light dark:text-fg-dark block font-heading">
                เผยแพร่ทันที (แสดงบนหน้าเว็บ)
              </span>
              <span className="text-[11px] text-fg-light-muted dark:text-fg-dark-muted">
                หากปิดไว้ งานนี้จะถูกบันทึกเป็นแบบร่าง (Draft) คนทั่วไปจะไม่เห็น
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border-light dark:bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border-light dark:border-border-dark text-fg-light dark:text-fg-dark hover:bg-card-light-subtle dark:hover:bg-card-dark-subtle transition-colors text-xs font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-accent text-accent-fg hover:bg-accent-hover transition-colors text-xs font-medium shadow-md disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'สร้างงานและไปอัปโหลดรูปภาพ →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
