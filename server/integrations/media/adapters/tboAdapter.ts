import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class TboAdapter implements MediaAdapter {
  isEnabled(): boolean {
    return false;
  }

  async fetchImage(params: { url?: string; id?: string }): Promise<ImageResult> {
    throw new Error('TBO Photos API is not yet implemented');
  }

  getAttribution(params: any): AttributionInfo {
    return {
      provider: 'TBO',
      attributionText: 'TBO',
      attributionUrl: '',
      license: 'TBO Terms'
    };
  }
}
