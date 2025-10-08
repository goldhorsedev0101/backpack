import express from 'express';
import { unsplashService } from './unsplashService.js';

const router = express.Router();

// GET /api/unsplash/redirect?id=<photoId>&variant=<regular|full|small|thumb>
router.get('/redirect', async (req, res) => {
  try {
    const { id, variant = 'regular' } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Photo ID is required' });
    }

    const validVariants = ['regular', 'full', 'small', 'thumb', 'raw'];
    if (typeof variant !== 'string' || !validVariants.includes(variant)) {
      return res.status(400).json({ error: 'Invalid variant' });
    }

    const photo = await unsplashService.getPhotoById(id);
    const redirectUrl = photo.urls[variant as keyof typeof photo.urls];

    if (!redirectUrl) {
      return res.status(404).json({ error: 'Photo URL not found' });
    }

    // 302 Redirect to Unsplash CDN
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('[Unsplash] Redirect error:', error);
    res.status(500).json({ 
      error: 'Failed to redirect to photo',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/unsplash/download
router.post('/download', async (req, res) => {
  try {
    const { download_location, photo_id, context } = req.body;

    if (!download_location || typeof download_location !== 'string') {
      return res.status(400).json({ error: 'download_location is required' });
    }

    if (!photo_id || typeof photo_id !== 'string') {
      return res.status(400).json({ error: 'photo_id is required' });
    }

    const result = await unsplashService.triggerDownload(
      download_location,
      photo_id,
      context
    );

    res.json(result);
  } catch (error) {
    console.error('[Unsplash] Download trigger error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to trigger download',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/unsplash/search
router.get('/search', async (req, res) => {
  try {
    const { query, page, per_page, orientation } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await unsplashService.searchPhotos({
      query,
      page: page ? parseInt(page as string) : 1,
      perPage: per_page ? parseInt(per_page as string) : 10,
      orientation: orientation as 'landscape' | 'portrait' | 'squarish' | undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('[Unsplash] Search error:', error);
    res.status(500).json({
      error: 'Failed to search photos',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/unsplash/photo/:id
router.get('/photo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await unsplashService.getPhotoById(id);
    res.json(photo);
  } catch (error) {
    console.error('[Unsplash] Get photo error:', error);
    res.status(500).json({
      error: 'Failed to get photo',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/unsplash/random
router.get('/random', async (req, res) => {
  try {
    const { query, count, orientation } = req.query;

    const photos = await unsplashService.randomPhotos({
      query: query as string | undefined,
      count: count ? parseInt(count as string) : 1,
      orientation: orientation as 'landscape' | 'portrait' | 'squarish' | undefined,
    });

    res.json(photos);
  } catch (error) {
    console.error('[Unsplash] Random photos error:', error);
    res.status(500).json({
      error: 'Failed to get random photos',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/unsplash/enabled - Check if Unsplash is enabled
router.get('/enabled', (_req, res) => {
  res.json({ enabled: unsplashService.isEnabled() });
});

export default router;
