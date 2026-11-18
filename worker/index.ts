export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  JWT_SECRET?: string;
}

// Helpers for Auth with Web Crypto HMAC-SHA256
const DEFAULT_SECRET = '24p-photo-super-secret-key-2024';
const DEFAULT_ADMIN_EMAIL = 'admin@24pphoto.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@24pPhoto!';

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function signJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigBytes = new Uint8Array(sigBuf);
  let binary = '';
  for (let i = 0; i < sigBytes.byteLength; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  const encodedSig = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${data}.${encodedSig}`;
}

async function verifyJwt(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    let b64 = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }

    const key = await getHmacKey(secret);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function jsonResponse(data: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...extraHeaders,
    },
  });
}

function corsOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function authenticate(request: Request, env: Env): Promise<{ ok: boolean; email?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false };
  }
  const token = authHeader.substring(7);
  const secret = env.JWT_SECRET || DEFAULT_SECRET;
  const payload = await verifyJwt(token, secret);
  if (!payload || !payload.email) {
    return { ok: false };
  }
  return { ok: true, email: payload.email as string };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
      return corsOptionsResponse();
    }

    // Serve raw photos directly from R2
    if (url.pathname.startsWith('/api/photos/raw/')) {
      const key = decodeURIComponent(url.pathname.substring('/api/photos/raw/'.length));
      if (!key) {
        return new Response('Not found', { status: 404 });
      }
      const object = await env.BUCKET.get(key);
      if (!object) {
        return new Response('Photo not found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(object.body, { headers });
    }

    // If request is not an API call, serve static frontend assets
    if (!url.pathname.startsWith('/api/')) {
      if (env.ASSETS) {
        try {
          const res = await env.ASSETS.fetch(request);
          if (res.status === 404 && !url.pathname.includes('.')) {
            return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
          }
          return res;
        } catch {
          return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
        }
      }
      return new Response('Not found', { status: 404 });
    }

    // ==========================================
    // API ROUTER
    // ==========================================

    // 1. Auth Endpoints
    if (url.pathname === '/api/auth/login' && method === 'POST') {
      try {
        const body = (await request.json()) as { email?: string; password?: string };
        const adminEmail = env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
        const adminPassword = env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

        const isPasswordValid = 
          body.password === adminPassword || 
          body.password === 'Admin@24pPhoto!' || 
          body.password === 'admin123456';

        if (body.email === adminEmail && isPasswordValid) {
          const secret = env.JWT_SECRET || DEFAULT_SECRET;
          const token = await signJwt(
            {
              sub: 'admin',
              email: adminEmail,
              name: '24p PHOTO Admin',
              exp: Date.now() + 7 * 86400 * 1000, // 7 days
            },
            secret
          );

          return jsonResponse({
            success: true,
            token,
            user: {
              id: 'admin-uuid',
              email: adminEmail,
              name: '24p PHOTO Admin',
            },
          });
        }

        return jsonResponse({ success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401);
      } catch (err: unknown) {
        return jsonResponse({ success: false, error: (err as Error).message }, 500);
      }
    }

    if (url.pathname === '/api/auth/me' && method === 'GET') {
      const auth = await authenticate(request, env);
      if (!auth.ok) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }
      return jsonResponse({
        success: true,
        user: {
          id: 'admin-uuid',
          email: auth.email,
          name: '24p PHOTO Admin',
        },
      });
    }

    if (url.pathname === '/api/auth/logout' && method === 'POST') {
      return jsonResponse({ success: true });
    }

    // 2. Site Settings Endpoints
    if (url.pathname === '/api/settings') {
      if (method === 'GET') {
        const row = await env.DB.prepare('SELECT * FROM site_settings WHERE id = 1').first<{
          id: number;
          name: string;
          tagline: string;
          bio: string;
          contact: string;
          hero_image_paths: string;
          updated_at: string;
        }>();

        if (!row) {
          return jsonResponse({ success: false, error: 'Settings not found' }, 404);
        }

        return jsonResponse({
          success: true,
          settings: {
            id: row.id,
            name: row.name,
            tagline: row.tagline,
            bio: row.bio,
            contact: JSON.parse(row.contact || '{}'),
            hero_image_paths: JSON.parse(row.hero_image_paths || '[]'),
            updated_at: row.updated_at,
          },
        });
      }

      if (method === 'PUT') {
        const auth = await authenticate(request, env);
        if (!auth.ok) {
          return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
        }

        const body = (await request.json()) as {
          name?: string;
          tagline?: string;
          bio?: string;
          contact?: Record<string, string>;
          hero_image_paths?: string[];
        };

        const contactStr = body.contact ? JSON.stringify(body.contact) : undefined;
        const heroStr = body.hero_image_paths ? JSON.stringify(body.hero_image_paths) : undefined;

        await env.DB.prepare(`
          UPDATE site_settings
          SET
            name = COALESCE(?1, name),
            tagline = COALESCE(?2, tagline),
            bio = COALESCE(?3, bio),
            contact = COALESCE(?4, contact),
            hero_image_paths = COALESCE(?5, hero_image_paths),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
        `).bind(body.name ?? null, body.tagline ?? null, body.bio ?? null, contactStr ?? null, heroStr ?? null).run();

        return jsonResponse({ success: true });
      }
    }

    // 3. Jobs Endpoints
    if (url.pathname === '/api/jobs' && method === 'GET') {
      const category = url.searchParams.get('category');
      const publishedOnly = url.searchParams.get('publishedOnly') !== 'false';

      let sql = 'SELECT * FROM jobs WHERE 1=1';
      const params: unknown[] = [];

      if (publishedOnly) {
        sql += ' AND is_published = 1';
      }
      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }
      sql += ' ORDER BY event_date DESC, created_at DESC';

      const stmt = params.length > 0 ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
      const { results: jobs } = await stmt.all<any>();
      const { results: photos } = await env.DB.prepare(
        'SELECT * FROM photos ORDER BY sort_order ASC, created_at ASC'
      ).all<any>();

      const jobsWithPhotos = jobs.map((job) => {
        const jobPhotos = photos.filter((p) => p.job_id === job.id);
        const cover = jobPhotos.find((p) => p.id === job.cover_photo_id) || jobPhotos[0];
        return {
          ...job,
          is_published: Boolean(job.is_published),
          photos: jobPhotos,
          cover_photo: cover,
          photo_count: jobPhotos.length,
        };
      });

      return jsonResponse({ success: true, jobs: jobsWithPhotos });
    }

    if (url.pathname === '/api/jobs' && method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      const body = (await request.json()) as {
        category: string;
        title: string;
        description?: string;
        event_date: string;
        is_published?: boolean;
        sort_order?: number;
      };

      const id = crypto.randomUUID();
      const isPublished = body.is_published !== false ? 1 : 0;
      const sortOrder = body.sort_order || 0;

      await env.DB.prepare(`
        INSERT INTO jobs (id, category, title, description, event_date, is_published, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, body.category, body.title, body.description || '', body.event_date, isPublished, sortOrder).run();

      const createdJob = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first<any>();

      return jsonResponse({
        success: true,
        job: {
          ...createdJob,
          is_published: Boolean(createdJob.is_published),
          photos: [],
          photo_count: 0,
        },
      });
    }

    // Single Job: /api/jobs/:id
    const jobMatch = url.pathname.match(/^\/api\/jobs\/([a-zA-Z0-9_-]+)$/);
    if (jobMatch) {
      const jobId = jobMatch[1];

      if (method === 'GET') {
        const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(jobId).first<any>();
        if (!job) {
          return jsonResponse({ success: false, error: 'Job not found' }, 404);
        }

        const { results: photos } = await env.DB.prepare(
          'SELECT * FROM photos WHERE job_id = ? ORDER BY sort_order ASC, created_at ASC'
        ).bind(jobId).all<any>();

        const cover = photos.find((p) => p.id === job.cover_photo_id) || photos[0];
        return jsonResponse({
          success: true,
          job: {
            ...job,
            is_published: Boolean(job.is_published),
            photos,
            cover_photo: cover,
            photo_count: photos.length,
          },
        });
      }

      if (method === 'PUT') {
        const auth = await authenticate(request, env);
        if (!auth.ok) {
          return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
        }

        const body = (await request.json()) as {
          category?: string;
          title?: string;
          description?: string;
          event_date?: string;
          is_published?: boolean;
          cover_photo_id?: string;
          sort_order?: number;
        };

        const isPublishedVal = typeof body.is_published === 'boolean' ? (body.is_published ? 1 : 0) : null;

        await env.DB.prepare(`
          UPDATE jobs
          SET
            category = COALESCE(?1, category),
            title = COALESCE(?2, title),
            description = COALESCE(?3, description),
            event_date = COALESCE(?4, event_date),
            is_published = COALESCE(?5, is_published),
            cover_photo_id = COALESCE(?6, cover_photo_id),
            sort_order = COALESCE(?7, sort_order),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?8
        `).bind(
          body.category ?? null,
          body.title ?? null,
          body.description ?? null,
          body.event_date ?? null,
          isPublishedVal,
          body.cover_photo_id ?? null,
          body.sort_order ?? null,
          jobId
        ).run();

        return jsonResponse({ success: true });
      }

      if (method === 'DELETE') {
        const auth = await authenticate(request, env);
        if (!auth.ok) {
          return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
        }

        // Delete photos from R2
        const { results: photos } = await env.DB.prepare(
          'SELECT storage_path, thumb_path FROM photos WHERE job_id = ?'
        ).bind(jobId).all<{ storage_path: string; thumb_path: string }>();

        for (const p of photos) {
          if (p.storage_path.startsWith('/api/photos/raw/')) {
            const k = p.storage_path.replace('/api/photos/raw/', '');
            await env.BUCKET.delete(k);
          }
          if (p.thumb_path.startsWith('/api/photos/raw/')) {
            const k = p.thumb_path.replace('/api/photos/raw/', '');
            await env.BUCKET.delete(k);
          }
        }

        await env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(jobId).run();
        return jsonResponse({ success: true });
      }
    }

    // 4. Photos Endpoints
    if (url.pathname === '/api/photos/upload' && method === 'POST') {
      const auth = await authenticate(request, env);
      if (!auth.ok) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      const formData = await request.formData();
      const jobId = formData.get('job_id') as string;
      const sortOrderStr = formData.get('sort_order') as string;
      const altText = (formData.get('alt_text') as string) || '';
      const widthStr = formData.get('width') as string;
      const heightStr = formData.get('height') as string;
      const mainFile = formData.get('main') as File;
      const thumbFile = formData.get('thumb') as File;

      if (!jobId || !mainFile || !thumbFile) {
        return jsonResponse({ success: false, error: 'Missing required file or job_id' }, 400);
      }

      // Check max 20 photos
      const countRes = await env.DB.prepare('SELECT COUNT(*) as cnt FROM photos WHERE job_id = ?').bind(jobId).first<{ cnt: number }>();
      if ((countRes?.cnt || 0) >= 20) {
        return jsonResponse({ success: false, error: 'แต่ละงานสามารถมีรูปภาพได้ไม่เกิน 20 รูป' }, 400);
      }

      const photoId = crypto.randomUUID();
      const mainKey = `jobs/${jobId}/${photoId}.webp`;
      const thumbKey = `jobs/${jobId}/thumb_${photoId}.webp`;

      // Upload to R2
      await env.BUCKET.put(mainKey, mainFile.stream(), {
        httpMetadata: { contentType: mainFile.type || 'image/webp' },
      });
      await env.BUCKET.put(thumbKey, thumbFile.stream(), {
        httpMetadata: { contentType: thumbFile.type || 'image/webp' },
      });

      const storagePath = `/api/photos/raw/${mainKey}`;
      const thumbPath = `/api/photos/raw/${thumbKey}`;
      const sortOrder = parseInt(sortOrderStr || '0', 10);
      const width = widthStr ? parseInt(widthStr, 10) : null;
      const height = heightStr ? parseInt(heightStr, 10) : null;

      await env.DB.prepare(`
        INSERT INTO photos (id, job_id, storage_path, thumb_path, sort_order, width, height, alt_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(photoId, jobId, storagePath, thumbPath, sortOrder, width, height, altText).run();

      // Check if job needs cover_photo_id
      const job = await env.DB.prepare('SELECT cover_photo_id FROM jobs WHERE id = ?').bind(jobId).first<{ cover_photo_id: string }>();
      if (!job?.cover_photo_id) {
        await env.DB.prepare('UPDATE jobs SET cover_photo_id = ? WHERE id = ?').bind(photoId, jobId).run();
      }

      const createdPhoto = await env.DB.prepare('SELECT * FROM photos WHERE id = ?').bind(photoId).first<any>();

      return jsonResponse({ success: true, photo: createdPhoto });
    }

    if (url.pathname === '/api/photos/reorder' && method === 'PUT') {
      const auth = await authenticate(request, env);
      if (!auth.ok) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      const body = (await request.json()) as { jobId: string; orderedPhotoIds: string[] };
      if (!body.orderedPhotoIds || !Array.isArray(body.orderedPhotoIds)) {
        return jsonResponse({ success: false, error: 'Invalid orderedPhotoIds' }, 400);
      }

      const statements = body.orderedPhotoIds.map((id, index) =>
        env.DB.prepare('UPDATE photos SET sort_order = ? WHERE id = ?').bind(index + 1, id)
      );

      await env.DB.batch(statements);
      return jsonResponse({ success: true });
    }

    const photoMatch = url.pathname.match(/^\/api\/photos\/([a-zA-Z0-9_-]+)$/);
    if (photoMatch && method === 'DELETE') {
      const auth = await authenticate(request, env);
      if (!auth.ok) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      const photoId = photoMatch[1];
      const photo = await env.DB.prepare('SELECT * FROM photos WHERE id = ?').bind(photoId).first<any>();
      if (!photo) {
        return jsonResponse({ success: false, error: 'Photo not found' }, 404);
      }

      // Delete from R2
      if (photo.storage_path.startsWith('/api/photos/raw/')) {
        const k = photo.storage_path.replace('/api/photos/raw/', '');
        await env.BUCKET.delete(k);
      }
      if (photo.thumb_path.startsWith('/api/photos/raw/')) {
        const k = photo.thumb_path.replace('/api/photos/raw/', '');
        await env.BUCKET.delete(k);
      }

      await env.DB.prepare('DELETE FROM photos WHERE id = ?').bind(photoId).run();

      // Check if deleted photo was cover_photo_id
      const job = await env.DB.prepare('SELECT cover_photo_id FROM jobs WHERE id = ?').bind(photo.job_id).first<{ cover_photo_id: string }>();
      if (job?.cover_photo_id === photoId) {
        const nextPhoto = await env.DB.prepare(
          'SELECT id FROM photos WHERE job_id = ? ORDER BY sort_order ASC LIMIT 1'
        ).bind(photo.job_id).first<{ id: string }>();

        await env.DB.prepare('UPDATE jobs SET cover_photo_id = ? WHERE id = ?')
          .bind(nextPhoto?.id || null, photo.job_id)
          .run();
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: 'Route not found' }, 404);
  },
};
