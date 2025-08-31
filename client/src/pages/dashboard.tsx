import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Table, BarChart3, Users, MapPin, MessageSquare, CreditCard, Trophy } from "lucide-react";

interface TableData {
  table_name: string;
  approx_row_count: number;
  error?: string;
}

interface DashboardResponse {
  success: boolean;
  timestamp: string;
  total_tables: number;
  tables: TableData[];
}

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ['/api/dashboard/tables'],
    retry: false
  });

  // Fallback data based on your provided information
  const fallbackData: TableData[] = [
    { table_name: 'spatial_ref_sys', approx_row_count: 8500 },
    { table_name: 'location_photos', approx_row_count: 1667 },
    { table_name: 'accommodations', approx_row_count: 743 },
    { table_name: 'attractions', approx_row_count: 542 },
    { table_name: 'restaurants', approx_row_count: 221 },
    { table_name: 'raw_responses', approx_row_count: 181 },
    { table_name: 'ingestion_runs', approx_row_count: 73 },
    { table_name: 'destinations', approx_row_count: 27 },
    { table_name: 'ingestion_jobs', approx_row_count: 20 },
    { table_name: 'place_reviews', approx_row_count: 5 },
    { table_name: 'places', approx_row_count: 5 },
    { table_name: 'chat_rooms', approx_row_count: 4 },
    { table_name: 'travel_buddy_posts', approx_row_count: 3 },
    { table_name: 'test_destinations', approx_row_count: 2 },
    { table_name: 'messages', approx_row_count: 0 },
    { table_name: 'users', approx_row_count: 0 },
    { table_name: 'sessions', approx_row_count: 0 },
    { table_name: 'trips', approx_row_count: 0 },
    { table_name: 'expenses', approx_row_count: 0 },
    { table_name: 'achievements', approx_row_count: 0 },
    { table_name: 'user_connections', approx_row_count: 0 }
  ];

  const displayData = dashboardData?.tables || fallbackData;
  const totalRecords = displayData.reduce((sum, table) => sum + table.approx_row_count, 0);
  const tablesWithData = displayData.filter(table => table.approx_row_count > 0).length;

  const getTableIcon = (tableName: string) => {
    if (tableName.includes('user') || tableName.includes('session')) return Users;
    if (tableName.includes('location') || tableName.includes('destination') || tableName.includes('place')) return MapPin;
    if (tableName.includes('chat') || tableName.includes('message')) return MessageSquare;
    if (tableName.includes('expense') || tableName.includes('trip')) return CreditCard;
    if (tableName.includes('achievement')) return Trophy;
    if (tableName.includes('photo') || tableName.includes('review')) return BarChart3;
    return Table;
  };

  const getTableCategory = (tableName: string) => {
    if (tableName.includes('user') || tableName.includes('session')) return 'Users & Auth';
    if (tableName.includes('location') || tableName.includes('destination') || tableName.includes('place') || tableName.includes('accommodation') || tableName.includes('attraction') || tableName.includes('restaurant')) return 'Places & Locations';
    if (tableName.includes('chat') || tableName.includes('message') || tableName.includes('buddy')) return 'Community';
    if (tableName.includes('expense') || tableName.includes('trip')) return 'Travel Planning';
    if (tableName.includes('achievement')) return 'Gamification';
    if (tableName.includes('ingestion') || tableName.includes('raw_response') || tableName.includes('spatial')) return 'Data Processing';
    return 'Other';
  };

  const groupedTables = displayData.reduce((groups, table) => {
    const category = getTableCategory(table.table_name);
    if (!groups[category]) groups[category] = [];
    groups[category].push(table);
    return groups;
  }, {} as Record<string, TableData[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 flex items-center justify-center gap-3">
            <Database className="w-10 h-10 text-primary" />
            Database Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Overview of all database tables and their content
          </p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md">
              <p className="text-yellow-800">
                Could not connect to live data. Showing last known state.
              </p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
              <Table className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData.length}</div>
              <p className="text-xs text-muted-foreground">
                {tablesWithData} with data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all tables
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Largest Table</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(...displayData.map(t => t.approx_row_count)).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {displayData.find(t => t.approx_row_count === Math.max(...displayData.map(t => t.approx_row_count)))?.table_name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(groupedTables).length}</div>
              <p className="text-xs text-muted-foreground">
                Data categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables by Category */}
        <div className="space-y-8">
          {Object.entries(groupedTables).map(([category, tables]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                {category === 'Places & Locations' && <MapPin className="w-6 h-6 text-primary" />}
                {category === 'Community' && <MessageSquare className="w-6 h-6 text-primary" />}
                {category === 'Users & Auth' && <Users className="w-6 h-6 text-primary" />}
                {category === 'Travel Planning' && <CreditCard className="w-6 h-6 text-primary" />}
                {category === 'Gamification' && <Trophy className="w-6 h-6 text-primary" />}
                {category === 'Data Processing' && <Database className="w-6 h-6 text-primary" />}
                {!['Places & Locations', 'Community', 'Users & Auth', 'Travel Planning', 'Gamification', 'Data Processing'].includes(category) && <Table className="w-6 h-6 text-primary" />}
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => {
                  const Icon = getTableIcon(table.table_name);
                  return (
                    <Card key={table.table_name} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Icon className="w-5 h-5 text-primary" />
                          <Badge variant={table.approx_row_count > 0 ? "default" : "secondary"}>
                            {table.approx_row_count.toLocaleString()}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-medium text-slate-700">
                          {table.table_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {table.error ? (
                          <p className="text-xs text-red-600">{table.error}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {table.approx_row_count === 0 ? 'Empty table' : 
                             table.approx_row_count === 1 ? '1 record' :
                             `${table.approx_row_count.toLocaleString()} records`}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Timestamp */}
        {dashboardData?.timestamp && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(dashboardData.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}