import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class UnsplashAdapter implements MediaAdapter {
  private accessKey: string;

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
  }

  isEnabled(): boolean {
    return !!this.accessKey && process.env.ENABLE_MEDIA_UNSPLASH === 'true';
  }

  async fetchImage(params: { id?: string; query?: string; width?: number }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Unsplash is not enabled');
    }

    let photoUrl: string;
    let attribution: any = {};

    if (params.id) {
      const response = await fetch(`https://api.unsplash.com/photos/${params.id}`, {
        headers: { 'Authorization': `Client-ID ${this.accessKey}` }
      });
      const data = await response.json();
      photoUrl = params.width ? `${data.urls.raw}&w=${params.width}` : data.urls.regular;
      attribution = { user: data.user.name, userUrl: data.user.links.html };
    } else if (params.query) {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(params.query)}&per_page=1`, {
        headers: { 'Authorization': `Client-ID ${this.accessKey}` }
      });
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        throw new Error('No photos found');
      }
      const photo = data.results[0];
      photoUrl = params.width ? `${photo.urls.raw}&w=${params.width}` : photo.urls.regular;
      attribution = { user: photo.user.name, userUrl: photo.user.links.html };
    } else {
      throw new Error('Either id or query must be provided');
    }

    const imageResponse = await fetch(photoUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return {
      buffer,
      contentType,
      ttl: DEFAULT_TTL.long,
    };
  }

  getAttribution(params: { user?: string; userUrl?: string }): AttributionInfo {
    return {
      provider: 'Unsplash',
      attributionText: params.user ? `Photo by ${params.user}` : 'Unsplash',
      attributionUrl: params.userUrl || 'https://unsplash.com',
      license: 'Unsplash License'
    };
  }
}
