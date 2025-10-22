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
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-700 mb-2 line-clamp-1">
              {trip.title}
            </h3>
            
            {showUser && trip.user && (
              <div className="flex items-center mb-2">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarImage src={trip.user.profileImageUrl} />
                  <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  {trip.user.firstName} {trip.user.lastName}
                </span>
              </div>
            )}

            {trip.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>

          {trip.isPublic && (
            <Badge variant="outline" className="ml-2">
              <Users className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
        </div>

        {/* Destinations */}
        {destinationNames && (
          <div className="flex items-center mb-3">
            <MapPin className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700 line-clamp-1">
              {destinationNames}
            </span>
          </div>
        )}

        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Duration/Dates */}
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <div className="text-sm text-gray-600">
              {trip.startDate && trip.endDate ? (
                <div>
                  <div>{formatDate(trip.startDate)}</div>
                  <div className="text-xs text-gray-500">{getDuration()}</div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(trip.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          {budget > 0 && (
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                ${budget.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Travel Style */}
        {trip.travelStyle && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {trip.travelStyle.split(',').map((style: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={`text-xs ${getTravelStyleColor(style.trim())}`}
                >
                  {style.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(trip.id)}
            data-testid={`view-trip-${trip.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          
          {!showUser && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit?.(trip.id)}
                data-testid={`edit-trip-${trip.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
                data-testid={`delete-trip-${trip.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button variant="outline" size="sm" data-testid={`share-trip-${trip.id}`}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trip.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-trip">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(trip.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-trip"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
