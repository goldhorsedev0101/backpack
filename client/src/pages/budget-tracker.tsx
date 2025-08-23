import { useState } from "react";
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
  Wallet
} from "lucide-react";

const expenseSchema = z.object({
  tripId: z.number().min(1, "Please select a trip"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
});


type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function BudgetTracker() {
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: userTrips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["/api/trips/user"]
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses/user"],
  });

  const { data: tripExpenses = [], isLoading: tripExpensesLoading } = useQuery({
    queryKey: ["/api/expenses/trip", selectedTrip],
    enabled: !!selectedTrip,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/trip", selectedTrip] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      setShowExpenseForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add expenses",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add expense",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmitExpense = (data: ExpenseFormData) => {
    addExpenseMutation.mutate(data);
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

  const selectedTripData = selectedTrip ? (userTrips || []).find((trip: any) => trip.id === selectedTrip) : null;
  const budget = selectedTripData ? parseFloat(selectedTripData.budget || 0) : 0;
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 flex items-center justify-center gap-3">
            <Wallet className="w-10 h-10 text-primary" />
            Budget Tracker
          </h1>
          <p className="text-lg text-gray-600">Manage your travel expenses and stay within budget</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Select value={selectedTrip?.toString() || "all"} onValueChange={(value) => setSelectedTrip(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expenses</SelectItem>
                {(userTrips || []).map((trip: any) => (
                  <SelectItem key={trip.id} value={trip.id.toString()}>
                    {trip.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(EXPENSE_CATEGORIES || []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-orange-600 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmitExpense)} className="space-y-4">
                <div>
                  <Label htmlFor="tripId">Trip</Label>
                  <Select onValueChange={(value) => form.setValue("tripId", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trip" />
                    </SelectTrigger>
                    <SelectContent>
                      {(userTrips || []).map((trip: any) => (
                        <SelectItem key={trip.id} value={trip.id.toString()}>
                          {trip.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tripId && (
                    <p className="text-sm text-destructive">{form.formState.errors.tripId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(EXPENSE_CATEGORIES || []).map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <IconComponent className="w-4 h-4 mr-2" />
                              {category.label}
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
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input 
                    id="amount"
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...form.register("amount")} 
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description"
                    placeholder="What did you spend on?"
                    {...form.register("description")} 
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input 
                    id="location"
                    placeholder="Where did you spend this?"
                    {...form.register("location")} 
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={addExpenseMutation.isPending} className="flex-1">
                    {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

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
                    currency="USD"
                  />
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Trip</h3>
                      <p className="text-gray-500">Choose a trip to see your budget overview and expense breakdown.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="text-lg font-semibold text-primary">${totalSpent.toFixed(2)}</span>
                    </div>
                    {selectedTrip && budget > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Budget</span>
                          <span className="text-lg font-semibold text-slate-700">${budget.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Remaining</span>
                          <span className={`text-lg font-semibold ${
                            budget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${(budget - totalSpent).toFixed(2)}
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
                            {budgetUsed.toFixed(1)}% of budget used
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-primary" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(categoryTotals || []).map((category) => {
                      const IconComponent = category.icon;
                      const percentage = totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;
                      
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${category.color} mr-3`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium">{category.label}</span>
                            </div>
                            <span className="font-semibold">${category.total.toFixed(2)}</span>
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
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" />
                    Recent Expenses
                  </span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {(filteredExpenses || []).map((expense: any) => {
                      const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category);
                      const IconComponent = category?.icon || ShoppingBag;
                      
                      return (
                        <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${category?.color || 'bg-gray-500'} mr-4`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{expense.description}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Badge variant="outline">{category?.label || 'Other'}</Badge>
                                {expense.location && (
                                  <>
                                    <MapPin className="w-3 h-3" />
                                    <span>{expense.location}</span>
                                  </>
                                )}
                                <Calendar className="w-3 h-3 ml-2" />
                                <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">${parseFloat(expense.amount).toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Expenses Found</h3>
                    <p className="text-gray-500">Start adding expenses to track your spending.</p>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Trips</p>
                          <p className="text-2xl font-bold">{analytics?.trips?.total || 0}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Countries Visited</p>
                          <p className="text-2xl font-bold">{analytics?.trips?.countries || 0}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="text-2xl font-bold">${analytics?.expenses?.total?.toFixed(2) || '0.00'}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg per Trip</p>
                          <p className="text-2xl font-bold">${analytics?.expenses?.avgPerTrip?.toFixed(2) || '0.00'}</p>
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
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  AI Budget Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">AI Insights Coming Soon</h3>
                  <p className="text-gray-500">Get personalized budget recommendations and spending insights powered by AI.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}