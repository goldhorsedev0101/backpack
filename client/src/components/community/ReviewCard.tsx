import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Star, ThumbsUp, MoreVertical, Edit2, Trash2, Flag, MapPin, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../../hooks/use-toast';
import { toggleHelpful, deleteReview, getGuestName, ReviewWithMetadata } from '../../lib/reviewsApi';
import { useLocation } from 'wouter';

interface ReviewCardProps {
  review: ReviewWithMetadata;
  onEdit: (review: ReviewWithMetadata) => void;
  onDeleted: () => void;
  onHelpfulToggle: () => void;
}

export function ReviewCard({ review, onEdit, onDeleted, onHelpfulToggle }: ReviewCardProps) {
  const [showFullBody, setShowFullBody] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if current user can edit/delete this review
  const guestName = getGuestName();
  const canModify = review.author_name === guestName || false; // TODO: Add auth user check

  // Helpful vote mutation
  const helpfulMutation = useMutation({
    mutationFn: () => toggleHelpful(review.id),
    onSuccess: (result) => {
      onHelpfulToggle();
      toast({
        title: result.voted ? "Marked as Helpful" : "Removed Helpful Vote",
        description: result.voted ? "Thanks for your feedback!" : "Your vote has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Vote",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteReview(review.id),
    onSuccess: () => {
      onDeleted();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Review",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlaceClick = () => {
    // Navigate to /explore with proper tab and search
    const entityTypeMap: Record<string, string> = {
      destinations: 'destinations',
      accommodations: 'accommodations', 
      attractions: 'attractions',
      restaurants: 'restaurants'
    };
    
    const tab = entityTypeMap[review.entity_type] || 'destinations';
    const placeName = review.place_name || '';
    setLocation(`/explore?tab=${tab}&q=${encodeURIComponent(placeName)}`);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Format time display
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
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

  // Truncate body text for preview
  const bodyPreview = review.body.length > 200 
    ? review.body.substring(0, 200) + '...'
    : review.body;

  const shouldShowReadMore = review.body.length > 200;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Place Photo */}
          {review.photo_url && (
            <div className="flex-shrink-0">
              <button
                onClick={handlePlaceClick}
                className="relative w-20 h-20 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={review.photo_url}
                  alt={review.place_name || 'Place photo'}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          )}

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {review.title}
                  </h3>
                  {renderStars(review.rating)}
                </div>
                
                {/* Place info */}
                <button
                  onClick={handlePlaceClick}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2"
                >
                  <MapPin className="w-3 h-3" />
                  {review.place_name || `${getEntityTypeDisplay(review.entity_type)} ${review.entity_id.slice(0, 8)}`}
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getEntityTypeDisplay(review.entity_type)}
                  </Badge>
                </div>

                {/* Author and time */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {review.author_name ? review.author_name[0]?.toUpperCase() : <User className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {review.author_name || 'Anonymous User'}
                  </span>
                  {!review.user_id && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      Guest
                    </Badge>
                  )}
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatTime(review.created_at)}
                  </div>
                  {review.updated_at && review.updated_at !== review.created_at && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Edited
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canModify && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(review)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Review
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Review
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Review Body */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">
                {showFullBody ? review.body : bodyPreview}
              </p>
              {shouldShowReadMore && (
                <button
                  onClick={() => setShowFullBody(!showFullBody)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                >
                  {showFullBody ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant={review.user_voted_helpful ? "default" : "outline"}
                size="sm"
                onClick={() => helpfulMutation.mutate()}
                disabled={helpfulMutation.isPending}
                className="flex items-center gap-2"
              >
                <ThumbsUp className={`w-4 h-4 ${review.user_voted_helpful ? 'fill-current' : ''}`} />
                Helpful ({review.helpful_count || 0})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}