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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import BudgetOverview from "@/components/budget-overview";
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Calendar,
  MapPin,
  Bed,
  Bus,
  Utensils,
  Ticket,
  ShoppingBag,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  X,
  Filter
} from "lucide-react";

const expenseSchema = z.object({
  tripId: z.number().min(1, "Please select a trip"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const EXPENSE_CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation', icon: Bed, color: 'bg-primary' },
  { id: 'transportation', label: 'Transportation', icon: Bus, color: 'bg-secondary' },
  { id: 'food', label: 'Food & Drinks', icon: Utensils, color: 'bg-accent' },
  { id: 'activities', label: 'Activities', icon: Ticket, color: 'bg-mint' },
  { id: 'other', label: 'Other', icon: ShoppingBag, color: 'bg-gray-500' },
];

export default function BudgetTracker() {
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return await apiRequest("POST", "/api/expenses", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/trip", selectedTrip] });
      form.reset();
      setShowExpenseForm(false);
      toast({
        title: "Expense Added!",
        description: "Your expense has been tracked successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Add Failed",
        description: "Could not add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitExpense = (data: ExpenseFormData) => {
    createExpenseMutation.mutate({
      ...data,
      tripId: parseInt(data.tripId.toString()),
      amount: parseFloat(data.amount),
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = EXPENSE_CATEGORIES.find(c => c.id === category);
    return categoryData ? categoryData.icon : ShoppingBag;
  };

  const getCategoryColor = (category: string) => {
    const categoryData = EXPENSE_CATEGORIES.find(c => c.id === category);
    return categoryData ? categoryData.color : 'bg-gray-500';
  };

  const currentTripExpenses = selectedTrip ? tripExpenses : expenses;
  const filteredExpenses = selectedCategory === "all" 
    ? currentTripExpenses 
    : currentTripExpenses.filter((expense: any) => expense.category === selectedCategory);

  const totalSpent = currentTripExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
  const categoryTotals = EXPENSE_CATEGORIES.map(category => ({
    ...category,
    total: currentTripExpenses
      .filter((expense: any) => expense.category === category.id)
      .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0)
  }));

  const selectedTripData = selectedTrip ? userTrips.find((trip: any) => trip.id === selectedTrip) : null;
  const budget = selectedTripData ? parseFloat(selectedTripData.budget || 0) : 0;
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Budget Tracker</h1>
          <p className="text-lg text-gray-600">Keep track of your travel expenses and stay within budget</p>
        </div>

        {/* Trip Selection */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Select 
              value={selectedTrip?.toString() || ""} 
              onValueChange={(value) => setSelectedTrip(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Expenses</SelectItem>
                {userTrips.map((trip: any) => (
                  <SelectItem key={trip.id} value={trip.id.toString()}>
                    {trip.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => setShowExpenseForm(true)}
            className="bg-primary hover:bg-orange-600 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Overview */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTrip && selectedTripData && (
              <BudgetOverview 
                tripData={selectedTripData}
                expenses={tripExpenses}
                categoryTotals={categoryTotals}
              />
            )}

            {/* Expense Form */}
            {showExpenseForm && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Add New Expense</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowExpenseForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleSubmitExpense)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tripId">Trip</Label>
                        <Select 
                          value={form.watch('tripId')?.toString() || ""} 
                          onValueChange={(value) => form.setValue('tripId', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip" />
                          </SelectTrigger>
                          <SelectContent>
                            {userTrips.map((trip: any) => (
                              <SelectItem key={trip.id} value={trip.id.toString()}>
                                {trip.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={form.watch('category')} 
                          onValueChange={(value) => form.setValue('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...form.register('amount')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                          placeholder="e.g., Cusco, Peru"
                          {...form.register('location')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        placeholder="e.g., Hostel accommodation for 2 nights"
                        {...form.register('description')}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createExpenseMutation.isPending}
                        className="bg-primary hover:bg-orange-600"
                      >
                        {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowExpenseForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {selectedTrip ? "Trip Expenses" : "Recent Expenses"}
                    <Badge variant="secondary" className="ml-2">
                      {filteredExpenses.length}
                    </Badge>
                  </span>
                  <div className="text-lg font-semibold text-primary">
                    ${totalSpent.toFixed(2)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expensesLoading || tripExpensesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {filteredExpenses.map((expense: any) => {
                      const CategoryIcon = getCategoryIcon(expense.category);
                      const categoryColor = getCategoryColor(expense.category);
                      
                      return (
                        <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 ${categoryColor} rounded-full flex items-center justify-center mr-4`}>
                              <CategoryIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">{expense.description}</p>
                              <div className="flex items-center text-sm text-gray-600 gap-4">
                                {expense.location && (
                                  <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {expense.location}
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(expense.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-slate-700">${parseFloat(expense.amount).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No expenses yet</h3>
                    <p className="text-gray-500 mb-4">Start tracking your travel expenses</p>
                    <Button 
                      onClick={() => setShowExpenseForm(true)}
                      className="bg-primary hover:bg-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Expense
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Spending Overview
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
                        budget - totalSpent >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        ${(budget - totalSpent).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          budgetUsed <= 80 ? 'bg-success' : budgetUsed <= 100 ? 'bg-accent' : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className={`text-sm ${
                        budgetUsed <= 80 ? 'text-success' : budgetUsed <= 100 ? 'text-orange-600' : 'text-destructive'
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
                  <PieChart className="w-5 h-5 mr-2 text-secondary" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryTotals
                  .filter(category => category.total > 0)
                  .sort((a, b) => b.total - a.total)
                  .map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${category.color} rounded-full mr-3`}></div>
                        <span className="text-sm text-gray-700">{category.label}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        ${category.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                {categoryTotals.every(category => category.total === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No expenses recorded yet</p>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            {totalSpent > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-accent" />
                    Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgetUsed > 100 && (
                    <div className="flex items-start p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Over Budget</p>
                        <p className="text-xs text-red-600">Consider reducing expenses in high-spend categories</p>
                      </div>
                    </div>
                  )}
                  
                  {budgetUsed > 80 && budgetUsed <= 100 && (
                    <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Budget Warning</p>
                        <p className="text-xs text-yellow-600">You're close to your budget limit</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Tip</p>
                      <p className="text-xs text-blue-600">
                        Try local markets and street food to save on food expenses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
