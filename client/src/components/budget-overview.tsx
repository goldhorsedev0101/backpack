import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";
import { useIntlFormatters } from "@/lib/intlFormatters";
import { useTranslation } from "react-i18next";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  ShoppingBag
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
  const { t } = useTranslation();
  const { formatCurrency, formatNumber, formatShortDate } = useIntlFormatters();
  const budgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;

  // Calculate category totals
  const categoryTotals = (EXPENSE_CATEGORIES || []).map(category => ({
    ...category,
    total: (expenses || [])
      .filter(expense => expense.category === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })).filter(category => category.total > 0);

  // Get recent expenses (last 5)
  const recentExpenses = (expenses || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getBudgetStatus = () => {
    if (budgetUsed <= 80) return { color: 'text-green-600', icon: CheckCircle, text: t('budget.on_track') };
    if (budgetUsed <= 100) return { color: 'text-orange-600', icon: AlertTriangle, text: t('budget.close_to_limit') };
    return { color: 'text-red-600', icon: AlertTriangle, text: t('budget.over_budget') };
  };

  const status = getBudgetStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Budget Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              {t('budget.budget_overview')}
            </span>
            <Badge variant={budgetUsed <= 80 ? "default" : budgetUsed <= 100 ? "secondary" : "destructive"}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Progress */}
          {totalBudget > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('budget.budget_progress')}</span>
                <span className="text-sm font-medium">{budgetUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    budgetUsed <= 80 ? 'bg-green-500' : budgetUsed <= 100 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalSpent, currency)}
              </div>
              <div className="text-sm text-gray-600">{t('budget.total_spent')}</div>
            </div>

            {totalBudget > 0 && (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {formatCurrency(totalBudget, currency)}
                  </div>
                  <div className="text-sm text-gray-600">{t('budget.budget')}</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {remaining >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(remaining), currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {remaining >= 0 ? t('budget.remaining') : t('budget.over_budget')}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-primary" />
              {t('budget.spending_by_category')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(categoryTotals || []).map((category) => {
                const CategoryIcon = category.icon;
                const percentage = totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${category.color} mr-3`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{t(category.labelKey)}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.total, currency)}</div>
                        <div className="text-sm text-gray-600">{formatNumber(percentage, { maximumFractionDigits: 1 })}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${category.color} opacity-70`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              {t('budget.recent_expenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentExpenses || []).map((expense, index) => {
                const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category);
                const CategoryIcon = category?.icon || ShoppingBag;
                
                return (
                  <div key={expense.id}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'} mr-3`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-gray-600">
                            {category?.label || t('budget.other')} • {formatShortDate(expense.date)}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {formatCurrency(expense.amount, currency)}
                      </div>
                    </div>
                    {index < (recentExpenses || []).length - 1 && <Separator className="mt-2" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(expenses || []).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">{t('budget.no_expenses_yet')}</h3>
            <p className="text-gray-500">{t('budget.start_adding_expenses_to_see_overview')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}