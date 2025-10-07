import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class GooglePlacesAdapter implements MediaAdapter {
  private apiKey: string;
  private attributionsCache: Map<string, string[]> = new Map();

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  isEnabled(): boolean {
    return !!this.apiKey && process.env.ENABLE_MEDIA_GOOGLE === 'true';
  }

  async fetchImage(params: { ref: string; maxwidth?: number; maxheight?: number }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Google Places Photos is not enabled');
    }

    const { ref, maxwidth = 1200, maxheight } = params;
    const urlParams = new URLSearchParams({
      photo_reference: ref,
      key: this.apiKey,
      ...(maxwidth && { maxwidth: maxwidth.toString() }),
      ...(maxheight && { maxheight: maxheight.toString() }),
    });

    const url = `https://maps.googleapis.com/maps/api/place/photo?${urlParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return {
      buffer,
      contentType,
      ttl: DEFAULT_TTL.short,
    };
  }

  getAttribution(params: { ref: string; htmlAttributions?: string[] }): AttributionInfo {
    const { ref, htmlAttributions } = params;
    
    let attributionText = 'Google';
    let attributionUrl = '';

    if (htmlAttributions && htmlAttributions.length > 0) {
      const firstAttr = htmlAttributions[0];
      const urlMatch = firstAttr.match(/href="([^"]+)"/);
      const textMatch = firstAttr.match(/>([^<]+)</);
      
      if (textMatch) attributionText = textMatch[1];
      if (urlMatch) attributionUrl = urlMatch[1];
    }

    return {
      provider: 'Google Places',
      attributionText,
      attributionUrl,
      license: 'Google Maps Platform Terms'
    };
  }

  setHtmlAttributions(ref: string, attributions: string[]): void {
    this.attributionsCache.set(ref, attributions);
  }

  getHtmlAttributions(ref: string): string[] | undefined {
    return this.attributionsCache.get(ref);
  }
}
