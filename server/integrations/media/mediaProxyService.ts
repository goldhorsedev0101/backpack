import { GooglePlacesAdapter } from './adapters/googlePlacesAdapter.js';
import { UnsplashAdapter } from './adapters/unsplashAdapter.js';
import { PexelsAdapter } from './adapters/pexelsAdapter.js';
import { WikimediaAdapter } from './adapters/wikimediaAdapter.js';
import { TripAdvisorAdapter } from './adapters/tripAdvisorAdapter.js';
import { TboAdapter } from './adapters/tboAdapter.js';
import { mediaCache } from './cache/mediaCache.js';
import { MediaAdapter, ProxyParams, AttributionInfo } from './types.js';

class MediaProxyService {
  private adapters: Map<string, MediaAdapter> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly RATE_LIMIT = 100;
  private readonly RATE_LIMIT_WINDOW = 60000;

  constructor() {
    this.adapters.set('google', new GooglePlacesAdapter());
    this.adapters.set('unsplash', new UnsplashAdapter());
    this.adapters.set('pexels', new PexelsAdapter());
    this.adapters.set('wikimedia', new WikimediaAdapter());
    this.adapters.set('tripadvisor', new TripAdvisorAdapter());
    this.adapters.set('tbo', new TboAdapter());
  }

  async fetchImage(params: ProxyParams): Promise<{
    buffer: Buffer;
    contentType: string;
    attribution: AttributionInfo;
    cacheHit: boolean;
    latencyMs: number;
  }> {
    const startTime = Date.now();
    const { source, ...adapterParams } = params;

    const adapter = this.adapters.get(source);
    if (!adapter) {
      throw new Error(`Unknown source: ${source}`);
    }

    if (!adapter.isEnabled()) {
      throw new Error(`${source} is not enabled`);
    }

    this.checkRateLimit(source);

    const cacheKey = mediaCache.getCacheKey(source, adapterParams);
    const { data: cachedData, isStale } = await mediaCache.get(cacheKey);

    if (cachedData && !isStale) {
      return {
        buffer: cachedData.buffer,
        contentType: cachedData.contentType,
        attribution: cachedData.attribution,
        cacheHit: true,
        latencyMs: Date.now() - startTime,
      };
    }

    if (cachedData && isStale && !mediaCache.isRevalidating(cacheKey)) {
      mediaCache.markRevalidating(cacheKey);
      
      this.revalidateInBackground(source, adapterParams, cacheKey, adapter).catch(err => {
        console.error('Background revalidation failed:', err);
        mediaCache.clearRevalidating(cacheKey);
      });

      return {
        buffer: cachedData.buffer,
        contentType: cachedData.contentType,
        attribution: cachedData.attribution,
        cacheHit: true,
        latencyMs: Date.now() - startTime,
      };
    }

    const result = await adapter.fetchImage(adapterParams);
    const attribution = adapter.getAttribution(adapterParams);

    mediaCache.set(cacheKey, result.buffer, result.contentType, attribution, result.ttl);

    return {
      buffer: result.buffer,
      contentType: result.contentType,
      attribution,
      cacheHit: false,
      latencyMs: Date.now() - startTime,
    };
  }

  private async revalidateInBackground(
    source: string,
    params: Record<string, any>,
    cacheKey: string,
    adapter: MediaAdapter
  ): Promise<void> {
    try {
      const result = await adapter.fetchImage(params);
      const attribution = adapter.getAttribution(params);
      mediaCache.set(cacheKey, result.buffer, result.contentType, attribution, result.ttl);
    } finally {
      mediaCache.clearRevalidating(cacheKey);
    }
  }

  private checkRateLimit(source: string): void {
    const now = Date.now();
    const limit = this.rateLimits.get(source);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(source, { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW });
      return;
    }

    if (limit.count >= this.RATE_LIMIT) {
      throw new Error(`Rate limit exceeded for ${source}`);
    }

    limit.count++;
  }

  getEnabledProviders(): string[] {
    const enabled: string[] = [];
    this.adapters.forEach((adapter, key) => {
      if (adapter.isEnabled()) {
        enabled.push(key);
      }
    });
    return enabled;
  }
}

export const mediaProxyService = new MediaProxyService();
