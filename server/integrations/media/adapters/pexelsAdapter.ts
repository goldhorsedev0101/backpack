import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class PexelsAdapter implements MediaAdapter {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PEXELS_API_KEY || '';
  }

  isEnabled(): boolean {
    return !!this.apiKey && process.env.ENABLE_MEDIA_PEXELS === 'true';
  }

  async fetchImage(params: { id?: string; query?: string; size?: string }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Pexels is not enabled');
    }

    let photoUrl: string;
    let attribution: any = {};

    if (params.id) {
      const response = await fetch(`https://api.pexels.com/v1/photos/${params.id}`, {
        headers: { 'Authorization': this.apiKey }
      });
      const data = await response.json();
      photoUrl = data.src.large2x || data.src.large;
      attribution = { photographer: data.photographer, photographerUrl: data.photographer_url };
    } else if (params.query) {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(params.query)}&per_page=1`, {
        headers: { 'Authorization': this.apiKey }
      });
      const data = await response.json();
      if (!data.photos || data.photos.length === 0) {
        throw new Error('No photos found');
      }
      const photo = data.photos[0];
      photoUrl = photo.src.large2x || photo.src.large;
      attribution = { photographer: photo.photographer, photographerUrl: photo.photographer_url };
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

  getAttribution(params: { photographer?: string; photographerUrl?: string }): AttributionInfo {
    return {
      provider: 'Pexels',
      attributionText: params.photographer ? `Photo by ${params.photographer}` : 'Pexels',
      attributionUrl: params.photographerUrl || 'https://www.pexels.com',
      license: 'Pexels License'
    };
  }
}
