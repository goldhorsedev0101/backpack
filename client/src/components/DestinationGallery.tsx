import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X, Info, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AttributionUnsplash from './AttributionUnsplash.js';

interface UnsplashPhotoData {
  id: string;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    download_location: string;
  };
}

interface GalleryImage {
  source: string;
  ref?: string;
  id?: string;
  url?: string;
  query?: string;
  alt: string;
  attribution?: {
    provider: string;
    attributionText?: string;
    attributionUrl?: string;
    license?: string;
  };
  unsplashData?: UnsplashPhotoData;
}

interface DestinationGalleryProps {
  destinationName: string;
  heroImages: GalleryImage[];
  poiImages?: GalleryImage[];
  isLoading?: boolean;
}

export default function DestinationGallery({
  destinationName,
  heroImages,
  poiImages = [],
  isLoading = false,
}: DestinationGalleryProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [imageAttributions, setImageAttributions] = useState<Record<string, any>>({});

  const getProxyUrl = (image: GalleryImage, maxwidth?: number): string => {
    const params = new URLSearchParams({
      source: image.source,
      ...(image.ref && { ref: image.ref }),
      ...(image.id && { id: image.id }),
      ...(image.url && { url: image.url }),
      ...(image.query && { query: image.query }),
      ...(maxwidth && { maxwidth: maxwidth.toString() }),
      lang: i18n.language,
    });

    return `/api/media/proxy?${params}`;
  };

  const fetchImageWithAttribution = async (image: GalleryImage, imageKey: string) => {
    try {
      const response = await fetch(getProxyUrl(image, 1200));

      const attributionHeader = response.headers.get('X-Attribution');
      if (attributionHeader) {
        try {
          const attribution = JSON.parse(attributionHeader);
          setImageAttributions(prev => ({ ...prev, [imageKey]: attribution }));
        } catch (e) {
          console.error('Failed to parse attribution:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
    }
  };

  useEffect(() => {
    heroImages.forEach((image, index) => {
      fetchImageWithAttribution(image, `hero-${index}`);
    });
  }, [heroImages]);

  useEffect(() => {
    poiImages.forEach((image, index) => {
      fetchImageWithAttribution(image, `poi-${index}`);
    });
  }, [poiImages]);

  const nextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevHero = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const openLightbox = (image: GalleryImage) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const handleUsePhoto = async (image: GalleryImage) => {
    if (!image.unsplashData) return;

    try {
      const response = await fetch('/api/unsplash/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          download_location: image.unsplashData.links.download_location,
          photo_id: image.unsplashData.id,
          context: `destination-gallery:${destinationName}`,
        }),
      });

      const result = await response.json();
      console.log('[Unsplash] Download triggered:', result);
    } catch (error) {
      console.error('[Unsplash] Failed to trigger download:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="gallery-loading">
        <Skeleton className="w-full h-96 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (heroImages.length === 0 && poiImages.length === 0) {
    return (
      <div className="text-center py-12" data-testid="gallery-empty">
        <p className="text-muted-foreground">
          {t('destination.gallery.noImages', 'No images available')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="destination-gallery">
      {/* Hero Section */}
      {heroImages.length > 0 && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden group" data-testid="gallery-hero">
          <img
            src={getProxyUrl(heroImages[currentHeroIndex], 1600)}
            alt={heroImages[currentHeroIndex].alt}
            className="w-full h-full object-cover"
            loading="lazy"
            data-testid={`hero-image-${currentHeroIndex}`}
          />

          {/* Navigation Arrows */}
          {heroImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={prevHero}
                data-testid="hero-prev-btn"
              >
                {isRTL ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={nextHero}
                data-testid="hero-next-btn"
              >
                {isRTL ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
              </Button>
            </>
          )}

          {/* Attribution */}
          {heroImages[currentHeroIndex].unsplashData ? (
            <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} bg-black/70 text-white px-3 py-2 rounded-lg`}>
              <AttributionUnsplash user={heroImages[currentHeroIndex].unsplashData!.user} className="text-white" />
            </div>
          ) : imageAttributions[`hero-${currentHeroIndex}`] && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2`}
                    data-testid="hero-attribution-btn"
                  >
                    <Info className="h-3 w-3" />
                    {imageAttributions[`hero-${currentHeroIndex}`].provider}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p>{imageAttributions[`hero-${currentHeroIndex}`].attributionText}</p>
                    {imageAttributions[`hero-${currentHeroIndex}`].attributionUrl && (
                      <a
                        href={imageAttributions[`hero-${currentHeroIndex}`].attributionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        {t('destination.gallery.viewSource', 'View Source')}
                      </a>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Use Photo Button for Unsplash */}
          {heroImages[currentHeroIndex].unsplashData && (
            <Button
              variant="secondary"
              size="sm"
              className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} opacity-0 group-hover:opacity-100 transition-opacity`}
              onClick={() => handleUsePhoto(heroImages[currentHeroIndex])}
              data-testid="hero-use-photo-btn"
            >
              <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('media.unsplash.usePhoto', 'Use this photo')}
            </Button>
          )}

          {/* Full View Button */}
          <Button
            variant="secondary"
            size="sm"
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={() => openLightbox(heroImages[currentHeroIndex])}
            data-testid="hero-fullview-btn"
          >
            {t('destination.gallery.fullView', 'Full View')}
          </Button>
        </div>
      )}

      {/* POIs Gallery */}
      {poiImages.length > 0 && (
        <div className="space-y-3" data-testid="gallery-pois">
          <h3 className="text-lg font-semibold">
            {t('destination.gallery.attractions', 'Attractions')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {poiImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(image)}
                data-testid={`poi-image-${index}`}
              >
                <img
                  src={getProxyUrl(image, 600)}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Attribution Overlay */}
                {image.unsplashData ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <AttributionUnsplash user={image.unsplashData.user} className="text-white mb-2" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleUsePhoto(image);
                      }}
                      data-testid={`poi-use-photo-${index}`}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {t('media.unsplash.usePhoto', 'Use this photo')}
                    </Button>
                  </div>
                ) : imageAttributions[`poi-${index}`] && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs">
                      {imageAttributions[`poi-${index}`].attributionText || imageAttributions[`poi-${index}`].provider}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl p-0" data-testid="gallery-lightbox">
          {lightboxImage && (
            <div className="relative">
              <img
                src={getProxyUrl(lightboxImage, 2400)}
                alt={lightboxImage.alt}
                className="w-full max-h-[90vh] object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setLightboxOpen(false)}
                data-testid="lightbox-close-btn"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
