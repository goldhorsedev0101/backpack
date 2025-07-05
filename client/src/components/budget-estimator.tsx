import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Bed, 
  Bus, 
  Utensils, 
  Ticket, 
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Clock
} from "lucide-react";

interface BudgetEstimatorProps {
  budget: number[];
  onBudgetChange: (value: number[]) => void;
  destination?: string;
  duration?: string;
  travelStyle?: string[];
  className?: string;
}

interface BudgetBreakdown {
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  other: number;
}

interface EstimationData {
  budgetLevel: "budget" | "mid-range" | "luxury";
  dailyCost: number;
  breakdown: BudgetBreakdown;
  recommendations: string[];
  alerts: string[];
}

export default function BudgetEstimator({ 
  budget, 
  onBudgetChange, 
  destination, 
  duration, 
  travelStyle = [],
  className 
}: BudgetEstimatorProps) {
  const [estimation, setEstimation] = useState<EstimationData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Base costs per day for different countries (in USD)
  const baseCosts: Record<string, { budget: number; midRange: number; luxury: number }> = {
    Peru: { budget: 25, midRange: 45, luxury: 80 },
    Colombia: { budget: 30, midRange: 50, luxury: 90 },
    Bolivia: { budget: 20, midRange: 35, luxury: 65 },
    Chile: { budget: 45, midRange: 70, luxury: 120 },
    Argentina: { budget: 35, midRange: 55, luxury: 100 },
    Brazil: { budget: 40, midRange: 65, luxury: 110 },
    Ecuador: { budget: 25, midRange: 40, luxury: 75 },
    Uruguay: { budget: 50, midRange: 75, luxury: 130 },
    Paraguay: { budget: 22, midRange: 38, luxury: 70 },
    Venezuela: { budget: 18, midRange: 32, luxury: 60 }
  };

  // Duration multipliers
  const getDurationDays = (duration: string): number => {
    switch (duration) {
      case "1-2-weeks": return 10;
      case "2-4-weeks": return 21;
      case "1-2-months": return 45;
      case "3-months": return 90;
      default: return 14;
    }
  };

  // Travel style cost multipliers
  const getStyleMultiplier = (styles: string[]): number => {
    let multiplier = 1;
    if (styles.includes('adventure')) multiplier += 0.3; // Equipment, guides
    if (styles.includes('culture')) multiplier += 0.2; // Museums, tours
    if (styles.includes('food')) multiplier += 0.4; // Restaurant visits
    if (styles.includes('nightlife')) multiplier += 0.3; // Bars, clubs
    return multiplier;
  };

  const calculateEstimation = () => {
    if (!destination || !duration) return;

    setIsCalculating(true);
    
    setTimeout(() => {
      const days = getDurationDays(duration);
      const currentBudget = budget[0];
      const dailyBudget = currentBudget / days;
      const baseCost = baseCosts[destination] || baseCosts.Peru;
      const styleMultiplier = getStyleMultiplier(travelStyle);

      // Determine budget level based on daily spending vs base costs
      const adjustedBaseCosts = {
        budget: baseCost.budget * styleMultiplier,
        midRange: baseCost.midRange * styleMultiplier,
        luxury: baseCost.luxury * styleMultiplier
      };

      let budgetLevel: "budget" | "mid-range" | "luxury";
      if (dailyBudget <= adjustedBaseCosts.budget * 1.2) {
        budgetLevel = "budget";
      } else if (dailyBudget <= adjustedBaseCosts.midRange * 1.2) {
        budgetLevel = "mid-range";
      } else {
        budgetLevel = "luxury";
      }

      // Calculate breakdown percentages based on budget level
      const breakdownPercentages = {
        budget: { accommodation: 0.35, transportation: 0.25, food: 0.25, activities: 0.10, other: 0.05 },
        "mid-range": { accommodation: 0.40, transportation: 0.20, food: 0.25, activities: 0.12, other: 0.03 },
        luxury: { accommodation: 0.45, transportation: 0.15, food: 0.25, activities: 0.12, other: 0.03 }
      };

      const percentages = breakdownPercentages[budgetLevel];
      const breakdown: BudgetBreakdown = {
        accommodation: currentBudget * percentages.accommodation,
        transportation: currentBudget * percentages.transportation,
        food: currentBudget * percentages.food,
        activities: currentBudget * percentages.activities,
        other: currentBudget * percentages.other
      };

      // Generate recommendations based on budget level
      const recommendations = generateRecommendations(budgetLevel, destination, travelStyle);
      const alerts = generateAlerts(dailyBudget, adjustedBaseCosts, budgetLevel);

      setEstimation({
        budgetLevel,
        dailyCost: dailyBudget,
        breakdown,
        recommendations,
        alerts
      });

      setIsCalculating(false);
    }, 500);
  };

  const generateRecommendations = (level: string, dest: string, styles: string[]): string[] => {
    const recs: string[] = [];
    
    if (level === "budget") {
      recs.push("Stay in hostels or budget guesthouses");
      recs.push("Use local transportation and buses");
      recs.push("Eat at local markets and street food");
      if (styles.includes('adventure')) recs.push("Book group tours for better rates");
    } else if (level === "mid-range") {
      recs.push("Mix of mid-range hotels and boutique stays");
      recs.push("Combine flights with ground transport");
      recs.push("Try local restaurants and cafes");
      if (styles.includes('culture')) recs.push("Book guided museum tours");
    } else {
      recs.push("Stay in luxury hotels and resorts");
      recs.push("Private transfers and domestic flights");
      recs.push("Fine dining and exclusive experiences");
      if (styles.includes('food')) recs.push("Book cooking classes and wine tours");
    }

    return recs;
  };

  const generateAlerts = (daily: number, costs: any, level: string): string[] => {
    const alerts: string[] = [];
    
    if (daily < costs.budget * 0.8) {
      alerts.push("Very tight budget - consider increasing for more comfort");
    } else if (daily > costs.luxury * 1.5) {
      alerts.push("High budget - you'll have premium options available");
    }
    
    if (level === "budget" && travelStyle.includes('food')) {
      alerts.push("Food experiences may be limited with this budget");
    }
    
    return alerts;
  };

  useEffect(() => {
    if (destination && duration) {
      calculateEstimation();
    }
  }, [budget, destination, duration, travelStyle]);

  const getBudgetLevelColor = (level: string) => {
    switch (level) {
      case "budget": return "bg-green-100 text-green-800";
      case "mid-range": return "bg-blue-100 text-blue-800";
      case "luxury": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const categories = [
    { key: 'accommodation', label: 'Accommodation', icon: Bed, color: 'bg-blue-500' },
    { key: 'transportation', label: 'Transportation', icon: Bus, color: 'bg-green-500' },
    { key: 'food', label: 'Food & Drinks', icon: Utensils, color: 'bg-orange-500' },
    { key: 'activities', label: 'Activities', icon: Ticket, color: 'bg-purple-500' },
    { key: 'other', label: 'Other', icon: MapPin, color: 'bg-gray-500' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Budget Planner
          </span>
          {estimation && (
            <Badge className={getBudgetLevelColor(estimation.budgetLevel)}>
              {estimation.budgetLevel === "mid-range" ? "Mid-Range" : 
               estimation.budgetLevel.charAt(0).toUpperCase() + estimation.budgetLevel.slice(1)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Slider */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-700">Total Budget</span>
            <span className="text-2xl font-bold text-primary">${budget[0].toLocaleString()}</span>
          </div>
          <Slider
            value={budget}
            onValueChange={onBudgetChange}
            max={8000}
            min={500}
            step={100}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>$500</span>
            <span>$8,000</span>
          </div>
        </div>

        {/* Daily Cost Display */}
        {estimation && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-600">Daily Budget</span>
            </div>
            <span className="text-lg font-semibold">${estimation.dailyCost.toFixed(0)}/day</span>
          </div>
        )}

        {/* Loading State */}
        {isCalculating && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-600">Calculating estimates...</span>
          </div>
        )}

        {/* Budget Breakdown */}
        {estimation && !isCalculating && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700">Budget Breakdown</h4>
            <div className="space-y-3">
              {categories.map(category => {
                const amount = estimation.breakdown[category.key as keyof BudgetBreakdown];
                const percentage = (amount / budget[0]) * 100;
                const Icon = category.icon;
                
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">${amount.toFixed(0)}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {estimation && estimation.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
              Smart Recommendations
            </h4>
            <div className="space-y-2">
              {estimation.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-2 bg-amber-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {estimation && estimation.alerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
              Budget Insights
            </h4>
            <div className="space-y-2">
              {estimation.alerts.map((alert, index) => (
                <div key={index} className="flex items-start p-2 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-orange-800">{alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Comparison */}
        {destination && estimation && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Budget vs. Average</span>
              <div className="flex items-center">
                {estimation.dailyCost > (baseCosts[destination]?.midRange || 50) ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-orange-600 mr-1" />
                )}
                <span className="text-sm font-semibold">
                  {estimation.dailyCost > (baseCosts[destination]?.midRange || 50) ? 'Above' : 'Below'} Average
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Average daily cost in {destination}: ${baseCosts[destination]?.midRange || 50}/day
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}