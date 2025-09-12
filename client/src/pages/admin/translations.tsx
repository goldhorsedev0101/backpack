import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Search, Save, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

type EntityType = 'destinations' | 'accommodations' | 'attractions' | 'restaurants';
type Locale = 'en' | 'he';

interface TranslationItem {
  id: number;
  locationId: string;
  baseName: string;
  baseDescription?: string;
  translatedName?: string;
  translatedDescription?: string;
  locale: Locale;
  translationId?: number;
  country?: string;
  city?: string;
  rating?: number;
}

interface TranslationStats {
  destinations: { total: number; translated: number };
  accommodations: { total: number; translated: number };
  attractions: { total: number; translated: number };
  restaurants: { total: number; translated: number };
}

export default function AdminTranslations() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('destinations');
  const [selectedLocale, setSelectedLocale] = useState<Locale>('he');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItems, setEditingItems] = useState<Record<string, { name?: string; description?: string }>>({});
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

  // Debounced search to avoid too many API calls
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  // Fetch translation data with proper session-based authentication
  const { data: translationsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'translations', selectedEntity, selectedLocale, searchQuery],
    queryFn: () => apiRequest(`/api/admin/translations/${selectedEntity}?locale=${selectedLocale}&search=${searchQuery}`, {
      credentials: 'include', // Include session cookies
    }),
    enabled: true,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Fetch translation statistics
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'translation-stats', selectedLocale],
    queryFn: () => apiRequest(`/api/admin/translations/stats/${selectedLocale}`, {
      credentials: 'include',
    }),
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Save translation mutation
  const saveTranslationMutation = useMutation({
    mutationFn: async ({ entityType, entityId, locale, name, description }: {
      entityType: EntityType;
      entityId: number;
      locale: Locale;
      name?: string;
      description?: string;
    }) => {
      return apiRequest(`/api/admin/translations/${entityType}/${entityId}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ locale, name, description }),
      });
    },
    onSuccess: (_, variables) => {
      const itemKey = `${variables.entityId}-${variables.locale}`;
      setSavingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
      setEditingItems(prev => {
        const newEditing = { ...prev };
        delete newEditing[itemKey];
        return newEditing;
      });
      
      toast({
        title: t('common.success'),
        description: t('messages.changes_saved'),
        variant: 'default',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'translation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['localized'] }); // Refresh localized data
    },
    onError: (error, variables) => {
      const itemKey = `${variables.entityId}-${variables.locale}`;
      setSavingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
      
      toast({
        title: t('errors.error_occurred'),
        description: t('errors.upload_failed'),
        variant: 'destructive',
      });
    },
  });

  // Handle input changes with optimistic updates
  const handleInputChange = (itemId: number, locale: Locale, field: 'name' | 'description', value: string) => {
    const itemKey = `${itemId}-${locale}`;
    setEditingItems(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field]: value,
      },
    }));
  };

  // Save translation with optimistic updates
  const handleSave = async (item: TranslationItem) => {
    const itemKey = `${item.id}-${selectedLocale}`;
    const editData = editingItems[itemKey];
    
    if (!editData) return;
    
    setSavingItems(prev => new Set([...prev, itemKey]));
    
    await saveTranslationMutation.mutateAsync({
      entityType: selectedEntity,
      entityId: item.id,
      locale: selectedLocale,
      name: editData.name,
      description: editData.description,
    });
  };

  const translations = translationsData?.data || [];
  const stats = statsData?.data || {};
  
  const entityTabs = [
    { value: 'destinations', label: t('community.destinations'), icon: '🏛️' },
    { value: 'accommodations', label: t('community.accommodations'), icon: '🏨' },
    { value: 'attractions', label: t('community.attractions'), icon: '🎢' },
    { value: 'restaurants', label: t('community.restaurants'), icon: '🍽️' },
  ];

  const localeTabs = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'he', label: 'עברית', flag: '🇮🇱' },
  ];

  // Calculate completion percentage
  const getCompletionPercentage = (entityType: EntityType) => {
    const entityStats = stats[entityType];
    if (!entityStats || entityStats.total === 0) return 0;
    return Math.round((entityStats.translated / entityStats.total) * 100);
  };

  if (error) {
    const isAuthError = (error as any)?.status === 401 || (error as any)?.status === 403;
    
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">
                  {isAuthError ? 'Access Denied' : 'Error Loading Admin Interface'}
                </p>
                <p className="text-sm mt-1">
                  {isAuthError 
                    ? 'You need admin privileges to access this page. Please log in with an admin account.'
                    : `${error.message || 'An unexpected error occurred while loading the admin interface.'}`
                  }
                </p>
                {isAuthError && (
                  <div className="mt-3 text-xs text-gray-600">
                    <p>Authorized admin emails: admin@tripwise.com, support@tripwise.com</p>
                    <p>Note: This requires a valid user session.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          🌐 Admin Translations
        </h1>
        <p className="text-gray-600">
          Manage translations for destinations, accommodations, attractions, and restaurants
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {entityTabs.map((tab) => {
          const entityStats = stats[tab.value as EntityType];
          const percentage = getCompletionPercentage(tab.value as EntityType);
          
          return (
            <Card key={tab.value} className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl mb-2">{tab.icon}</div>
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {entityStats?.translated || 0} / {entityStats?.total || 0}
                </div>
                <div className="mt-2">
                  <Badge variant={percentage > 80 ? 'default' : percentage > 50 ? 'secondary' : 'outline'}>
                    {percentage}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Translation Editor
          </CardTitle>
          <CardDescription>
            Edit translations with side-by-side comparison of base and localized content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entity Type Tabs */}
          <Tabs value={selectedEntity} onValueChange={(value) => setSelectedEntity(value as EntityType)}>
            <TabsList className="grid w-full grid-cols-4">
              {entityTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Locale Tabs */}
          <Tabs value={selectedLocale} onValueChange={(value) => setSelectedLocale(value as Locale)}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              {localeTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <span>{tab.flag}</span>
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`Search ${selectedEntity}...`}
              className="pl-10"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>

          {/* Translation List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="w-6 h-6 animate-spin mr-2" />
                <span>Loading translations...</span>
              </div>
            ) : translations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No {selectedEntity} found</p>
                <p className="text-sm">Try adjusting your search or check another entity type</p>
              </div>
            ) : (
              translations.map((item: TranslationItem) => {
                const itemKey = `${item.id}-${selectedLocale}`;
                const editData = editingItems[itemKey];
                const isSaving = savingItems.has(itemKey);
                const hasChanges = editData && (editData.name !== item.translatedName || editData.description !== item.translatedDescription);
                
                return (
                  <Card key={itemKey} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Base Content (EN) */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            🇺🇸 Base (English)
                            <Badge variant="outline" className="text-xs">
                              {item.country} • {item.city}
                            </Badge>
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Name</label>
                              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                {item.baseName}
                              </div>
                            </div>
                            {item.baseDescription && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                  {item.baseDescription}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Translation Content */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            {selectedLocale === 'he' ? '🇮🇱' : '🇺🇸'} Translation ({selectedLocale.toUpperCase()})
                            {item.translatedName ? (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Translated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Missing
                              </Badge>
                            )}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Name</label>
                              <Input
                                value={editData?.name ?? item.translatedName ?? ''}
                                onChange={(e) => handleInputChange(item.id, selectedLocale, 'name', e.target.value)}
                                placeholder={`Enter ${selectedLocale} name...`}
                                className={selectedLocale === 'he' ? 'text-right' : ''}
                                dir={selectedLocale === 'he' ? 'rtl' : 'ltr'}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Description</label>
                              <Textarea
                                value={editData?.description ?? item.translatedDescription ?? ''}
                                onChange={(e) => handleInputChange(item.id, selectedLocale, 'description', e.target.value)}
                                placeholder={`Enter ${selectedLocale} description...`}
                                className={selectedLocale === 'he' ? 'text-right' : ''}
                                dir={selectedLocale === 'he' ? 'rtl' : 'ltr'}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleSave(item)}
                                disabled={!hasChanges || isSaving}
                                className="flex items-center gap-2"
                                size="sm"
                              >
                                {isSaving ? (
                                  <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                {isSaving ? t('messages.saving_changes') : t('common.save')}
                              </Button>
                              {hasChanges && (
                                <Badge variant="secondary" className="text-xs">
                                  Unsaved changes
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}