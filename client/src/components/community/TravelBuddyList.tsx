import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Search, 
  Filter,
  Plus,
  Heart,
  MessageCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface TravelBuddyPost {
  id: number;
  user_id?: string;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  group_size: number;
  current_members: number;
  budget?: string;
  travel_style?: string[];
  activities?: string[];
  requirements?: string;
  contact_info?: any;
  is_active: boolean;
  created_at: string;
  author_name?: string;
}

interface TravelBuddyListProps {
  onCreatePost?: () => void;
}

export function TravelBuddyList({ onCreatePost }: TravelBuddyListProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['/api/travel-buddy-posts', selectedCountry, selectedBudget, searchTerm],
    retry: false
  });

  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = format(new Date(startDate), 'MMM d');
      const end = format(new Date(endDate), 'MMM d, yyyy');
      return `${start} - ${end}`;
    } catch {
      return t('community.travel_buddies.date_tbd');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return t('community.travel_buddies.recently');
    }
  };

  const getBudgetIcon = (budget?: string) => {
    switch (budget) {
      case 'low': return '💰';
      case 'mid': return '💰💰';
      case 'high': return '💰💰💰';
      default: return '💰';
    }
  };

  const getBudgetColor = (budget?: string) => {
    switch (budget) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorInitials = (authorName?: string, userId?: string) => {
    if (authorName) {
      return authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (userId) {
      return userId.slice(0, 2).toUpperCase();
    }
    return 'TB';
  };

  const filteredPosts = Array.isArray(posts) ? posts.filter((post: TravelBuddyPost) => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = selectedCountry === 'all' || 
      post.destination.toLowerCase().includes(selectedCountry.toLowerCase());
    
    const matchesBudget = selectedBudget === 'all' || post.budget === selectedBudget;
    
    return matchesSearch && matchesCountry && matchesBudget && post.is_active;
  }) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">{t('community.travel_buddies.title')}</h2>
          <p className="text-gray-600">
            {t('community.travel_buddies.description')}
          </p>
        </div>
        {onCreatePost && (
          <Button onClick={onCreatePost} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('community.travel_buddies.new_post')}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('community.travel_buddies.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('community.travel_buddies.country')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('community.travel_buddies.all_countries')}</SelectItem>
              <SelectItem value="peru">{t('countries.peru')}</SelectItem>
              <SelectItem value="colombia">{t('countries.colombia')}</SelectItem>
              <SelectItem value="bolivia">{t('countries.bolivia')}</SelectItem>
              <SelectItem value="chile">{t('countries.chile')}</SelectItem>
              <SelectItem value="argentina">{t('countries.argentina')}</SelectItem>
              <SelectItem value="brazil">{t('countries.brazil')}</SelectItem>
              <SelectItem value="ecuador">{t('countries.ecuador')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedBudget} onValueChange={setSelectedBudget}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('community.travel_buddies.budget')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('community.travel_buddies.all_budgets')}</SelectItem>
              <SelectItem value="low">{t('community.travel_buddies.budget_low')}</SelectItem>
              <SelectItem value="mid">{t('community.travel_buddies.budget_mid')}</SelectItem>
              <SelectItem value="high">{t('community.travel_buddies.budget_high')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts Grid */}
      {error || !Array.isArray(posts) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎒</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {error ? t('community.travel_buddies.unable_to_load') : t('community.travel_buddies.being_setup')}
          </h3>
          <p className="text-gray-500 mb-6">
            {error ? t('community.travel_buddies.check_connection') : t('community.travel_buddies.posts_will_appear')}
          </p>
          {onCreatePost && (
            <Button onClick={onCreatePost} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('community.travel_buddies.create_first_post')}
            </Button>
          )}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t('community.travel_buddies.no_matching_posts')}</h3>
          <p className="text-gray-500 mb-6">
            {t('community.travel_buddies.adjust_search')}
          </p>
          {onCreatePost && (
            <Button onClick={onCreatePost} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('community.travel_buddies.create_new_post')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post: TravelBuddyPost) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{post.destination}</span>
                      {post.budget && (
                        <Badge className={`text-xs ${getBudgetColor(post.budget)}`}>
                          {getBudgetIcon(post.budget)} {post.budget}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                      {getAuthorInitials(post.author_name, post.user_id)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.description}
                </p>

                {/* Trip Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateRange(post.start_date, post.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{post.current_members}/{post.group_size} {t('community.travel_buddies.members')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{t('community.travel_buddies.posted')} {formatTimeAgo(post.created_at)}</span>
                  </div>
                </div>

                {/* Tags */}
                {((post.travel_style && post.travel_style.length > 0) || 
                  (post.activities && post.activities.length > 0)) && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.travel_style?.slice(0, 2).map((style, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                    {post.activities?.slice(0, 2).map((activity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                    {((post.travel_style?.length || 0) + (post.activities?.length || 0)) > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{((post.travel_style?.length || 0) + (post.activities?.length || 0)) - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('community.travel_buddies.contact')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Requirements */}
                {post.requirements && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>{t('community.travel_buddies.requirements')}</strong> {post.requirements}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}