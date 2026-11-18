import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Layers
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { CATEGORIES } from '../../types';
import type { Job, Category } from '../../types';
import { formatThaiDate } from '../../lib/utils';
import { JobFormModal } from '../../components/admin/JobFormModal';
import { useToast } from '../../components/common/Toast';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, loading, createJob, updateJob, deleteJob } = useJobs(undefined, false);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<Job | null>(null);

  // สรุปสถิติ
  const totalJobs = jobs.length;
  const publishedJobs = jobs.filter((j) => j.is_published).length;
  const draftJobs = totalJobs - publishedJobs;
  const totalPhotos = jobs.reduce(
    (sum, j) => sum + (j.photo_count || j.photos?.length || 0),
    0
  );

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || job.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && job.is_published) ||
      (statusFilter === 'draft' && !job.is_published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateOrUpdateJob = async (jobData: {
    category: Category;
    title: string;
    description: string;
    event_date: string;
    is_published: boolean;
    sort_order: number;
  }) => {
    if (editingJob) {
      const res = await updateJob(editingJob.id, jobData);
      if (res.success) {
        showToast('แก้ไขข้อมูลงานเรียบร้อยแล้ว', 'success');
      } else {
        showToast(res.error || 'เกิดข้อผิดพลาดในการแก้ไข', 'error');
      }
    } else {
      const res = await createJob(jobData);
      if (res.success && res.job) {
        showToast('สร้างงานใหม่เรียบร้อยแล้ว! กำลังเปิดหน้าจัดการรูปภาพ', 'success');
        navigate(`/admin/job/${res.job.id}`);
      } else {
        showToast(res.error || 'เกิดข้อผิดพลาดในการสร้างงาน', 'error');
      }
    }
  };

  const handleTogglePublish = async (job: Job) => {
    const newStatus = !job.is_published;
    const res = await updateJob(job.id, { is_published: newStatus });
    if (res.success) {
      showToast(
        newStatus
          ? `เผยแพร่งาน "${job.title}" เรียบร้อยแล้ว`
          : `ซ่อนงาน "${job.title}" เป็นแบบร่างแล้ว`,
        'info'
      );
    } else {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error');
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteConfirmJob) return;
    const res = await deleteJob(deleteConfirmJob.id);
    if (res.success) {
      showToast(`ลบงาน "${deleteConfirmJob.title}" เรียบร้อยแล้ว`, 'success');
    } else {
      showToast(res.error || 'เกิดข้อผิดพลาดในการลบงาน', 'error');
    }
    setDeleteConfirmJob(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight">
            จัดการงานและแกลเลอรี่ภาพ
          </h1>
          <p className="text-xs sm:text-sm text-fg-light-muted dark:text-fg-dark-muted font-light mt-1">
            เพิ่มผลงานใหม่ อัปโหลดและจัดระเบียบรูปภาพ 10-20 รูปต่ออัลบั้ม
          </p>
        </div>

        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors shadow-lg text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผลงานใหม่</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-fg-light-muted dark:text-fg-dark-muted font-heading uppercase tracking-wider block">
              ผลงานทั้งหมด
            </span>
            <span className="text-2xl sm:text-3xl font-heading font-light text-fg-light dark:text-fg-dark mt-1 block">
              {totalJobs}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle flex items-center justify-center text-accent">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-fg-light-muted dark:text-fg-dark-muted font-heading uppercase tracking-wider block">
              เผยแพร่อยู่ (Public)
            </span>
            <span className="text-2xl sm:text-3xl font-heading font-light text-emerald-500 mt-1 block">
              {publishedJobs}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-fg-light-muted dark:text-fg-dark-muted font-heading uppercase tracking-wider block">
              แบบร่าง (Draft)
            </span>
            <span className="text-2xl sm:text-3xl font-heading font-light text-amber-500 mt-1 block">
              {draftJobs}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-fg-light-muted dark:text-fg-dark-muted font-heading uppercase tracking-wider block">
              รูปภาพในระบบ
            </span>
            <span className="text-2xl sm:text-3xl font-heading font-light text-accent mt-1 block">
              {totalPhotos}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-fg-light-muted dark:text-fg-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่องานหรือคำอธิบาย..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-xs sm:text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-xs">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-fg-light dark:text-fg-dark focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="wedding">งานแต่งงาน</option>
              <option value="ordination">งานบวช</option>
              <option value="events">งานอื่นๆ</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-fg-light dark:text-fg-dark focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="published">เฉพาะที่เผยแพร่</option>
              <option value="draft">เฉพาะแบบร่าง (Draft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List Grid / Cards */}
      {loading ? (
        <div className="text-center py-12 text-sm text-fg-light-muted dark:text-fg-dark-muted font-heading animate-pulse">
          กำลังโหลดรายการงาน...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border-light dark:border-border-dark bg-card-light/20 dark:bg-card-dark/20 p-8">
          <Layers className="w-10 h-10 text-fg-light-muted dark:text-fg-dark-muted mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-heading font-medium text-fg-light dark:text-fg-dark mb-1">
            ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา
          </h4>
          <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มผลงานใหม่" เพื่อเริ่มต้น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const coverPhotoUrl =
              job.cover_photo?.thumb_path ||
              job.cover_photo?.storage_path ||
              job.photos?.[0]?.thumb_path ||
              job.photos?.[0]?.storage_path ||
              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80';
            const catInfo = CATEGORIES[job.category];
            const count = job.photo_count || job.photos?.length || 0;

            return (
              <div
                key={job.id}
                className="group rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-accent/40 transition-all duration-300"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] bg-card-light-subtle dark:bg-card-dark-subtle overflow-hidden">
                  <img
                    src={coverPhotoUrl}
                    alt={job.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium font-heading">
                      {catInfo?.title || job.category}
                    </span>
                  </div>

                  {/* Publish Status Toggle Badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleTogglePublish(job)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-md border transition-colors ${
                        job.is_published
                          ? 'bg-emerald-500/80 border-emerald-400 text-white hover:bg-emerald-600'
                          : 'bg-amber-500/80 border-amber-400 text-black hover:bg-amber-600'
                      }`}
                      title={job.is_published ? 'คลิกเพื่อซ่อนเป็นแบบร่าง' : 'คลิกเพื่อเผยแพร่'}
                    >
                      {job.is_published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>เผยแพร่อยู่</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>แบบร่าง (ซ่อน)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Photo Count badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-accent" />
                    <span>{count} / 20 รูป</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-fg-light-muted dark:text-fg-dark-muted font-medium">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{formatThaiDate(job.event_date)}</span>
                    </div>

                    <h3 className="text-lg font-heading font-medium text-fg-light dark:text-fg-dark line-clamp-2">
                      {job.title}
                    </h3>

                    {job.description && (
                      <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted line-clamp-2 font-light">
                        {job.description}
                      </p>
                    )}

                    {count < 10 && (
                      <p className="text-[11px] text-amber-500 font-medium">
                        ⚠️ ปัจจุบันมี {count} รูป (แนะนำ 10-20 รูป)
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/admin/job/${job.id}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>จัดการรูปภาพ ({count})</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingJob(job);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl border border-border-light dark:border-border-dark text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark hover:bg-card-light-subtle dark:hover:bg-card-dark-subtle transition-colors"
                      title="แก้ไขข้อมูลงาน"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmJob(job)}
                      className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="ลบงานนี้"
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

      {/* Job Create/Edit Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleCreateOrUpdateJob}
        initialData={editingJob}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-heading font-medium text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>ยืนยันการลบผลงาน</span>
            </h3>
            <p className="text-sm text-fg-light dark:text-fg-dark">
              คุณแน่ใจหรือไม่ว่าต้องการลบงาน "<strong>{deleteConfirmJob.title}</strong>"?
            </p>
            <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted">
              การกระทำนี้จะลบงานและรูปภาพทั้งหมดในอัลบั้มนี้ออกจากระบบ และไม่สามารถกู้คืนได้
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
              <button
                onClick={() => setDeleteConfirmJob(null)}
                className="px-5 py-2.5 rounded-full border border-border-light dark:border-border-dark text-xs font-medium hover:bg-card-light-subtle dark:hover:bg-card-dark-subtle transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteJob}
                className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20"
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
