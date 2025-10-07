import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class WikimediaAdapter implements MediaAdapter {
  isEnabled(): boolean {
    return process.env.ENABLE_MEDIA_WIKIMEDIA === 'true';
  }

  async fetchImage(params: { file?: string; url?: string; width?: number }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Wikimedia is not enabled');
    }

    let imageUrl: string;

    if (params.url) {
      imageUrl = params.url;
    } else if (params.file) {
      const fileName = params.file.replace(/ /g, '_');
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`);
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (!pages[pageId].imageinfo) {
        throw new Error('File not found on Wikimedia Commons');
      }

      imageUrl = pages[pageId].imageinfo[0].url;
      
      if (params.width) {
        imageUrl = imageUrl.replace(/\/\d+px-/, `/${params.width}px-`);
      }
    } else {
      throw new Error('Either file or url must be provided');
    }

    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return {
      buffer,
      contentType,
      ttl: DEFAULT_TTL.long,
    };
  }

  getAttribution(params: { file?: string }): AttributionInfo {
    return {
      provider: 'Wikimedia Commons',
      attributionText: params.file || 'Wikimedia Commons',
      attributionUrl: params.file ? `https://commons.wikimedia.org/wiki/File:${params.file.replace(/ /g, '_')}` : 'https://commons.wikimedia.org',
      license: 'Various CC licenses'
    };
  }
}
