import { 
  Bed,
  Bus,
  Utensils,
  Ticket,
  ShoppingBag,
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation', icon: Bed, color: 'bg-blue-500' },
  { id: 'transportation', label: 'Transportation', icon: Bus, color: 'bg-green-500' },
  { id: 'food', label: 'Food & Drinks', icon: Utensils, color: 'bg-orange-500' },
  { id: 'activities', label: 'Activities', icon: Ticket, color: 'bg-purple-500' },
  { id: 'other', label: 'Other', icon: ShoppingBag, color: 'bg-gray-500' },
];