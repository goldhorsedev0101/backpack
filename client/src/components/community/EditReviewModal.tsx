import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
        title: "Failed to Update Review",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    if (formData.title.trim().length < 4 || formData.title.trim().length > 80) {
      toast({
        title: "Invalid Title",
        description: "Title must be between 4 and 80 characters",
        variant: "destructive",
      });
      return;
    }

    if (formData.body.trim().length < 20 || formData.body.trim().length > 2000) {
      toast({
        title: "Invalid Review",
        description: "Review must be between 20 and 2000 characters",
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
      destinations: 'Destination',
      accommodations: 'Accommodation',
      attractions: 'Attraction', 
      restaurants: 'Restaurant'
    };
    return displayMap[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Place Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Reviewing</Label>
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
              You cannot change the place you're reviewing
            </p>
          </div>

          {/* Rating */}
          <div>
            <Label>Rating *</Label>
            <div className="flex items-center gap-1 mt-2">
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
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              placeholder="Summarize your experience in a few words"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={updateMutation.isPending}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/80 characters
            </div>
          </div>

          {/* Review Body */}
          <div>
            <Label htmlFor="body">Your Review *</Label>
            <Textarea
              id="body"
              placeholder="Share your detailed experience, what you liked or didn't like, and any tips for other travelers..."
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              disabled={updateMutation.isPending}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.body.length}/2000 characters (minimum 20)
            </div>
          </div>

          {/* Info about editing */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your review will be marked as edited and the updated timestamp will be shown to other users.
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Review'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}