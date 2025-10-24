import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useLocalizedDestinations } from '../../lib/localizedData';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import { 
  CalendarIcon, 
  MapPin, 
  Users, 
  DollarSign, 
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface NewBuddyPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function NewBuddyPostModal({ open, onOpenChange }: NewBuddyPostModalProps) {
  const { t } = useTranslation();
  const { data: localizedDestinations, isLoading: destinationsLoading } = useLocalizedDestinations();

  // Fallback destinations if API doesn't load
  const POPULAR_DESTINATIONS = [
    'Tokyo', 'Paris', 'Bangkok', 'Rome', 'Sydney', 'New York', 'London', 
    'Barcelona', 'Dubai', 'Singapore', 'Istanbul', 'Amsterdam', 'Berlin',
    'Prague', 'Vienna', 'Budapest', 'Lisbon', 'Athens', 'Copenhagen'
  ];

  const destinations = localizedDestinations?.map(d => ({
    value: d.name,
    label: d.nameLocalized || d.name
  })) || POPULAR_DESTINATIONS.map(d => ({ value: d, label: d }));

  const TRAVEL_STYLES = [
    { id: 'backpacking', label: t('community.travel_styles.backpacking') },
    { id: 'luxury', label: t('community.travel_styles.luxury') },
    { id: 'mid-range', label: t('community.travel_styles.mid_range') },
    { id: 'adventure', label: t('community.travel_styles.adventure') },
    { id: 'cultural', label: t('community.travel_styles.cultural') },
    { id: 'relaxed', label: t('community.travel_styles.relaxed') },
    { id: 'party', label: t('community.travel_styles.party') },
    { id: 'solo-friendly', label: t('community.travel_styles.solo_friendly') },
    { id: 'family', label: t('community.travel_styles.family') },
    { id: 'photography', label: t('community.travel_styles.photography') },
    { id: 'nature', label: t('community.travel_styles.nature') },
    { id: 'city', label: t('community.travel_styles.city') },
    { id: 'beach', label: t('community.travel_styles.beach') },
    { id: 'mountains', label: t('community.travel_styles.mountains') },
    { id: 'spiritual', label: t('community.travel_styles.spiritual') }
  ];

  const ACTIVITIES = [
    { id: 'hiking', label: t('community.activities.hiking') },
    { id: 'trekking', label: t('community.activities.trekking') },
    { id: 'climbing', label: t('community.activities.climbing') },
    { id: 'surfing', label: t('community.activities.surfing') },
    { id: 'diving', label: t('community.activities.diving') },
    { id: 'snorkeling', label: t('community.activities.snorkeling') },
    { id: 'wildlife-watching', label: t('community.activities.wildlife_watching') },
    { id: 'photography', label: t('community.activities.photography') },
    { id: 'cooking-classes', label: t('community.activities.cooking_classes') },
    { id: 'language-exchange', label: t('community.activities.language_exchange') },
    { id: 'volunteering', label: t('community.activities.volunteering') },
    { id: 'festivals', label: t('community.activities.festivals') },
    { id: 'nightlife', label: t('community.activities.nightlife') },
    { id: 'museums', label: t('community.activities.museums') },
    { id: 'architecture', label: t('community.activities.architecture') },
    { id: 'shopping', label: t('community.activities.shopping') },
    { id: 'food-tours', label: t('community.activities.food_tours') },
    { id: 'cycling', label: t('community.activities.cycling') },
    { id: 'kayaking', label: t('community.activities.kayaking') },
    { id: 'camping', label: t('community.activities.camping') }
  ];
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    groupSize: 2,
    adults: 2,
    children: 0,
    budget: 'mid' as 'low' | 'mid' | 'high',
    travelStyles: [] as string[],
    activities: [] as string[],
    requirements: '',
    contactMethod: '',
    displayName: ''
  });

  const [guestData, setGuestData] = useState({
    displayName: '',
    contactMethod: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('/api/travel-buddy-posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
    },
    onSuccess: () => {
      toast({
        title: t('community.post_created_successfully'),
        description: t('community.post_created_description'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/travel-buddy-posts'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
      toast({
        title: t('community.failed_to_create_post'),
        description: t('community.check_connection_try_again'),
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      destination: '',
      startDate: undefined,
      endDate: undefined,
      groupSize: 2,
      adults: 2,
      children: 0,
      budget: 'mid',
      travelStyles: [],
      activities: [],
      requirements: '',
      contactMethod: '',
      displayName: ''
    });
    setGuestData({
      displayName: '',
      contactMethod: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.destination.trim()) {
      toast({
        title: t('community.missing_required_fields'),
        description: t('community.fill_title_description_destination'),
        variant: "destructive"
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: t('community.missing_dates'),
        description: t('community.select_start_end_dates'),
        variant: "destructive"
      });
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast({
        title: t('community.invalid_dates'),
        description: t('community.end_date_after_start_date'),
        variant: "destructive"
      });
      return;
    }

    // Guest mode validation
    if (!guestData.displayName.trim() || !guestData.contactMethod.trim()) {
      toast({
        title: t('community.contact_info_required'),
        description: t('community.provide_name_contact_method'),
        variant: "destructive"
      });
      return;
    }

    // Prepare submission data
    const postData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      destination: formData.destination.trim(),
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      groupSize: formData.groupSize,
      adults: formData.adults,
      children: formData.children,
      budget: formData.budget,
      travelStyle: formData.travelStyles,
      activities: formData.activities,
      requirements: formData.requirements.trim() || null,
      contactInfo: {
        displayName: guestData.displayName.trim(),
        contactMethod: guestData.contactMethod.trim()
      }
    };

    createPostMutation.mutate(postData);
  };

  const addTravelStyle = (styleId: string) => {
    if (!formData.travelStyles.includes(styleId)) {
      setFormData({
        ...formData,
        travelStyles: [...formData.travelStyles, styleId]
      });
    }
  };

  const removeTravelStyle = (styleId: string) => {
    setFormData({
      ...formData,
      travelStyles: formData.travelStyles.filter(s => s !== styleId)
    });
  };

  const addActivity = (activityId: string) => {
    if (!formData.activities.includes(activityId)) {
      setFormData({
        ...formData,
        activities: [...formData.activities, activityId]
      });
    }
  };

  const removeActivity = (activityId: string) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter(a => a !== activityId)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('community.find_travel_buddy')}</DialogTitle>
          <DialogDescription>
            {t('community.create_post_connect_travelers')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-left block mb-2">{t('community.trip_title')} *</Label>
              <Input
                id="title"
                placeholder={t('community.trip_title_placeholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="input-trip-title"
                className="text-left"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-left block mb-2">{t('trips.destination')} *</Label>
              <Select 
                value={formData.destination} 
                onValueChange={(value) => setFormData({ ...formData, destination: value })}
              >
                <SelectTrigger data-testid="select-destination">
                  <SelectValue placeholder={t('community.select_destination_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((destination) => (
                    <SelectItem key={destination.value} value={destination.value}>
                      {destination.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-left block mb-2">{t('common.description')} *</Label>
              <Textarea
                id="description"
                placeholder={t('community.description_placeholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                data-testid="textarea-description"
                className="text-left"
              />
            </div>
          </div>

          {/* Dates and Travelers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-left block mb-2">{t('trips.start_date')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'PPP') : t('community.pick_start_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-left block mb-2">{t('trips.end_date')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'PPP') : t('community.pick_end_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    disabled={(date) => 
                      date < (formData.startDate || new Date()) || 
                      date < addDays(new Date(), 1)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Travelers Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adults" className="text-left block mb-2">{t('trips.adults')}</Label>
              <Select 
                value={formData.adults.toString()} 
                onValueChange={(value) => setFormData({ ...formData, adults: parseInt(value), groupSize: parseInt(value) + formData.children })}
              >
                <SelectTrigger data-testid="select-adults">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(count => (
                    <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="children" className="text-left block mb-2">{t('trips.children')}</Label>
              <Select 
                value={formData.children.toString()} 
                onValueChange={(value) => setFormData({ ...formData, children: parseInt(value), groupSize: formData.adults + parseInt(value) })}
              >
                <SelectTrigger data-testid="select-children">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map(count => (
                    <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label className="text-left block mb-2">{t('trips.budget_range')}</Label>
            <Select 
              value={formData.budget} 
              onValueChange={(value: 'low' | 'mid' | 'high') => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">💰 {t('community.budget_low')}</SelectItem>
                <SelectItem value="mid">💰💰 {t('community.budget_mid')}</SelectItem>
                <SelectItem value="high">💰💰💰 {t('community.budget_high')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Travel Styles */}
          <div>
            <Label className="text-left block mb-2">{t('trips.travel_style')}</Label>
            <Select onValueChange={addTravelStyle}>
              <SelectTrigger>
                <SelectValue placeholder={t('community.add_travel_styles')} />
              </SelectTrigger>
              <SelectContent>
                {TRAVEL_STYLES.filter(style => !formData.travelStyles.includes(style.id)).map(style => (
                  <SelectItem key={style.id} value={style.id}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.travelStyles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.travelStyles.map(styleId => {
                  const styleConfig = TRAVEL_STYLES.find(ts => ts.id === styleId);
                  return (
                    <Badge key={styleId} variant="secondary" className="gap-1">
                      {styleConfig ? styleConfig.label : styleId}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTravelStyle(styleId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activities */}
          <div>
            <Label className="text-left block mb-2">{t('community.planned_activities')}</Label>
            <Select onValueChange={addActivity}>
              <SelectTrigger>
                <SelectValue placeholder={t('community.add_activities')} />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITIES.filter(activity => !formData.activities.includes(activity.id)).map(activity => (
                  <SelectItem key={activity.id} value={activity.id}>{activity.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.activities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.activities.map(activityId => {
                  const activityConfig = ACTIVITIES.find(a => a.id === activityId);
                  return (
                    <Badge key={activityId} variant="outline" className="gap-1">
                      {activityConfig ? activityConfig.label : activityId}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeActivity(activityId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div>
            <Label htmlFor="requirements" className="text-left block mb-2">{t('community.special_requirements_optional')}</Label>
            <Textarea
              id="requirements"
              placeholder={t('community.special_requirements_placeholder')}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={2}
              data-testid="textarea-requirements"
              className="text-left"
            />
          </div>

          {/* Contact Information (Guest Mode) */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">{t('community.contact_information')}</h3>
            <p className="text-sm text-blue-700">
              {t('community.how_should_travelers_contact')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName" className="text-left block mb-2">{t('community.your_name')} *</Label>
                <Input
                  id="displayName"
                  placeholder={t('community.name_placeholder')}
                  value={guestData.displayName}
                  onChange={(e) => setGuestData({ ...guestData, displayName: e.target.value })}
                  required
                  data-testid="input-display-name"
                  className="text-left"
                />
              </div>
              <div>
                <Label htmlFor="contactMethod" className="text-left block mb-2">{t('community.contact_method')} *</Label>
                <Input
                  id="contactMethod"
                  placeholder={t('community.contact_method_placeholder')}
                  value={guestData.contactMethod}
                  onChange={(e) => setGuestData({ ...guestData, contactMethod: e.target.value })}
                  required
                  data-testid="input-contact-method"
                  className="text-left"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createPostMutation.isPending}
              data-testid="button-cancel"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('community.creating_post')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('community.create_post')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}