import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Table,
  BarChart3,
  Users,
  MapPin,
  MessageSquare,
  CreditCard,
  Trophy,
} from "lucide-react";
import { api, type DashboardResponse, type TableData } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardResponse>({
    queryKey: ["dashboard", "tables"],
    queryFn: () => api.dashboard.getTables(),
    retry: false,
  });

  const displayData = dashboardData?.tables || [];
  const totalRecords = displayData.reduce(
    (sum: number, table: TableData) => sum + table.approx_row_count,
    0
  );
  const tablesWithData = displayData.filter(
    (table: TableData) => table.approx_row_count > 0
  ).length;

  const getTableIcon = (tableName: string) => {
    if (tableName.includes("user") || tableName.includes("session"))
      return Users;
    if (
      tableName.includes("location") ||
      tableName.includes("destination") ||
      tableName.includes("place")
    )
      return MapPin;
    if (tableName.includes("chat") || tableName.includes("message"))
      return MessageSquare;
    if (tableName.includes("expense") || tableName.includes("trip"))
      return CreditCard;
    if (tableName.includes("achievement")) return Trophy;
    if (tableName.includes("photo") || tableName.includes("review"))
      return BarChart3;
    return Table;
  };

  const getTableCategory = (tableName: string) => {
    if (tableName.includes("user") || tableName.includes("session"))
      return t("dashboard.category_users_auth");
    if (
      tableName.includes("location") ||
      tableName.includes("destination") ||
      tableName.includes("place") ||
      tableName.includes("accommodation") ||
      tableName.includes("attraction") ||
      tableName.includes("restaurant")
    )
      return t("dashboard.category_places");
    if (
      tableName.includes("chat") ||
      tableName.includes("message") ||
      tableName.includes("buddy")
    )
      return t("dashboard.category_community");
    if (tableName.includes("expense") || tableName.includes("trip"))
      return t("dashboard.category_travel");
    if (tableName.includes("achievement"))
      return t("dashboard.category_gamification");
    if (
      tableName.includes("ingestion") ||
      tableName.includes("raw_response") ||
      tableName.includes("spatial")
    )
      return t("dashboard.category_data_processing");
    return t("dashboard.category_other");
  };

  const groupedTables = displayData.reduce(
    (groups: Record<string, TableData[]>, table: TableData) => {
      const category = getTableCategory(table.table_name);
      if (!groups[category]) groups[category] = [];
      groups[category].push(table);
      return groups;
    },
    {} as Record<string, TableData[]>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-12 w-96 mx-auto mb-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-64 mx-auto bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 flex items-center justify-center gap-3">
            <Database className="w-10 h-10 text-center text-primary" />
            {t("dashboard.title")}
          </h1>
          <p className="text-lg text-center text-gray-600">
            {t("dashboard.subtitle")}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md">
              <p className="text-yellow-800">
                {t("dashboard.error_connection")}
              </p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.total_tables")}
              </CardTitle>
              <Table className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.tables_with_data", { count: tablesWithData })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.total_records")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRecords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.across_all_tables")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.largest_table")}
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(
                  ...displayData.map((t) => t.approx_row_count)
                ).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {
                  displayData.find(
                    (t) =>
                      t.approx_row_count ===
                      Math.max(...displayData.map((t) => t.approx_row_count))
                  )?.table_name
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.categories")}
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(groupedTables).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.data_categories")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables by Category */}
        <div className="space-y-8">
          {Object.entries(groupedTables).map(([category, tables]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                {category === t("dashboard.category_places") && (
                  <MapPin className="w-6 h-6 text-primary" />
                )}
                {category === t("dashboard.category_community") && (
                  <MessageSquare className="w-6 h-6 text-primary" />
                )}
                {category === t("dashboard.category_users_auth") && (
                  <Users className="w-6 h-6 text-primary" />
                )}
                {category === t("dashboard.category_travel") && (
                  <CreditCard className="w-6 h-6 text-primary" />
                )}
                {category === t("dashboard.category_gamification") && (
                  <Trophy className="w-6 h-6 text-primary" />
                )}
                {category === t("dashboard.category_data_processing") && (
                  <Database className="w-6 h-6 text-primary" />
                )}
                {category === t("dashboard.category_other") && (
                  <Table className="w-6 h-6 text-primary" />
                )}
                {category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => {
                  const Icon = getTableIcon(table.table_name);
                  return (
                    <Card
                      key={table.table_name}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Icon className="w-5 h-5 text-primary" />
                          <Badge
                            variant={
                              table.approx_row_count > 0
                                ? "default"
                                : "secondary"
                            }
                          >
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
                            {table.approx_row_count === 0
                              ? t("dashboard.empty_table")
                              : table.approx_row_count === 1
                              ? t("dashboard.one_record")
                              : t("dashboard.records_count", {
                                  count:
                                    table.approx_row_count.toLocaleString(),
                                })}
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
              {t("dashboard.last_updated")}:{" "}
              {new Date(dashboardData.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
