import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Star, Loader2, MapPin } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { updateReview, ReviewWithMetadata } from '../../lib/reviewsApi';

interface EditReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewWithMetadata;
  onReviewUpdated: () => void;
}

export function EditReviewModal({ open, onOpenChange, review, onReviewUpdated }: EditReviewModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    body: ''
  });
  
  const { toast } = useToast();

  // Initialize form data when modal opens or review changes
  useEffect(() => {
    if (open && review) {
      setFormData({
        rating: review.rating,
        title: review.title,
        body: review.body
      });
    }
  }, [open, review]);

  // Update review mutation
  const updateMutation = useMutation({
    mutationFn: (updates: { rating: number; title: string; body: string }) =>
      updateReview(review.id, updates),
    onSuccess: () => {
      onReviewUpdated();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('community.reviews.failed_update'),
        description: error.message || t('community.reviews.something_wrong'),
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.rating === 0) {
      toast({
        title: t('community.reviews.rating_required'),
        description: t('community.reviews.rating_required_desc'),
        variant: "destructive",
      });
      return;
    }

    if (formData.title.trim().length < 4 || formData.title.trim().length > 80) {
      toast({
        title: t('community.reviews.invalid_title'),
        description: t('community.reviews.title_length'),
        variant: "destructive",
      });
      return;
    }

    if (formData.body.trim().length < 20 || formData.body.trim().length > 2000) {
      toast({
        title: t('community.reviews.invalid_review'),
        description: t('community.reviews.review_length'),
        variant: "destructive",
      });
      return;
    }

    // Submit update
    updateMutation.mutate({
      rating: formData.rating,
      title: formData.title.trim(),
      body: formData.body.trim()
    });
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onOpenChange(false);
    }
  };

  // Get entity type display name
  const getEntityTypeDisplay = (type: string) => {
    const displayMap: Record<string, string> = {
      destinations: t('community.reviews.entity_types.destinations'),
      accommodations: t('community.reviews.entity_types.accommodations'),
      attractions: t('community.reviews.entity_types.attractions'),
      restaurants: t('community.reviews.entity_types.restaurants')
    };
    return displayMap[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('community.reviews.edit_review')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Place Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">{t('community.reviews.reviewing')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {review.place_name || `${getEntityTypeDisplay(review.entity_type)} ${review.entity_id.slice(0, 8)}`}
              </span>
              <span className="text-sm text-gray-500">
                ({getEntityTypeDisplay(review.entity_type)})
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {t('community.reviews.cannot_change_place')}
            </p>
          </div>

          {/* Rating */}
          <div>
            <Label className="block mb-2">{t('community.reviews.rating')} *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  disabled={updateMutation.isPending}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating} {formData.rating !== 1 ? t('community.reviews.stars') : t('community.reviews.star')}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="block mb-2">{t('community.reviews.review_title')} *</Label>
            <Input
              id="title"
              placeholder={t('community.reviews.title_placeholder')}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={updateMutation.isPending}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/80 {t('community.reviews.characters')}
            </div>
          </div>

          {/* Review Body */}
          <div>
            <Label htmlFor="body" className="block mb-2">{t('community.reviews.your_review')} *</Label>
            <Textarea
              id="body"
              placeholder={t('community.reviews.review_placeholder')}
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              disabled={updateMutation.isPending}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.body.length}/2000 {t('community.reviews.characters')} ({t('community.reviews.minimum')} 20)
            </div>
          </div>

          {/* Info about editing */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>{t('common.note')}:</strong> {t('community.reviews.edit_note')}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('community.reviews.updating')}
                </>
              ) : (
                t('community.reviews.update_review')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}