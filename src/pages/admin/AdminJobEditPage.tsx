import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Star,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Save,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { CATEGORIES } from '../../types';
import type { Job, Category } from '../../types';
import { formatThaiDate } from '../../lib/utils';
import { useToast } from '../../components/common/Toast';

export const AdminJobEditPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const {
    getJobById,
    updateJob,
    uploadAndAddPhoto,
    deletePhoto,
    reorderPhotos,
    setCoverPhoto,
  } = useJobs(undefined, false);
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [deleteConfirmPhotoId, setDeleteConfirmPhotoId] = useState<string | null>(null);

  // Form edit fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // โหลดข้อมูลงาน
  const loadJob = async () => {
    if (!jobId) return;
    setLoading(true);
    const data = await getJobById(jobId);
    if (data) {
      setJob(data);
      setTitle(data.title);
      setCategory(data.category);
      setEventDate(data.event_date);
      setDescription(data.description || '');
      setIsPublished(data.is_published);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="py-20 text-center font-heading text-fg-light-muted dark:text-fg-dark-muted animate-pulse">
        กำลังโหลดข้อมูลงานและรูปภาพ...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-rose-500 font-heading">ไม่พบข้อมูลงานนี้ในระบบ</p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-fg text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังหน้ารายการงาน</span>
        </Link>
      </div>
    );
  }

  const photos = job.photos || [];
  const currentPhotoCount = photos.length;
  const maxPhotos = 20;

  // บันทึกการแก้ไขข้อมูลรายละเอียดงาน
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    const res = await updateJob(job.id, {
      title,
      category,
      event_date: eventDate,
      description,
      is_published: isPublished,
    });
    setIsSavingMeta(false);

    if (res.success) {
      showToast('บันทึกข้อมูลงานเรียบร้อยแล้ว', 'success');
      setJob((prev) => (prev ? { ...prev, title, category, event_date: eventDate, description, is_published: isPublished } : null));
    } else {
      showToast(res.error || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  // จัดการการอัปโหลดหลายไฟล์พร้อมกัน
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxPhotos - currentPhotoCount;

    if (remainingSlots <= 0) {
      showToast('ไม่สามารถอัปโหลดได้ เนื่องจากมีรูปครบ 20 รูปแล้ว', 'warning');
      return;
    }

    if (fileArray.length > remainingSlots) {
      showToast(
        `สามารถเพิ่มได้อีกเพียง ${remainingSlots} รูปเท่านั้น (ระบบจะอัปโหลดเฉพาะ ${remainingSlots} รูปแรก)`,
        'warning'
      );
    }

    const filesToUpload = fileArray.slice(0, remainingSlots);
    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    const total = filesToUpload.length;

    for (let i = 0; i < total; i++) {
      const file = filesToUpload[i];
      setUploadStatusText(`กำลังย่อขนาดและอัปโหลดรูปที่ ${i + 1} จาก ${total} (${file.name})...`);
      
      const sortOrder = currentPhotoCount + i + 1;
      const res = await uploadAndAddPhoto(
        job.id,
        file,
        sortOrder,
        (progress) => {
          const overallProgress = Math.round(((i + progress / 100) / total) * 100);
          setUploadProgress(overallProgress);
        }
      );

      if (res.success) {
        successCount++;
      } else {
        showToast(`รูป "${file.name}": ${res.error}`, 'error');
      }
    }

    setUploading(false);
    setUploadProgress(100);
    setUploadStatusText('');
    showToast(`อัปโหลดสำเร็จ ${successCount} รูป`, 'success');
    await loadJob();
  };

  // จัดการ Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesUpload(e.dataTransfer.files);
  };

  // ตั้งเป็นรูปปก
  const handleSetCover = async (photoId: string) => {
    const res = await setCoverPhoto(job.id, photoId);
    if (res.success) {
      setJob((prev) => (prev ? { ...prev, cover_photo_id: photoId } : null));
      showToast('กำหนดรูปปกเรียบร้อยแล้ว', 'success');
    } else {
      showToast('ไม่สามารถเปลี่ยนรูปปกได้', 'error');
    }
  };

  // สลับลำดับรูป (เลื่อนขึ้น/ลง)
  const handleMovePhoto = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;

    const orderedIds = newPhotos.map((p) => p.id);
    const res = await reorderPhotos(job.id, orderedIds);
    if (res.success) {
      setJob((prev) => (prev ? { ...prev, photos: newPhotos } : null));
    } else {
      showToast('ไม่สามารถจัดลำดับได้', 'error');
    }
  };

  // ลบรูป
  const handleDeletePhoto = async () => {
    if (!deleteConfirmPhotoId) return;
    const res = await deletePhoto(deleteConfirmPhotoId, job.id);
    if (res.success) {
      showToast('ลบรูปภาพเรียบร้อยแล้ว', 'success');
      await loadJob();
    } else {
      showToast(res.error || 'เกิดข้อผิดพลาดในการลบรูป', 'error');
    }
    setDeleteConfirmPhotoId(null);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="w-10 h-10 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-center text-fg-light dark:text-fg-dark hover:text-accent transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent font-heading font-medium tracking-wider uppercase">
                {CATEGORIES[category]?.title || category}
              </span>
              <span className="text-xs text-fg-light-muted dark:text-fg-dark-muted">•</span>
              <span className="text-xs text-fg-light-muted dark:text-fg-dark-muted">
                {formatThaiDate(eventDate)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-light text-fg-light dark:text-fg-dark tracking-tight">
              {title || 'จัดการงานภาพถ่าย'}
            </h1>
          </div>
        </div>

        {/* View on Public site button */}
        <Link
          to={CATEGORIES[category]?.path || `/${category}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-xs font-medium text-fg-light dark:text-fg-dark hover:text-accent transition-colors self-start sm:self-auto"
        >
          <span>ดูในหน้าเว็บสาธารณะ</span>
          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </Link>
      </div>

      {/* Section 1: Edit Job Metadata Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light/60 dark:border-border-dark/60">
          <h2 className="text-lg font-heading font-medium text-fg-light dark:text-fg-dark">
            ข้อมูลและสถานะของงาน
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPublished
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
              }`}
            >
              {isPublished ? '● เผยแพร่อยู่ (Public)' : '○ แบบร่าง (ซ่อน)'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveMetadata} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                หมวดหมู่งาน
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              >
                <option value="wedding">งานแต่งงาน (Wedding)</option>
                <option value="ordination">งานบวช (Ordination)</option>
                <option value="events">งานอื่นๆ (Events)</option>
              </select>
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                ชื่องาน
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Date */}
            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                วันที่จัดงาน
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                คำอธิบาย / รายละเอียด
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น บรรยากาศงานเลี้ยงตอนค่ำท่ามกลางแสงเทียน"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Toggle Published & Save Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border-light dark:bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              <span className="text-xs font-medium text-fg-light dark:text-fg-dark">
                เผยแพร่ให้คนทั่วไปมองเห็น
              </span>
            </label>

            <button
              type="submit"
              disabled={isSavingMeta}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors text-xs shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingMeta ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขข้อมูล'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Photo Manager & Uploader */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-heading font-light text-fg-light dark:text-fg-dark tracking-tight">
                รูปภาพในอัลบั้ม
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium font-heading ${
                  currentPhotoCount >= 10 && currentPhotoCount <= 20
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-accent/15 text-accent border border-accent/30'
                }`}
              >
                {currentPhotoCount} / 20 รูป
              </span>
            </div>
            <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted font-light mt-1">
              ระบบจะย่อขนาดให้อัตโนมัติ (~2000px ภาพหลัก และ ~600px ภาพขนาดย่อ) ลากวางเพื่ออัปโหลด
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || currentPhotoCount >= maxPhotos}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-fg text-xs font-medium hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>เลือกรูปภาพเพื่ออัปโหลด</span>
          </button>
        </div>

        {/* Warning if photos < 10 */}
        {currentPhotoCount < 10 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">
                ข้อแนะนำ: ปัจจุบันมีรูปในอัลบั้ม {currentPhotoCount} รูป
              </p>
              <p className="opacity-90 mt-0.5">
                แนะนำให้อัปโหลดระหว่าง 10-20 รูปต่องาน เพื่อให้แกลเลอรี่ดูเต็มอิ่มและแสดงผลในแบบ Masonry ได้สวยงามที่สุด
              </p>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFilesUpload(e.target.files)}
          className="hidden"
        />

        {/* Drag & Drop Upload Zone */}
        {currentPhotoCount < maxPhotos && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
              isDragging
                ? 'border-accent bg-accent/10 scale-[1.01]'
                : 'border-border-light dark:border-border-dark bg-card-light/30 dark:bg-card-dark/30 hover:border-accent/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-center text-accent mb-4 shadow-sm">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-heading font-medium text-fg-light dark:text-fg-dark">
              ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </h3>
            <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted mt-1 font-light">
              เลือกได้หลายรูปพร้อมกัน (รองรับ JPG, PNG, WebP) สามารถเพิ่มได้อีก {maxPhotos - currentPhotoCount} รูป
            </p>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="p-5 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark space-y-2 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-accent">{uploadStatusText}</span>
              <span className="font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-card-light-subtle dark:bg-card-dark-subtle overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Photos Grid */}
        {currentPhotoCount === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-border-light dark:border-border-dark p-8">
            <ImageIcon className="w-12 h-12 text-fg-light-muted dark:text-fg-dark-muted mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-heading font-medium text-fg-light dark:text-fg-dark mb-1">
              ยังไม่มีรูปภาพในอัลบั้มนี้
            </h4>
            <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted">
              ลากไฟล์มาวางด้านบนเพื่อเริ่มอัปโหลดรูปภาพ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {photos.map((photo, index) => {
              const isCover = job.cover_photo_id === photo.id || index === 0;

              return (
                <div
                  key={photo.id}
                  className={`group rounded-2xl overflow-hidden bg-card-light dark:bg-card-dark border transition-all duration-300 flex flex-col justify-between shadow-sm relative ${
                    isCover
                      ? 'border-accent shadow-md shadow-accent/10 ring-2 ring-accent/30'
                      : 'border-border-light dark:border-border-dark hover:border-accent/40'
                  }`}
                >
                  {/* Photo Preview */}
                  <div className="relative aspect-[4/3] bg-card-light-subtle dark:bg-card-dark-subtle overflow-hidden">
                    <img
                      src={photo.thumb_path || photo.storage_path}
                      alt={photo.alt_text || `ภาพที่ ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Order Index Badge */}
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                      #{index + 1}
                    </div>

                    {/* Cover Photo Badge */}
                    {isCover && (
                      <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-accent text-accent-fg text-[10px] font-medium flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>รูปปก</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="p-3 bg-card-light-subtle/50 dark:bg-card-dark-subtle/50 flex items-center justify-between gap-1 text-xs">
                    {/* Cover toggle */}
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        isCover
                          ? 'text-accent font-semibold'
                          : 'text-fg-light-muted dark:text-fg-dark-muted hover:text-accent'
                      }`}
                      title={isCover ? 'นี่คือรูปปกของงานนี้' : 'คลิกเพื่อตั้งเป็นรูปปก'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-current' : ''}`} />
                      <span>{isCover ? 'รูปปก' : 'ตั้งเป็นปก'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePhoto(index, 'up')}
                        className="p-1 rounded-md text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark disabled:opacity-30"
                        title="ย้ายขึ้น"
                        aria-label="ย้ายรูปขึ้น"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === photos.length - 1}
                        onClick={() => handleMovePhoto(index, 'down')}
                        className="p-1 rounded-md text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark disabled:opacity-30"
                        title="ย้ายลง"
                        aria-label="ย้ายรูปลง"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPhotoId(photo.id)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
                        title="ลบรูปนี้"
                        aria-label="ลบรูปนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Photo Confirmation Modal */}
      {deleteConfirmPhotoId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-sm w-full rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-medium text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>ยืนยันการลบรูปภาพ</span>
            </h3>
            <p className="text-xs text-fg-light dark:text-fg-dark leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้ออกจากอัลบั้ม? ไฟล์จะถูกลบออกจากระบบอย่างถาวร
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light dark:border-border-dark">
              <button
                onClick={() => setDeleteConfirmPhotoId(null)}
                className="px-4 py-2 rounded-full border border-border-light dark:border-border-dark text-xs font-medium hover:bg-card-light-subtle dark:hover:bg-card-dark-subtle transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeletePhoto}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors shadow-sm"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
