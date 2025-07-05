import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Target,
  AlertTriangle
} from "lucide-react";

interface BudgetOverviewProps {
  totalBudget?: number;
  totalSpent?: number;
  expenses?: Array<{
    id: number;
    amount: number;
    category: string;
    description: string;
    date: string;
  }>;
  currency?: string;
}

export default function BudgetOverview({ 
  totalBudget = 0, 
  totalSpent = 0, 
  expenses = [],
  currency = "USD"
}: BudgetOverviewProps) {
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  // Calculate category breakdown
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = () => {
    if (spentPercentage >= 90) return "text-red-600";
    if (spentPercentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (spentPercentage >= 90) return "bg-red-500";
    if (spentPercentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="grid gap-6">
      {/* Budget Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudget.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currency} allocated for trip
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpent.toFixed(2)}
            </div>
            <p className={`text-xs ${getStatusColor()}`}>
              {spentPercentage.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            {remaining >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(remaining).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Budget Progress
            {spentPercentage >= 90 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Over Budget
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spent: ${totalSpent.toFixed(2)}</span>
              <span>Budget: ${totalBudget.toFixed(2)}</span>
            </div>
            <Progress value={Math.min(spentPercentage, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{spentPercentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">${amount.toFixed(2)}</span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% of total spending
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}