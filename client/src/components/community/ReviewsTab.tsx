import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Star, Search, Plus, Loader2, RefreshCw, FileText } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { WriteReviewModal } from './WriteReviewModal';
import { EditReviewModal } from './EditReviewModal';
import { useToast } from '../../hooks/use-toast';
import {
  listReviews,
  fetchPhotosForEntities,
  fetchAggregatesForEntities,
  getHelpfulCounts,
  getUserHelpfulVotes,
  ReviewFilters,
  ReviewWithMetadata,
  EntityPair
} from '../../lib/reviewsApi';

export function ReviewsTab() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ReviewFilters>({
    search: '',
    entityType: 'all',
    minRating: 1,
    sortBy: 'newest',
    page: 0,
    limit: 20
  });
  
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithMetadata | null>(null);
  const [searchInput, setSearchInput] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 0 }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch reviews with current filters
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ['place-reviews', filters],
    queryFn: () => listReviews(filters),
    retry: 2
  });

  // Extract unique entity pairs for batch fetching
  const entityPairs: EntityPair[] = useMemo(() => {
    if (!reviewsData?.reviews) return [];
    
    const pairs = reviewsData.reviews.map(review => ({
      entity_type: review.entity_type,
      entity_id: review.entity_id
    }));
    
    // Deduplicate pairs
    const uniquePairs = pairs.filter((pair, index, self) => 
      index === self.findIndex(p => p.entity_type === pair.entity_type && p.entity_id === pair.entity_id)
    );
    
    return uniquePairs;
  }, [reviewsData?.reviews]);

  // Fetch photos for all entities (batch to avoid N+1)
  const { data: photosData } = useQuery({
    queryKey: ['entity-photos', entityPairs],
    queryFn: () => fetchPhotosForEntities(entityPairs),
    enabled: entityPairs.length > 0
  });

  // Fetch aggregates for all entities (batch to avoid N+1)
  const { data: aggregatesData } = useQuery({
    queryKey: ['entity-aggregates', entityPairs],
    queryFn: () => fetchAggregatesForEntities(entityPairs),
    enabled: entityPairs.length > 0
  });

  // Fetch helpful vote counts
  const reviewIds = reviewsData?.reviews?.map(r => r.id) || [];
  const { data: helpfulCounts } = useQuery({
    queryKey: ['helpful-counts', reviewIds],
    queryFn: () => getHelpfulCounts(reviewIds),
    enabled: reviewIds.length > 0
  });

  // Fetch user's helpful votes
  const { data: userVotes } = useQuery({
    queryKey: ['user-helpful-votes', reviewIds],
    queryFn: () => getUserHelpfulVotes(reviewIds),
    enabled: reviewIds.length > 0
  });

  // Combine all data into enriched reviews
  const enrichedReviews: ReviewWithMetadata[] = useMemo(() => {
    if (!reviewsData?.reviews) return [];

    return reviewsData.reviews.map(review => ({
      ...review,
      photo_url: photosData?.[review.entity_id],
      helpful_count: helpfulCounts?.[review.id] || 0,
      user_voted_helpful: userVotes?.[review.id] || false,
      // Get place name from entity tables (we'll need to add this to the API)
      place_name: `${review.entity_type} ${review.entity_id.slice(0, 8)}`
    }));
  }, [reviewsData?.reviews, photosData, helpfulCounts, userVotes]);

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleReviewCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['place-reviews'] });
    setShowWriteModal(false);
    toast({
      title: t('community.reviews.review_created'),
      description: t('community.reviews.review_created_desc'),
    });
  };

  const handleReviewUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['place-reviews'] });
    setEditingReview(null);
    toast({
      title: t('community.reviews.review_updated'),
      description: t('community.reviews.review_updated_desc'),
    });
  };

  const handleReviewDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['place-reviews'] });
    toast({
      title: t('community.reviews.review_deleted'),
      description: t('community.reviews.review_deleted_desc'),
    });
  };

  const handleHelpfulToggle = () => {
    // Invalidate helpful counts and user votes to refresh
    queryClient.invalidateQueries({ queryKey: ['helpful-counts'] });
    queryClient.invalidateQueries({ queryKey: ['user-helpful-votes'] });
  };

  if (reviewsError) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('community.reviews.unable_to_load')}</h3>
            <p className="text-gray-500 mb-4">
              {reviewsError instanceof Error ? reviewsError.message : t('community.reviews.failed_to_fetch')}
            </p>
            <Button onClick={() => refetchReviews()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('community.reviews.try_again')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              {t('community.reviews.place_reviews')}
            </CardTitle>
            <Button onClick={() => setShowWriteModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('community.reviews.write_review')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('community.reviews.search_reviews')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Entity Type Filter */}
            <Select
              value={filters.entityType}
              onValueChange={(value) => handleFilterChange('entityType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('community.reviews.all_types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('community.reviews.all_types')}</SelectItem>
                <SelectItem value="destinations">{t('community.reviews.destinations')}</SelectItem>
                <SelectItem value="accommodations">{t('community.reviews.accommodations')}</SelectItem>
                <SelectItem value="attractions">{t('community.reviews.attractions')}</SelectItem>
                <SelectItem value="restaurants">{t('community.reviews.restaurants')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Minimum Rating Filter */}
            <Select
              value={filters.minRating?.toString()}
              onValueChange={(value) => handleFilterChange('minRating', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('community.reviews.min_rating')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('community.reviews.stars_1_plus')}</SelectItem>
                <SelectItem value="2">{t('community.reviews.stars_2_plus')}</SelectItem>
                <SelectItem value="3">{t('community.reviews.stars_3_plus')}</SelectItem>
                <SelectItem value="4">{t('community.reviews.stars_4_plus')}</SelectItem>
                <SelectItem value="5">{t('community.reviews.stars_5_only')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('community.reviews.sort_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('community.reviews.newest_first')}</SelectItem>
                <SelectItem value="top_rated">{t('community.reviews.top_rated')}</SelectItem>
                <SelectItem value="lowest_rated">{t('community.reviews.lowest_rated')}</SelectItem>
                <SelectItem value="most_helpful">{t('community.reviews.most_helpful')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filters display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {t('community.reviews.search_label')} {filters.search}
                <button 
                  onClick={() => {
                    setSearchInput('');
                    handleFilterChange('search', '');
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.entityType !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {t('community.reviews.type_label')} {filters.entityType}
                <button 
                  onClick={() => handleFilterChange('entityType', 'all')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.minRating && filters.minRating > 1 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {t('community.reviews.rating_label')} {filters.minRating}+
                <button 
                  onClick={() => handleFilterChange('minRating', 1)}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardContent className="p-0">
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">{t('community.reviews.loading_reviews')}</span>
            </div>
          ) : enrichedReviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('community.reviews.no_reviews_found')}</h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.entityType !== 'all' || (filters.minRating && filters.minRating > 1)
                  ? t('community.reviews.adjust_filters')
                  : t('community.reviews.be_first_to_share')
                }
              </p>
              <Button onClick={() => setShowWriteModal(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t('community.reviews.write_first_review')}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="p-6 space-y-4">
                {enrichedReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onEdit={(review) => setEditingReview(review)}
                    onDeleted={handleReviewDeleted}
                    onHelpfulToggle={handleHelpfulToggle}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {reviewsData && reviewsData.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {t('community.reviews.showing_results', {
                  start: (filters.page || 0) * (filters.limit || 20) + 1,
                  end: Math.min(((filters.page || 0) + 1) * (filters.limit || 20), reviewsData.total),
                  total: reviewsData.total
                })}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 0) - 1)}
                  disabled={!filters.page || filters.page === 0}
                >
                  {t('community.reviews.previous')}
                </Button>
                <span className="text-sm text-gray-600">
                  {t('community.reviews.page_info', {
                    current: (filters.page || 0) + 1,
                    total: reviewsData.totalPages
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 0) + 1)}
                  disabled={(filters.page || 0) >= reviewsData.totalPages - 1}
                >
                  {t('community.reviews.next')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <WriteReviewModal
        open={showWriteModal}
        onOpenChange={setShowWriteModal}
        onReviewCreated={handleReviewCreated}
      />

      {editingReview && (
        <EditReviewModal
          open={!!editingReview}
          onOpenChange={(open) => !open && setEditingReview(null)}
          review={editingReview}
          onReviewUpdated={handleReviewUpdated}
        />
      )}
    </div>
  );
}