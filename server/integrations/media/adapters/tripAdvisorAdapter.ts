import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class TripAdvisorAdapter implements MediaAdapter {
  isEnabled(): boolean {
    return false;
  }

  async fetchImage(params: { url: string }): Promise<ImageResult> {
    throw new Error('TripAdvisor Photos API is not yet implemented');
  }

  getAttribution(params: any): AttributionInfo {
    return {
      provider: 'TripAdvisor',
      attributionText: 'TripAdvisor',
      attributionUrl: 'https://www.tripadvisor.com',
      license: 'TripAdvisor Terms of Use'
    };
  }
}
