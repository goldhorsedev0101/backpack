import crypto from 'crypto';

interface CacheEntry {
  buffer: Buffer;
  contentType: string;
  attribution: any;
  timestamp: number;
  ttl: number;
}

class MediaCache {
  private cache: Map<string, CacheEntry> = new Map();
  private revalidating: Set<string> = new Set();

  getCacheKey(source: string, params: Record<string, any>): string {
    const paramsStr = JSON.stringify(params);
    const hash = crypto.createHash('md5').update(paramsStr).digest('hex');
    return `media:${source}:${hash}`;
  }

  async get(key: string): Promise<{ data: CacheEntry | null; isStale: boolean }> {
    const entry = this.cache.get(key);
    if (!entry) {
      return { data: null, isStale: false };
    }

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttl * 1000;

    return { data: entry, isStale };
  }

  set(key: string, buffer: Buffer, contentType: string, attribution: any, ttl: number): void {
    this.cache.set(key, {
      buffer,
      contentType,
      attribution,
      timestamp: Date.now(),
      ttl,
    });

    setTimeout(() => {
      this.cache.delete(key);
    }, ttl * 1000 * 2);
  }

  markRevalidating(key: string): void {
    this.revalidating.add(key);
  }

  isRevalidating(key: string): boolean {
    return this.revalidating.has(key);
  }

  clearRevalidating(key: string): void {
    this.revalidating.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.revalidating.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const mediaCache = new MediaCache();
