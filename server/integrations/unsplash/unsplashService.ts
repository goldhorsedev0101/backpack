// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > entry.ttl * 1000) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedData<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds,
  });
}

export interface UnsplashPhoto {
  id: string;
  created_at: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    links: {
      self: string;
      html: string;
    };
  };
}

export interface SearchPhotosParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

export interface SearchPhotosResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export class UnsplashService {
  private accessKey: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
  }

  isEnabled(): boolean {
    return !!this.accessKey;
  }

  private async fetchWithLogging<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; latencyMs: number; status: number }> {
    const startTime = Date.now();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Client-ID ${this.accessKey}`,
        ...options.headers,
      },
    });

    const latencyMs = Date.now() - startTime;
    const status = response.status;

    if (!response.ok) {
      console.error(`[Unsplash] Error: ${endpoint}`, {
        provider: 'unsplash',
        endpoint,
        latencyMs,
        status,
        error: await response.text(),
      });
      throw new Error(`Unsplash API error: ${status}`);
    }

    const data = await response.json();

    console.log(`[Unsplash] Success: ${endpoint}`, {
      provider: 'unsplash',
      endpoint,
      latencyMs,
      status,
    });

    return { data, latencyMs, status };
  }

  async searchPhotos(params: SearchPhotosParams): Promise<SearchPhotosResult & { latencyMs: number; status: number }> {
    if (!this.isEnabled()) {
      throw new Error('Unsplash is not enabled');
    }

    const { query, page = 1, perPage = 10, orientation } = params;
    const cacheKey = `unsplash:search:${query}:${page}:${orientation || 'any'}:${perPage}`;
    
    // Check cache
    const cached = getCachedData<SearchPhotosResult>(cacheKey);
    if (cached) {
      console.log(`[Unsplash] Cache hit: ${cacheKey}`);
      return { ...cached, latencyMs: 0, status: 200 };
    }

    const queryParams = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      ...(orientation && { orientation }),
    });

    const { data, latencyMs, status } = await this.fetchWithLogging<SearchPhotosResult>(
      `/search/photos?${queryParams.toString()}`
    );

    // Cache for 1 hour
    setCachedData(cacheKey, data, 3600);

    return { ...data, latencyMs, status };
  }

  async getPhotoById(id: string): Promise<UnsplashPhoto & { latencyMs: number; status: number }> {
    if (!this.isEnabled()) {
      throw new Error('Unsplash is not enabled');
    }

    const cacheKey = `unsplash:photo:${id}`;
    
    // Check cache
    const cached = getCachedData<UnsplashPhoto>(cacheKey);
    if (cached) {
      console.log(`[Unsplash] Cache hit: ${cacheKey}`);
      return { ...cached, latencyMs: 0, status: 200 };
    }

    const { data, latencyMs, status } = await this.fetchWithLogging<UnsplashPhoto>(
      `/photos/${id}`
    );

    // Cache for 12 hours
    setCachedData(cacheKey, data, 43200);

    return { ...data, latencyMs, status };
  }

  async randomPhotos(params: { query?: string; count?: number; orientation?: 'landscape' | 'portrait' | 'squarish' }): Promise<UnsplashPhoto[] & { latencyMs: number; status: number }> {
    if (!this.isEnabled()) {
      throw new Error('Unsplash is not enabled');
    }

    const { query, count = 1, orientation } = params;
    const queryParams = new URLSearchParams({
      count: count.toString(),
      ...(query && { query }),
      ...(orientation && { orientation }),
    });

    const { data, latencyMs, status } = await this.fetchWithLogging<UnsplashPhoto | UnsplashPhoto[]>(
      `/photos/random?${queryParams.toString()}`
    );

    const photos = Array.isArray(data) ? data : [data];
    return Object.assign(photos, { latencyMs, status });
  }

  async triggerDownload(downloadLocation: string, photoId: string, context?: string): Promise<{ ok: boolean; status: number; latencyMs: number; photo_id: string }> {
    if (!this.isEnabled()) {
      throw new Error('Unsplash is not enabled');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(downloadLocation, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
        },
      });

      const latencyMs = Date.now() - startTime;
      const status = response.status;

      console.log(`[Unsplash] Download triggered`, {
        provider: 'unsplash',
        action: 'download_triggered',
        photo_id: photoId,
        context,
        latencyMs,
        status,
      });

      return {
        ok: response.ok,
        status,
        latencyMs,
        photo_id: photoId,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error(`[Unsplash] Download trigger failed`, {
        provider: 'unsplash',
        action: 'download_triggered',
        photo_id: photoId,
        context,
        latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        ok: false,
        status: 500,
        latencyMs,
        photo_id: photoId,
      };
    }
  }
}

export const unsplashService = new UnsplashService();
