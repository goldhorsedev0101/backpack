import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users,
  Eye,
  Edit,
  Share,
  Clock,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface TripCardProps {
  trip: {
    id: number;
    title: string;
    description?: string;
    destinations: any[];
    startDate?: string;
    endDate?: string;
    budget?: string;
    travelStyle?: string;
    isPublic: boolean;
    createdAt: string;
    user?: {
      id: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
  showUser?: boolean;
  onEdit?: (tripId: number) => void;
  onView?: (tripId: number) => void;
  onDelete?: (tripId: number) => void;
}

export default function TripCard({ trip, showUser = false, onEdit, onView, onDelete }: TripCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  const destinations = Array.isArray(trip.destinations) ? trip.destinations : [];
  const destinationNames = destinations.map((dest: any) => 
    typeof dest === 'string' ? dest : dest.name || dest
  ).join(', ');

  const budget = trip.budget ? parseFloat(trip.budget) : 0;
  const userInitials = trip.user?.firstName && trip.user?.lastName 
    ? `${trip.user.firstName[0]}${trip.user.lastName[0]}`
    : trip.user?.firstName?.[0] || "U";

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (amount: number) => {
    const currency = isRTL ? '₪' : '$';
    const price = isRTL ? Math.round(amount * 3.5) : amount;
    return `${currency}${price.toLocaleString('he-IL')}`;
  };

  const getDuration = () => {
    if (!trip.startDate || !trip.endDate) return null;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const getTravelStyleColor = (style?: string) => {
    if (!style) return "bg-gray-100 text-gray-700";
    
    const normalizedStyle = style.toLowerCase();
    if (normalizedStyle.includes('adventure')) return "bg-green-100 text-green-700";
    if (normalizedStyle.includes('culture')) return "bg-blue-100 text-blue-700";
    if (normalizedStyle.includes('food')) return "bg-orange-100 text-orange-700";
    if (normalizedStyle.includes('nightlife')) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Card className="card-hover overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardContent className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 text-left">
          {trip.title}
        </h3>

        {/* Description */}
        {trip.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-left">
            {trip.description}
          </p>
        )}

        {/* Info Boxes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Destination */}
          {destinationNames && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex flex-col gap-2 items-start">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className={`font-semibold text-purple-800 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'יעד' : 'Destination'}
                  </span>
                </div>
                <p className={`text-purple-700 font-medium text-sm line-clamp-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {destinationNames}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          {trip.startDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex flex-col gap-2 items-start">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className={`font-semibold text-blue-800 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'תאריך' : 'Date'}
                  </span>
                </div>
                <p className={`text-blue-700 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  {formatDate(trip.startDate)}
                </p>
              </div>
            </div>
          )}

          {/* Budget */}
          {budget > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex flex-col gap-2 items-start">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className={`font-semibold text-green-800 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'תקציב' : 'Budget'}
                  </span>
                </div>
                <p className={`text-green-700 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  {formatPrice(budget)}
                </p>
              </div>
            </div>
          )}

          {/* Duration */}
          {getDuration() && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex flex-col gap-2 items-start">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className={`font-semibold text-orange-800 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'משך' : 'Duration'}
                  </span>
                </div>
                <p className={`text-orange-700 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  {getDuration()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Travel Style Tags */}
        {trip.travelStyle && (
          <div className="mb-4 text-left">
            <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
              {trip.travelStyle.split(',').map((style: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 text-left"
                >
                  {style.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* User Info */}
        {showUser && trip.user && (
          <div className={`flex items-center mb-4 pb-4 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Avatar className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`}>
              <AvatarImage src={trip.user.profileImageUrl} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
              {trip.user.firstName} {trip.user.lastName}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className={`flex gap-2 pt-4 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:bg-gray-50"
            onClick={() => {}}
            data-testid={`share-trip-${trip.id}`}
          >
            <Share className="w-4 h-4" />
          </Button>
          
          {!showUser && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
              data-testid={`delete-trip-${trip.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          {!showUser && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-gray-50"
              onClick={() => onEdit?.(trip.id)}
              data-testid={`edit-trip-${trip.id}`}
            >
              <Edit className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {isRTL ? 'עריכה' : 'Edit'}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-gray-50"
            onClick={() => onView?.(trip.id)}
            data-testid={`view-trip-${trip.id}`}
          >
            <Eye className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            {isRTL ? 'צפייה' : 'View'}
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'מחיקת טיול?' : 'Delete Trip?'}</AlertDialogTitle>
            <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
              {isRTL 
                ? `האם אתה בטוח שברצונך למחוק את "${trip.title}"? פעולה זו אינה ניתנת לביטול.`
                : `Are you sure you want to delete "${trip.title}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel data-testid="cancel-delete-trip">
              {isRTL ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(trip.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-trip"
            >
              {isRTL ? 'מחיקה' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
