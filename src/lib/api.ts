import type { Job, Photo, SiteSettings, Category } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
const TOKEN_STORAGE_KEY = '24p_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data && data.error) || `HTTP error ${response.status}`);
  }

  return data as T;
}

// ==========================================
// Auth API
// ==========================================
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const apiAuth = {
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AuthUser }> {
    const res = await request<{ success: boolean; token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async me(): Promise<{ success: boolean; user: AuthUser }> {
    return request<{ success: boolean; user: AuthUser }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
    }
  },
};

// ==========================================
// Settings API
// ==========================================
export const apiSettings = {
  async get(): Promise<SiteSettings> {
    const res = await request<{ success: boolean; settings: SiteSettings }>('/api/settings');
    return res.settings;
  },

  async update(settings: Partial<SiteSettings>): Promise<void> {
    await request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// ==========================================
// Jobs API
// ==========================================
export const apiJobs = {
  async list(category?: Category, publishedOnly: boolean = true): Promise<Job[]> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (!publishedOnly) params.set('publishedOnly', 'false');
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await request<{ success: boolean; jobs: Job[] }>(`/api/jobs${qs}`);
    return res.jobs;
  },

  async getById(id: string): Promise<Job> {
    const res = await request<{ success: boolean; job: Job }>(`/api/jobs/${id}`);
    return res.job;
  },

  async create(job: {
    category: Category;
    title: string;
    description?: string;
    event_date: string;
    is_published?: boolean;
    sort_order?: number;
  }): Promise<Job> {
    const res = await request<{ success: boolean; job: Job }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
    return res.job;
  },

  async update(id: string, updates: Partial<Job>): Promise<void> {
    // Exclude computed arrays from job table update
    const { photos, photo_count, cover_photo, ...payload } = updates;
    await request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<void> {
    await request(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// Photos API
// ==========================================
export const apiPhotos = {
  async upload(
    jobId: string,
    mainBlob: Blob,
    thumbBlob: Blob,
    sortOrder: number,
    altText: string,
    width?: number,
    height?: number
  ): Promise<Photo> {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('sort_order', sortOrder.toString());
    formData.append('alt_text', altText);
    if (width) formData.append('width', width.toString());
    if (height) formData.append('height', height.toString());
    formData.append('main', mainBlob, 'main.webp');
    formData.append('thumb', thumbBlob, 'thumb.webp');

    const res = await request<{ success: boolean; photo: Photo }>('/api/photos/upload', {
      method: 'POST',
      body: formData,
    });
    return res.photo;
  },

  async delete(photoId: string): Promise<void> {
    await request(`/api/photos/${photoId}`, {
      method: 'DELETE',
    });
  },

  async reorder(jobId: string, orderedPhotoIds: string[]): Promise<void> {
    await request('/api/photos/reorder', {
      method: 'PUT',
      body: JSON.stringify({ jobId, orderedPhotoIds }),
    });
  },
};
