export interface MediaAdapter {
  fetchImage(params: Record<string, any>): Promise<ImageResult>;
  getAttribution(params: Record<string, any>): AttributionInfo;
  isEnabled(): boolean;
}

export interface ImageResult {
  buffer: Buffer;
  contentType: string;
  ttl: number;
}

export interface AttributionInfo {
  provider: string;
  attributionText?: string;
  attributionUrl?: string;
  license?: string;
}

export interface ProxyParams {
  source: 'google' | 'tripadvisor' | 'unsplash' | 'pexels' | 'wikimedia' | 'tbo';
  ref?: string;
  id?: string;
  url?: string;
  query?: string;
  maxwidth?: number;
  maxheight?: number;
  lang?: string;
}

export const DEFAULT_TTL = {
  short: parseInt(process.env.MEDIA_DEFAULT_TTL_SHORT || '7200'), // 2 hours
  long: parseInt(process.env.MEDIA_DEFAULT_TTL_LONG || '172800'), // 48 hours
};
