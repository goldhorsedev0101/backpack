import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  maxRetries?: number;
  testId?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-video',
  fallbackSrc,
  onLoad,
  onError,
  priority = false,
  maxRetries = 2,
  testId,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`Failed to load image: ${currentSrc}`);
    
    // Try retry if available
    if (retryCount < maxRetries) {
      console.log(`Retrying image load (${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      // Add cache-busting parameter
      const separator = currentSrc.includes('?') ? '&' : '?';
      setCurrentSrc(`${currentSrc}${separator}retry=${retryCount + 1}`);
      return;
    }

    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`Using fallback image: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setRetryCount(0);
      return;
    }

    // Try generic placeholder from Unsplash (simpler URL)
    const genericFallback = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
    if (currentSrc !== genericFallback) {
      console.log(`Using generic fallback image`);
      setCurrentSrc(genericFallback);
      setRetryCount(0);
      setIsLoading(true); // Reset loading state
      return;
    }

    // No more options - show error state
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    setCurrentSrc(src);
  };

  if (hasError) {
    return (
      <div 
        className={`${aspectRatio} bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-3 ${className}`}
        data-testid={testId ? `${testId}-error` : 'image-error'}
      >
        <ImageIcon className="h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-500 px-4 text-center">{alt}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="gap-2"
          data-testid={testId ? `${testId}-retry` : 'image-retry'}
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} ${className}`} data-testid={testId}>
      {isLoading && (
        <Skeleton className="absolute inset-0 rounded-lg" data-testid={testId ? `${testId}-skeleton` : 'image-skeleton'} />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        data-testid={testId ? `${testId}-img` : 'optimized-img'}
      />
    </div>
  );
}
