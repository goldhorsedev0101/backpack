import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Star, Check, ChevronsUpDown, Loader2, MapPin } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { createReview, listPlacesForType, getGuestName, PlaceOption } from '../../lib/reviewsApi';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewCreated: () => void;
}

export function WriteReviewModal({ open, onOpenChange, onReviewCreated }: WriteReviewModalProps) {
  const [formData, setFormData] = useState({
    entityType: '',
    selectedPlace: null as PlaceOption | null,
    rating: 0,
    title: '',
    body: '',
    guestName: ''
  });
  
  const [placeSearch, setPlaceSearch] = useState('');
  const [showPlaceCombobox, setShowPlaceCombobox] = useState(false);
  const { toast } = useToast();

  // Get guest name from localStorage
  useEffect(() => {
    if (open) {
      const storedGuestName = getGuestName();
      setFormData(prev => ({ ...prev, guestName: storedGuestName }));
    }
  }, [open]);

  // Search places based on entity type and search query
  const { data: placeOptions = [], isLoading: placesLoading } = useQuery({
    queryKey: ['places-autocomplete', formData.entityType, placeSearch],
    queryFn: () => listPlacesForType(formData.entityType, placeSearch, 10),
    enabled: !!formData.entityType && placeSearch.length >= 2,
    staleTime: 60000 // Cache for 1 minute
  });

  // Create review mutation
  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      onReviewCreated();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Review",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      entityType: '',
      selectedPlace: null,
      rating: 0,
      title: '',
      body: '',
      guestName: getGuestName()
    });
    setPlaceSearch('');
    setShowPlaceCombobox(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.entityType) {
      toast({
        title: "Place Type Required",
        description: "Please select a place type",
        variant: "destructive",
      });
      return;
    }

    if (!formData.selectedPlace) {
      toast({
        title: "Place Required", 
        description: "Please select a place to review",
        variant: "destructive",
      });
      return;
    }

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

    if (!formData.guestName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    // Save guest name to localStorage
    localStorage.setItem('tripwise_guest_name', formData.guestName.trim());

    // Submit review
    createMutation.mutate({
      entity_type: formData.entityType,
      entity_id: formData.selectedPlace.id,
      rating: formData.rating,
      title: formData.title.trim(),
      body: formData.body.trim()
    });
  };

  const handleEntityTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      entityType: value,
      selectedPlace: null
    }));
    setPlaceSearch('');
  };

  const handlePlaceSelect = (place: PlaceOption) => {
    setFormData(prev => ({ ...prev, selectedPlace: place }));
    setPlaceSearch(place.name);
    setShowPlaceCombobox(false);
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false);
      setTimeout(resetForm, 200); // Reset after close animation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entity Type Selection */}
          <div>
            <Label htmlFor="entity-type">Place Type *</Label>
            <Select value={formData.entityType} onValueChange={handleEntityTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type of place" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="destinations">Destination</SelectItem>
                <SelectItem value="accommodations">Accommodation</SelectItem>
                <SelectItem value="attractions">Attraction</SelectItem>
                <SelectItem value="restaurants">Restaurant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Place Selection */}
          <div>
            <Label htmlFor="place">Select Place *</Label>
            <Popover open={showPlaceCombobox} onOpenChange={setShowPlaceCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={showPlaceCombobox}
                  className="w-full justify-between"
                  disabled={!formData.entityType}
                >
                  {formData.selectedPlace ? (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {formData.selectedPlace.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {formData.entityType ? 'Search for a place...' : 'Select place type first'}
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder={`Search ${formData.entityType}...`}
                    value={placeSearch}
                    onValueChange={setPlaceSearch}
                  />
                  <CommandEmpty>
                    {placesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Searching...
                      </div>
                    ) : placeSearch.length < 2 ? (
                      "Type at least 2 characters to search"
                    ) : (
                      "No places found"
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {placeOptions.map((place) => (
                      <CommandItem
                        key={place.id}
                        value={place.id}
                        onSelect={() => handlePlaceSelect(place)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            formData.selectedPlace?.id === place.id ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {place.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.body.length}/2000 characters (minimum 20)
            </div>
          </div>

          {/* Guest Name */}
          <div>
            <Label htmlFor="guest-name">Your Name *</Label>
            <Input
              id="guest-name"
              placeholder="Enter your name as it will appear on the review"
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              disabled={createMutation.isPending}
            />
            <div className="text-xs text-gray-500 mt-1">
              This will be saved for future reviews
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Review'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}