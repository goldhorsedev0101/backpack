import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database,
  Play,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react";

interface IngestionJob {
  id: string;
  destination_name: string;
  country: string;
  kind: 'attraction' | 'restaurant' | 'accommodation';
  count: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  updated_at: string;
  created_at: string;
}

interface DestinationSummary {
  destination_name: string;
  country: string;
  total_attractions: number;
  total_restaurants: number;
  total_accommodations: number;
  last_updated: string;
}

const statusColors = {
  queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  succeeded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const statusIcons = {
  queued: <Clock className="w-4 h-4" />,
  running: <Loader2 className="w-4 h-4 animate-spin" />,
  succeeded: <CheckCircle className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />
};

export default function IngestionDashboard() {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ingestion jobs data
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useQuery<IngestionJob[]>({
    queryKey: ['/api/ingestion-jobs', countryFilter, kindFilter, searchFilter],
    refetchInterval: 5000 // Refresh every 5 seconds for live updates
  });

  // Fetch destination summary data
  const { data: summary = [], isLoading: summaryLoading } = useQuery<DestinationSummary[]>({
    queryKey: ['/api/ingestion-summary'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get unique countries for filter dropdown
  const countries = Array.from(new Set(jobs.map(job => job.country))).sort();

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter(job => {
    const matchesCountry = !countryFilter || countryFilter === 'all' || job.country === countryFilter;
    const matchesKind = !kindFilter || kindFilter === 'all' || job.kind === kindFilter;
    const matchesSearch = !searchFilter || 
      job.destination_name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCountry && matchesKind && matchesSearch;
  });

  // Manual job trigger mutation
  const triggerJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/functions/v1/enqueue_ingestion_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Default payload - you can customize this based on your needs
          destination: "Machu Picchu",
          country: "Peru",
          types: ["attraction", "restaurant", "accommodation"]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger job: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "משימה נשלחה בהצלחה",
        description: "המשימה נוספה לתור הביצוע",
      });
      // Refresh the jobs list
      queryClient.invalidateQueries({ queryKey: ['/api/ingestion-jobs'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בשליחת המשימה",
        description: error instanceof Error ? error.message : "שגיאה לא ידועה",
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (jobsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">שגיאה בטעינת הנתונים</h3>
              <p className="text-muted-foreground mb-4">
                לא ניתן לטעון את נתוני משימות הקליטה. אנא נסה שוב מאוחר יותר.
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/ingestion-jobs'] })}>
                <RefreshCw className="w-4 h-4 mr-2" />
                נסה שוב
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="w-8 h-8" />
            Ingestion Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            מעקב וניהול משימות קליטת נתונים מ-Google Places API
          </p>
        </div>
        <Button 
          onClick={() => triggerJobMutation.mutate()}
          disabled={triggerJobMutation.isPending}
          className="flex items-center gap-2"
        >
          {triggerJobMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Run Now
        </Button>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{summary.length}</div>
              <div className="text-sm text-muted-foreground">יעדים פעילים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {summary.reduce((sum, item) => sum + item.total_attractions, 0)}
              </div>
              <div className="text-sm text-muted-foreground">אטרקציות</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {summary.reduce((sum, item) => sum + item.total_restaurants, 0)}
              </div>
              <div className="text-sm text-muted-foreground">מסעדות</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {summary.reduce((sum, item) => sum + item.total_accommodations, 0)}
              </div>
              <div className="text-sm text-muted-foreground">לינה</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            פילטרים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">מדינה</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מדינה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל המדינות</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">סוג נתון</label>
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסוגים</SelectItem>
                  <SelectItem value="attraction">אטרקציות</SelectItem>
                  <SelectItem value="restaurant">מסעדות</SelectItem>
                  <SelectItem value="accommodation">לינה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">חיפוש יעד</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="חפש יעד..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          {(countryFilter !== 'all' || kindFilter !== 'all' || searchFilter) && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setCountryFilter("all");
                  setKindFilter("all");
                  setSearchFilter("");
                }}
              >
                נקה פילטרים
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>משימות קליטת נתונים</CardTitle>
            <div className="flex items-center gap-2">
              {jobsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Badge variant="outline">
                {filteredJobs.length} מתוך {jobs.length} משימות
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">טוען נתונים...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">אין משימות להצגה</h3>
              <p className="text-muted-foreground">
                {jobs.length === 0 
                  ? "טרם נוצרו משימות קליטת נתונים" 
                  : "לא נמצאו משימות התואמות לפילטרים"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>יעד</TableHead>
                    <TableHead>מדינה</TableHead>
                    <TableHead>סוג נתון</TableHead>
                    <TableHead>מספר פריטים</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>עדכון אחרון</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.destination_name}
                      </TableCell>
                      <TableCell>{job.country}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {job.kind === 'attraction' && 'אטרקציה'}
                          {job.kind === 'restaurant' && 'מסעדה'}
                          {job.kind === 'accommodation' && 'לינה'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {job.count.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[job.status]}>
                          <span className="flex items-center gap-1">
                            {statusIcons[job.status]}
                            {job.status === 'queued' && 'בתור'}
                            {job.status === 'running' && 'רץ'}
                            {job.status === 'succeeded' && 'הושלם'}
                            {job.status === 'failed' && 'נכשל'}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(job.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}