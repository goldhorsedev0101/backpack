import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import BudgetOverview from "@/components/budget-overview";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Calendar,
  MapPin,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  X,
  Filter,
  Download,
  BarChart3,
  Wallet,
  ShoppingBag,
  Trash2
} from "lucide-react";

// Currency conversion rate (USD to ILS)
const USD_TO_ILS = 3.7;

// Note: expenseSchema moved inside component to access t() function


type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function BudgetTracker() {
  const { t, i18n } = useTranslation();
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const expenseSchema = z.object({
    tripId: z.number().min(1, t('budget.validation.please_select_trip')),
    category: z.string().min(1, t('budget.validation.category_required')),
    amount: z.string().min(1, t('budget.validation.amount_required')),
    description: z.string().min(1, t('budget.validation.description_required')),
    location: z.string().optional(),
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      tripId: 0,
      category: "",
      amount: "",
      description: "",
      location: "",
    },
  });

  const { data: userTrips = [], isLoading: tripsLoading } = useQuery<any[]>({
    queryKey: ["/api/trips/user"]
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses/user"],
  });

  const { data: tripExpenses = [], isLoading: tripExpensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses/trip", selectedTrip],
    enabled: !!selectedTrip,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<any>({
    queryKey: ["/api/analytics/dashboard"]
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      return await apiRequest("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: async () => {
      // Refetch all relevant queries to ensure data is updated
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/user"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/trip", selectedTrip] }),
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] })
      ]);
      
      // Force refetch to ensure fresh data
      if (selectedTrip) {
        await queryClient.refetchQueries({ queryKey: ["/api/expenses/trip", selectedTrip] });
      }
      await queryClient.refetchQueries({ queryKey: ["/api/expenses/user"] });
      
      setShowExpenseForm(false);
      form.reset();
      toast({
        title: t('budget.success'),
        description: t('budget.expense_added_successfully'),
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('budget.authentication_required'),
          description: t('budget.please_log_in_to_add_expenses'),
          variant: "destructive",
        });
      } else {
        const errorMessage = error?.message || error?.error || t('budget.failed_to_add_expense');
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmitExpense = (data: ExpenseFormData) => {
    addExpenseMutation.mutate(data);
  };

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      await apiRequest(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/user"] });
      if (selectedTrip) {
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/trip", selectedTrip] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: t('budget.success'),
        description: t('budget.expense_deleted_successfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteExpense = (expenseId: number) => {
    deleteExpenseMutation.mutate(expenseId);
  };

  const getCategoryColor = (category: string) => {
    const categoryData = EXPENSE_CATEGORIES.find(c => c.id === category);
    return categoryData ? categoryData.color : 'bg-gray-500';
  };

  const currentTripExpenses = selectedTrip ? (tripExpenses || []) : (expenses || []);
  const filteredExpenses = selectedCategory === "all" 
    ? (currentTripExpenses || []) 
    : (currentTripExpenses || []).filter((expense: any) => expense.category === selectedCategory);

  const totalSpent = (currentTripExpenses || []).reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
  const categoryTotals = (EXPENSE_CATEGORIES || []).map(category => ({
    ...category,
    total: (currentTripExpenses || [])
      .filter((expense: any) => expense.category === category.id)
      .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0)
  }));

  const selectedTripData = selectedTrip ? (Array.isArray(userTrips) ? userTrips.find((trip: any) => trip.id === selectedTrip) : null) : null;
  const budget = selectedTripData ? parseFloat(selectedTripData.budget || 0) : 0;
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 flex items-center justify-center gap-3">
            <Wallet className="w-10 h-10 text-primary" />
            {t('budget.title')}
          </h1>
          <p className="text-lg text-gray-600">{t('budget.subtitle')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Select value={selectedTrip?.toString() || "all"} onValueChange={(value) => setSelectedTrip(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t('budget.select_a_trip')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('budget.all_expenses')}</SelectItem>
                {Array.isArray(userTrips) ? userTrips.map((trip: any) => (
                  <SelectItem key={trip.id} value={trip.id.toString()}>
                    {trip.title}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('budget.all_categories')}</SelectItem>
                {(EXPENSE_CATEGORIES || []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {t(category.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <DialogTrigger asChild>
              <Button className={`bg-primary hover:bg-orange-600 whitespace-nowrap ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                <Plus className={`w-4 h-4 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                {t('budget.add_expense')}
              </Button>
            </DialogTrigger>
            <DialogContent 
              className={`sm:max-w-[500px] max-h-[90vh] overflow-y-auto ${i18n.language === 'he' ? '[&]:!dir-rtl' : ''}`}
              data-rtl={i18n.language === 'he' ? 'true' : 'false'}
              dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
            >
              <DialogHeader>
                <DialogTitle>{t('budget.add_new_expense')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmitExpense)} className="space-y-6">
                  <div>
                    <Label htmlFor="tripId" className="block mb-2">{t('budget.trip')} <span className="text-red-500">*</span></Label>
                  <Select 
                    value={form.watch("tripId") > 0 ? form.watch("tripId").toString() : undefined}
                    onValueChange={(value) => form.setValue("tripId", parseInt(value), { shouldValidate: true })}
                  >
                    <SelectTrigger data-testid="select-trip">
                      <SelectValue placeholder={t('budget.select_a_trip')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(userTrips) && userTrips.length > 0 ? userTrips.map((trip: any) => (
                        <SelectItem key={trip.id} value={trip.id.toString()}>
                          {trip.title}
                        </SelectItem>
                      )) : (
                        <div className="p-2 text-sm text-gray-500">{t('budget.no_trips_found')}</div>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tripId && (
                    <p className="text-sm text-destructive">{form.formState.errors.tripId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category" className="block mb-2">{t('budget.category')}</Label>
                  <Select onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('budget.select_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {(EXPENSE_CATEGORIES || []).map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-4 h-4" />
                              {t(category.labelKey)}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="amount" className="block mb-2">{t('budget.amount_usd')}</Label>
                  <Input 
                    id="amount"
                    type="number" 
                    step="0.5"
                    placeholder={t('budget.amount_placeholder')}
                    dir="ltr"
                    {...form.register("amount")} 
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="block mb-2">{t('budget.description')}</Label>
                  <Input 
                    id="description"
                    placeholder={t('budget.what_did_you_spend_on')}
                    dir="ltr"
                    {...form.register("description")} 
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location" className="block mb-2">{t('budget.location_optional')}</Label>
                  <Input 
                    id="location"
                    placeholder={t('budget.where_did_you_spend_this')}
                    dir="ltr"
                    {...form.register("location")} 
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={addExpenseMutation.isPending} className="flex-1">
                    {addExpenseMutation.isPending ? t('budget.adding') : t('budget.add_expense')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full justify-evenly h-10">
              <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
                <BarChart3 className="w-4 h-4" />
                {t('budget.overview')}
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2 whitespace-nowrap">
                <DollarSign className="w-4 h-4" />
                {t('budget.expenses')}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
                <PieChart className="w-4 h-4" />
                {t('budget.analytics')}
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 whitespace-nowrap">
                <Lightbulb className="w-4 h-4" />
                {t('budget.ai_insights')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {selectedTrip && selectedTripData ? (
                  <BudgetOverview 
                    totalBudget={budget}
                    totalSpent={totalSpent}
                    expenses={(tripExpenses || []).map((expense: any) => ({
                      id: expense.id,
                      amount: parseFloat(expense.amount),
                      category: expense.category,
                      description: expense.description,
                      date: expense.createdAt || expense.date
                    }))}
                    onDeleteExpense={handleDeleteExpense}
                  />
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">{t('budget.select_a_trip')}</h3>
                      <p className="text-gray-500">{t('budget.choose_trip_to_see_overview')}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {t('budget.quick_stats')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('budget.total_spent')}</span>
                      <span className="text-lg font-semibold text-primary">
                        {i18n.language === 'he' 
                          ? `₪${Math.round(totalSpent * USD_TO_ILS).toLocaleString('he-IL')}` 
                          : `$${totalSpent.toFixed(2)}`}
                      </span>
                    </div>
                    {selectedTrip && budget > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">{t('budget.budget')}</span>
                          <span className="text-lg font-semibold text-slate-700">
                            {i18n.language === 'he' 
                              ? `₪${Math.round(budget * USD_TO_ILS).toLocaleString('he-IL')}` 
                              : `$${budget.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">{t('budget.remaining')}</span>
                          <span className={`text-lg font-semibold ${
                            budget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {i18n.language === 'he' 
                              ? `₪${Math.round((budget - totalSpent) * USD_TO_ILS).toLocaleString('he-IL')}` 
                              : `$${(budget - totalSpent).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              budgetUsed <= 80 ? 'bg-green-500' : budgetUsed <= 100 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <span className={`text-sm ${
                            budgetUsed <= 80 ? 'text-green-600' : budgetUsed <= 100 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {t('budget.budget_used_percentage', { percentage: budgetUsed.toFixed(1) })}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                      <PieChart className="w-5 h-5 text-primary" />
                      {t('budget.categories')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(categoryTotals || []).map((category) => {
                      const IconComponent = category.icon;
                      const percentage = totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;
                      
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-3 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <div className={`p-2 rounded-lg ${category.color}`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className={`font-medium ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>{t(category.labelKey)}</span>
                            </div>
                            <span className="font-semibold">
                              {i18n.language === 'he' 
                                ? `₪${Math.round(category.total * USD_TO_ILS).toLocaleString('he-IL')}` 
                                : `$${category.total.toFixed(2)}`}
                            </span>
                          </div>
                          {category.total > 0 && (
                            <Progress value={percentage} className="h-2" />
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                  <span className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                    <DollarSign className="w-5 h-5 text-primary" />
                    {t('budget.recent_expenses')}
                  </span>
                  <Button variant="outline" size="sm" className={`${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                    <Download className={`w-4 h-4 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                    {t('budget.export')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {(filteredExpenses || []).map((expense: any, index: number) => {
                      const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category);
                      const IconComponent = category?.icon || ShoppingBag;
                      
                      return (
                        <div key={expense.id}>
                          <div className={`flex items-center justify-between py-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-3 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'}`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div className={i18n.language === 'he' ? 'text-right' : ''}>
                                <div className="font-medium">{expense.description}</div>
                                <div className="text-sm text-gray-600">
                                  {t(category?.labelKey || 'budget.other')} • {new Date(expense.createdAt).toLocaleDateString('he-IL')}
                                  {expense.location && ` • ${expense.location}`}
                                </div>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <div className="font-semibold text-gray-800">
                                {i18n.language === 'he' 
                                  ? `₪${Math.round(parseFloat(expense.amount) * USD_TO_ILS).toLocaleString('he-IL')}` 
                                  : `$${parseFloat(expense.amount).toFixed(2)}`}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteExpense(expense.id)}
                                data-testid={`button-delete-expense-${expense.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {index < filteredExpenses.length - 1 && <Separator className="mt-2" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">{t('budget.no_expenses_found')}</h3>
                    <p className="text-gray-500">{t('budget.start_adding_expenses')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                        <div className={i18n.language === 'he' ? 'text-right' : ''}>
                          <p className="text-sm text-gray-600">{t('budget.total_trips')}</p>
                          <p className="text-2xl font-bold">{analytics?.trips?.total || 0}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                        <div className={i18n.language === 'he' ? 'text-right' : ''}>
                          <p className="text-sm text-gray-600">{t('budget.countries_visited')}</p>
                          <p className="text-2xl font-bold">{analytics?.trips?.countries || 0}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                        <div className={i18n.language === 'he' ? 'text-right' : ''}>
                          <p className="text-sm text-gray-600">{t('budget.total_spent')}</p>
                          <p className="text-2xl font-bold">
                            {i18n.language === 'he' 
                              ? `₪${Math.round((analytics?.expenses?.total || 0) * USD_TO_ILS).toLocaleString('he-IL')}` 
                              : `$${analytics?.expenses?.total?.toFixed(2) || '0.00'}`}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                        <div className={i18n.language === 'he' ? 'text-right' : ''}>
                          <p className="text-sm text-gray-600">{t('budget.avg_per_trip')}</p>
                          <p className="text-2xl font-bold">
                            {i18n.language === 'he' 
                              ? `₪${Math.round((analytics?.expenses?.avgPerTrip || 0) * USD_TO_ILS).toLocaleString('he-IL')}` 
                              : `$${analytics?.expenses?.avgPerTrip?.toFixed(2) || '0.00'}`}
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                  <Lightbulb className="w-5 h-5 text-primary" />
                  {t('budget.ai_budget_insights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">{t('budget.ai_insights_coming_soon')}</h3>
                  <p className="text-gray-500">{t('budget.ai_budget_description')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}