import { 
  Bed,
  Bus,
  Utensils,
  Ticket,
  ShoppingBag,
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
  { id: 'accommodation', labelKey: 'budget.category_accommodation', icon: Bed, color: 'bg-blue-500' },
  { id: 'transportation', labelKey: 'budget.category_transportation', icon: Bus, color: 'bg-green-500' },
  { id: 'food', labelKey: 'budget.category_food', icon: Utensils, color: 'bg-orange-500' },
  { id: 'activities', labelKey: 'budget.category_activities', icon: Ticket, color: 'bg-purple-500' },
  { id: 'other', labelKey: 'budget.category_other', icon: ShoppingBag, color: 'bg-gray-500' },
];