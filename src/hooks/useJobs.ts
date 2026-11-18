import { useState, useEffect, useCallback } from 'react';
import type { Job, Photo, Category } from '../types';
import { apiJobs, apiPhotos } from '../lib/api';
import { INITIAL_JOBS } from '../lib/mockData';
import { resizeImageClient } from '../lib/utils';

const JOBS_STORAGE_KEY = 'palm_jobs_data';

export function useJobs(category?: Category, publishedOnly: boolean = true) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงรายการงานทั้งหมด
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiJobs.list(category, publishedOnly);
      if (data && Array.isArray(data)) {
        setJobs(data);
        localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err: unknown) {
      console.warn('API fetch jobs failed, fallback to local cache:', err);
      try {
        const stored = localStorage.getItem(JOBS_STORAGE_KEY);
        let list: Job[] = stored ? JSON.parse(stored) : INITIAL_JOBS;

        if (publishedOnly) {
          list = list.filter((j) => j.is_published);
        }
        if (category) {
          list = list.filter((j) => j.category === category);
        }

        list.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

        list = list.map((job) => {
          const sortedPhotos = [...(job.photos || [])].sort((a, b) => a.sort_order - b.sort_order);
          const cover = sortedPhotos.find((p) => p.id === job.cover_photo_id) || sortedPhotos[0];
          return {
            ...job,
            photos: sortedPhotos,
            cover_photo: cover,
            photo_count: sortedPhotos.length,
          };
        });

        setJobs(list);
      } catch {
        setJobs(INITIAL_JOBS);
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [category, publishedOnly]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ดึงรายละเอียดงานเดี่ยวตาม ID
  const getJobById = useCallback(async (id: string): Promise<Job | null> => {
    try {
      const job = await apiJobs.getById(id);
      return job;
    } catch {
      // Fallback
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const list: Job[] = stored ? JSON.parse(stored) : INITIAL_JOBS;
      const found = list.find((j) => j.id === id);
      if (!found) return null;
      const sortedPhotos = [...(found.photos || [])].sort((a, b) => a.sort_order - b.sort_order);
      return {
        ...found,
        photos: sortedPhotos,
        cover_photo: sortedPhotos.find((p) => p.id === found.cover_photo_id) || sortedPhotos[0],
        photo_count: sortedPhotos.length,
      };
    }
  }, []);

  // สร้างงานใหม่
  const createJob = async (
    jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'photos' | 'photo_count'>
  ): Promise<{ success: boolean; job?: Job; error?: string }> => {
    try {
      const newJob = await apiJobs.create(jobData);
      await fetchJobs();
      return { success: true, job: newJob };
    } catch (err: unknown) {
      console.warn('API create job failed, falling back to local storage:', err);
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const currentList: Job[] = stored ? JSON.parse(stored) : [...INITIAL_JOBS];
      const newJob: Job = {
        ...jobData,
        id: crypto.randomUUID ? crypto.randomUUID() : `job-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        photos: [],
        photo_count: 0,
      };
      const updatedList = [newJob, ...currentList];
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedList));
      await fetchJobs();
      return { success: true, job: newJob };
    }
  };

  // แก้ไขงาน
  const updateJob = async (
    id: string,
    updates: Partial<Job>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiJobs.update(id, updates);
      await fetchJobs();
      return { success: true };
    } catch (err: unknown) {
      console.warn('API update job failed, fallback to local:', err);
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const currentList: Job[] = stored ? JSON.parse(stored) : [...INITIAL_JOBS];
      const index = currentList.findIndex((j) => j.id === id);
      if (index === -1) return { success: false, error: 'ไม่พบงานที่ต้องการแก้ไข' };

      currentList[index] = {
        ...currentList[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(currentList));
      await fetchJobs();
      return { success: true };
    }
  };

  // ลบงาน
  const deleteJob = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiJobs.delete(id);
      await fetchJobs();
      return { success: true };
    } catch (err: unknown) {
      console.warn('API delete job failed, fallback to local:', err);
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const currentList: Job[] = stored ? JSON.parse(stored) : [...INITIAL_JOBS];
      const filtered = currentList.filter((j) => j.id !== id);
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filtered));
      await fetchJobs();
      return { success: true };
    }
  };

  // อัปโหลดและเพิ่มรูปภาพลงในงาน
  const uploadAndAddPhoto = async (
    jobId: string,
    file: File,
    sortOrder: number,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; photo?: Photo; error?: string }> => {
    try {
      if (onProgress) onProgress(15);

      // ย่อภาพก่อนอัปโหลด: ภาพหลัก max 2000px (คุณภาพ 0.82), thumbnail max 600px (คุณภาพ 0.80)
      const [mainImage, thumbImage] = await Promise.all([
        resizeImageClient(file, 2000, 0.82),
        resizeImageClient(file, 600, 0.80),
      ]);

      if (onProgress) onProgress(45);

      // เรียก Cloudflare Worker API Upload
      const photo = await apiPhotos.upload(
        jobId,
        mainImage.blob,
        thumbImage.blob,
        sortOrder,
        file.name.replace(/\.[^/.]+$/, ''),
        mainImage.width,
        mainImage.height
      );

      if (onProgress) onProgress(100);
      await fetchJobs();
      return { success: true, photo };
    } catch (err: unknown) {
      console.warn('Cloudflare R2/D1 upload failed, falling back to local cache:', err);

      // Fallback สำหรับโหมดออฟไลน์
      if (onProgress) onProgress(80);
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const currentList: Job[] = stored ? JSON.parse(stored) : [...INITIAL_JOBS];
      const jobIndex = currentList.findIndex((j) => j.id === jobId);

      if (jobIndex === -1) {
        return { success: false, error: 'ไม่พบงาน' };
      }

      const currentPhotos = currentList[jobIndex].photos || [];
      if (currentPhotos.length >= 20) {
        return { success: false, error: 'แต่ละงานสามารถมีรูปภาพได้ไม่เกิน 20 รูป' };
      }

      const [mainImage, thumbImage] = await Promise.all([
        resizeImageClient(file, 2000, 0.82),
        resizeImageClient(file, 600, 0.80),
      ]);

      const fileId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newPhoto: Photo = {
        id: fileId,
        job_id: jobId,
        storage_path: mainImage.dataUrl,
        thumb_path: thumbImage.dataUrl,
        sort_order: sortOrder,
        width: mainImage.width,
        height: mainImage.height,
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
        created_at: new Date().toISOString(),
      };

      const updatedPhotos = [...currentPhotos, newPhoto];
      currentList[jobIndex].photos = updatedPhotos;
      currentList[jobIndex].photo_count = updatedPhotos.length;
      if (!currentList[jobIndex].cover_photo_id) {
        currentList[jobIndex].cover_photo_id = newPhoto.id;
      }

      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(currentList));
      if (onProgress) onProgress(100);
      await fetchJobs();
      return { success: true, photo: newPhoto };
    }
  };

  // ลบรูปภาพเดี่ยว
  const deletePhoto = async (photoId: string, jobId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiPhotos.delete(photoId);
      await fetchJobs();
      return { success: true };
    } catch (err: unknown) {
      console.warn('API delete photo failed, fallback to local:', err);
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const currentList: Job[] = stored ? JSON.parse(stored) : [...INITIAL_JOBS];
      const jobIndex = currentList.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) return { success: false, error: 'ไม่พบงาน' };

      const photos = (currentList[jobIndex].photos || []).filter((p) => p.id !== photoId);
      currentList[jobIndex].photos = photos;
      currentList[jobIndex].photo_count = photos.length;

      if (currentList[jobIndex].cover_photo_id === photoId) {
        currentList[jobIndex].cover_photo_id = photos[0]?.id || undefined;
      }

      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(currentList));
      await fetchJobs();
      return { success: true };
    }
  };

  // สลับ/จัดลำดับรูปภาพ
  const reorderPhotos = async (
    jobId: string,
    orderedPhotoIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiPhotos.reorder(jobId, orderedPhotoIds);
      await fetchJobs();
      return { success: true };
    } catch (err: unknown) {
      console.warn('API reorder photos failed, fallback to local:', err);
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      const currentList: Job[] = stored ? JSON.parse(stored) : [...INITIAL_JOBS];
      const jobIndex = currentList.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) return { success: false, error: 'ไม่พบงาน' };

      const photos = currentList[jobIndex].photos || [];
      const updatedPhotos = orderedPhotoIds
        .map((id, index) => {
          const photo = photos.find((p) => p.id === id);
          if (photo) {
            return { ...photo, sort_order: index + 1 };
          }
          return null;
        })
        .filter(Boolean) as Photo[];

      currentList[jobIndex].photos = updatedPhotos;
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(currentList));
      await fetchJobs();
      return { success: true };
    }
  };

  // กำหนดรูปปกของงาน
  const setCoverPhoto = async (jobId: string, photoId: string): Promise<{ success: boolean; error?: string }> => {
    return updateJob(jobId, { cover_photo_id: photoId });
  };

  return {
    jobs,
    loading,
    error,
    refresh: fetchJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    uploadAndAddPhoto,
    deletePhoto,
    reorderPhotos,
    setCoverPhoto,
  };
}
