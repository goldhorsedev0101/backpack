import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Sun, Cloud, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { travelTimingService, type TravelTimingInfo } from '@/services/travelTimingService';

interface BestTimeInfoProps {
  destination: string;
  country?: string;
  compact?: boolean;
}

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
    case 'very-good': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'good': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'fair': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'poor': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-700';
    case 'moderate': return 'bg-yellow-100 text-yellow-700';
    case 'high': return 'bg-orange-100 text-orange-700';
    case 'very-high': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'excellent': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'very-good': return <Sun className="w-4 h-4 text-blue-600" />;
    case 'good': return <Cloud className="w-4 h-4 text-yellow-600" />;
    case 'fair': return <Cloud className="w-4 h-4 text-orange-600" />;
    case 'poor': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

export function BestTimeInfo({ destination, country, compact = false }: BestTimeInfoProps) {
  // Use client-side travel timing service directly
  const timingInfo = travelTimingService.getBestTimeInfo(destination, country);

  if (!timingInfo) {
    return (
      <div className="text-sm text-gray-500">
        <Clock className="w-4 h-4 inline mr-1" />
        Travel timing info unavailable
      </div>
    );
  }

  if (compact) {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentMonthData = timingInfo.monthlyBreakdown[currentMonth];
    const isBestTime = timingInfo.bestMonths.includes(currentMonth);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getRatingIcon(currentMonthData?.rating || 'good')}
          <span className="text-sm font-medium">
            {isBestTime ? 'Perfect time to visit!' : 'Good time to visit'}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          Best months: {timingInfo.bestMonths.slice(0, 3).join(', ')}
          {timingInfo.bestMonths.length > 3 && '...'}
        </div>
        {timingInfo.avoidMonths.length > 0 && (
          <div className="text-xs text-orange-600">
            Avoid: {timingInfo.avoidMonths.join(', ')}
          </div>
        )}
      </div>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentMonthData = timingInfo.monthlyBreakdown[currentMonth];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Best Time to Visit {timingInfo.destination}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Best Months</h4>
                <div className="flex flex-wrap gap-1">
                  {timingInfo.bestMonths.map((month) => (
                    <Badge key={month} className="bg-green-100 text-green-800">
                      {month}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {timingInfo.avoidMonths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Avoid</h4>
                  <div className="flex flex-wrap gap-1">
                    {timingInfo.avoidMonths.map((month) => (
                      <Badge key={month} className="bg-red-100 text-red-800">
                        {month}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Weather</h4>
                <p className="text-sm text-gray-600">{timingInfo.reasons.weather}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Crowds & Pricing</h4>
                <p className="text-sm text-gray-600">{timingInfo.reasons.crowds}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Activities</h4>
                <p className="text-sm text-gray-600">{timingInfo.reasons.activities}</p>
              </div>
            </div>

            {currentMonthData && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  This Month ({currentMonth})
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  {getRatingIcon(currentMonthData.rating)}
                  <Badge className={getRatingColor(currentMonthData.rating)}>
                    {currentMonthData.rating.replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{currentMonthData.temperature}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="seasons" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-700 mb-2">Peak Season</h4>
                <div className="space-y-1">
                  {timingInfo.peakSeason.map((month) => (
                    <div key={month} className="text-sm">{month}</div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">Highest prices, most crowds</p>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-700 mb-2">Shoulder Season</h4>
                <div className="space-y-1">
                  {timingInfo.shoulderSeason.map((month) => (
                    <div key={month} className="text-sm">{month}</div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">Good weather, moderate prices</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">Low Season</h4>
                <div className="space-y-1">
                  {timingInfo.lowSeason.map((month) => (
                    <div key={month} className="text-sm">{month}</div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">Best deals, fewer tourists</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-3">
            <div className="grid gap-3">
              {Object.entries(timingInfo.monthlyBreakdown).map(([month, data]) => (
                <div key={month} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{month}</h4>
                    <div className="flex items-center gap-2">
                      {getRatingIcon(data.rating)}
                      <Badge className={getRatingColor(data.rating)}>
                        {data.rating.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">{data.temperature}</p>
                      <p className="text-gray-600">{data.rainfall}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getLevelColor(data.crowds)}>
                        Crowds: {data.crowds}
                      </Badge>
                      <Badge className={getLevelColor(data.prices)}>
                        Prices: {data.prices}
                      </Badge>
                    </div>
                  </div>

                  {data.highlights.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-green-700 mb-1">Highlights:</p>
                      <p className="text-xs text-gray-600">{data.highlights.join(', ')}</p>
                    </div>
                  )}

                  {data.considerations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-orange-700 mb-1">Consider:</p>
                      <p className="text-xs text-gray-600">{data.considerations.join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}