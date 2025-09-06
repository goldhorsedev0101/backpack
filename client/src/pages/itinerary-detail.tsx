import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Edit3,
  Save,
  Download,
  Share2,
  Trash2,
  Plus,
  GripVertical,
  MapPin,
  Clock,
  DollarSign,
  FileDown,
  Printer,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";

interface ItineraryDay {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

interface ItineraryItem {
  id?: string;
  day_index: number;
  item_index: number;
  name: string;
  entity_type?: string;
  entity_id?: string;
  start_time?: string;
  end_time?: string;
  address?: string;
  lat?: number;
  lon?: number;
  est_cost?: number;
  notes?: string;
}

interface ItineraryData {
  id: string;
  title: string;
  plan_json: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function ItineraryDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ItineraryItem | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [editingActivity, setEditingActivity] = useState<{dayIndex: number, activityIndex: number} | null>(null);
  const [editActivityName, setEditActivityName] = useState("");

  // Fetch itinerary data
  const { data: itinerary, isLoading, error } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as ItineraryData;
    },
    enabled: isAuthenticated && !!user && !!id,
  });

  // Update title when itinerary loads
  useEffect(() => {
    if (itinerary) {
      setEditedTitle(itinerary.title);
    }
  }, [itinerary]);

  // Parse itinerary days from plan_json
  const itineraryDays: ItineraryDay[] = itinerary?.plan_json?.itinerary || [];

  // Update title mutation
  const updateTitleMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      if (!user || !itinerary) return;

      const { error } = await supabase
        .from('itineraries')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', itinerary.id)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "כותרת עודכנה",
        description: "הכותרת נשמרה בהצלחה",
      });
      queryClient.invalidateQueries({ queryKey: ['itinerary', id] });
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
      setIsEditingTitle(false);
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון",
        description: "לא הצלחנו לעדכן את הכותרת",
        variant: "destructive",
      });
    },
  });

  // Delete itinerary mutation
  const deleteItineraryMutation = useMutation({
    mutationFn: async () => {
      if (!user || !itinerary) return;

      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itinerary.id)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "איטינררי נמחק",
        description: "האיטינררי נמחק בהצלחה",
      });
      setLocation("/my-trips");
    },
    onError: () => {
      toast({
        title: "שגיאה במחיקה",
        description: "לא הצלחנו למחוק את האיטינררי",
        variant: "destructive",
      });
    },
  });

  // Update itinerary activities mutation
  const updateActivitiesMutation = useMutation({
    mutationFn: async (updatedDays: ItineraryDay[]) => {
      if (!user || !itinerary) return;

      const updatedPlan = {
        ...itinerary.plan_json,
        itinerary: updatedDays
      };

      const { error } = await supabase
        .from('itineraries')
        .update({ 
          plan_json: updatedPlan, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', itinerary.id)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "שינויים נשמרו",
        description: "השינויים נשמרו בהצלחה",
      });
      queryClient.invalidateQueries({ queryKey: ['itinerary', id] });
    },
    onError: () => {
      toast({
        title: "שגיאה בשמירה",
        description: "לא הצלחנו לשמור את השינויים",
        variant: "destructive",
      });
    },
  });

  // Export functions
  const exportAsJSON = () => {
    if (!itinerary) return;
    
    const dataStr = JSON.stringify(itinerary.plan_json, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerary_${itinerary.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    if (!itinerary || !itineraryDays.length) return;

    const csvData = [];
    csvData.push(['Day', 'Location', 'Activity', 'Estimated Cost', 'Tips']);

    itineraryDays.forEach(day => {
      day.activities.forEach((activity, index) => {
        csvData.push([
          day.day.toString(),
          day.location,
          activity,
          index === 0 ? day.estimatedCost.toString() : '',
          day.tips.join('; ')
        ]);
      });
    });

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerary_${itinerary.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsICS = () => {
    if (!itinerary || !itineraryDays.length) return;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TripWise//Itinerary//EN',
      'CALSCALE:GREGORIAN',
    ];

    const baseDate = new Date();
    itineraryDays.forEach(day => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + day.day - 1);
      
      day.activities.forEach((activity, index) => {
        const startTime = new Date(dayDate);
        startTime.setHours(9 + index * 2, 0, 0); // Default 2 hours per activity
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2);

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${day.day}-${index}-${Date.now()}@tripwise.com`,
          `DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `SUMMARY:${activity}`,
          `LOCATION:${day.location}`,
          `DESCRIPTION:${day.tips.join('\\n')}`,
          'END:VEVENT'
        );
      });
    });

    icsContent.push('END:VCALENDAR');
    
    const dataBlob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerary_${itinerary.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== itinerary?.title) {
      updateTitleMutation.mutate(editedTitle.trim());
    } else {
      setIsEditingTitle(false);
    }
  };

  // Drag and drop handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !itinerary) return;

    const { source, destination } = result;
    const newDays = [...itineraryDays];

    // Find source and destination days
    const sourceDayIndex = newDays.findIndex(day => day.day === parseInt(source.droppableId));
    const destDayIndex = newDays.findIndex(day => day.day === parseInt(destination.droppableId));

    if (sourceDayIndex === -1 || destDayIndex === -1) return;

    // Get the activity being moved
    const [movedActivity] = newDays[sourceDayIndex].activities.splice(source.index, 1);

    // Add to destination
    newDays[destDayIndex].activities.splice(destination.index, 0, movedActivity);

    // Update the itinerary
    updateActivitiesMutation.mutate(newDays);
  };

  // Add new activity
  const handleAddActivity = () => {
    if (!newActivityName.trim() || !itinerary) return;

    const newDays = [...itineraryDays];
    const dayIndex = newDays.findIndex(day => day.day === selectedDay);
    
    if (dayIndex !== -1) {
      newDays[dayIndex].activities.push(newActivityName.trim());
      updateActivitiesMutation.mutate(newDays);
      setNewActivityName("");
      setIsAddingActivity(false);
    }
  };

  // Delete activity
  const handleDeleteActivity = (dayNumber: number, activityIndex: number) => {
    if (!itinerary) return;

    const newDays = [...itineraryDays];
    const dayIndex = newDays.findIndex(day => day.day === dayNumber);
    
    if (dayIndex !== -1) {
      newDays[dayIndex].activities.splice(activityIndex, 1);
      updateActivitiesMutation.mutate(newDays);
    }
  };

  // Edit activity
  const handleEditActivity = (dayNumber: number, activityIndex: number) => {
    const dayIndex = itineraryDays.findIndex(day => day.day === dayNumber);
    if (dayIndex !== -1) {
      setEditingActivity({ dayIndex: dayNumber, activityIndex });
      setEditActivityName(itineraryDays[dayIndex].activities[activityIndex]);
    }
  };

  const handleSaveEditActivity = () => {
    if (!editActivityName.trim() || !editingActivity || !itinerary) return;

    const newDays = [...itineraryDays];
    const dayIndex = newDays.findIndex(day => day.day === editingActivity.dayIndex);
    
    if (dayIndex !== -1) {
      newDays[dayIndex].activities[editingActivity.activityIndex] = editActivityName.trim();
      updateActivitiesMutation.mutate(newDays);
      setEditingActivity(null);
      setEditActivityName("");
    }
  };

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">נדרשת התחברות</CardTitle>
            <CardDescription className="text-center">
              התחבר כדי לצפות באיטינררי שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => signInWithGoogle()}>
              התחבר עם Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p>טוען איטינררי...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">שגיאה</CardTitle>
            <CardDescription className="text-center">
              לא הצלחנו לטעון את האיטינררי
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/my-trips")} variant="outline">
              חזור לרשימת איטינררים
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
            .bg-gray-50 { background: white !important; }
            .border { border: 1px solid #ddd !important; }
            .shadow-lg { box-shadow: none !important; }
            .sticky { position: static !important; }
          }
        `
      }} />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/my-trips")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                חזור
              </Button>
              
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="font-semibold"
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') {
                        setEditedTitle(itinerary.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleTitleSave} disabled={updateTitleMutation.isPending}>
                    {updateTitleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900">{itinerary.title}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ייצוא
                </Button>
                {isExportMenuOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <div className="py-1">
                      <button
                        onClick={() => { exportAsJSON(); setIsExportMenuOpen(false); }}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        הורד JSON
                      </button>
                      <button
                        onClick={() => { exportAsCSV(); setIsExportMenuOpen(false); }}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        הורד CSV
                      </button>
                      <button
                        onClick={() => { exportAsICS(); setIsExportMenuOpen(false); }}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        הורד ICS
                      </button>
                      <button
                        onClick={() => { handlePrint(); setIsExportMenuOpen(false); }}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        הדפס
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Days Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ימי הטיול</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {itineraryDays.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`w-full text-right p-3 rounded-lg border transition-colors ${
                        selectedDay === day.day
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="font-medium">יום {day.day}</div>
                      <div className="text-sm opacity-80">{day.location}</div>
                      <div className="text-xs opacity-60 mt-1">
                        {day.activities.length} פעילויות • ${day.estimatedCost}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Content */}
          <div className="flex-1">
            {itineraryDays.length > 0 && (
              <div>
                {itineraryDays
                  .filter(day => day.day === selectedDay)
                  .map((day) => (
                    <Card key={day.day}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <MapPin className="w-5 h-5 mr-2 text-primary" />
                              יום {day.day} - {day.location}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-2">
                              <DollarSign className="w-4 h-4 mr-1" />
                              עלות משוערת: ${day.estimatedCost}
                            </CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsAddingActivity(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            הוסף פעילות
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Activities */}
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-3">פעילויות</h4>
                              
                              {/* Add Activity Form */}
                              {isAddingActivity && selectedDay === day.day && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      placeholder="שם הפעילות החדשה..."
                                      value={newActivityName}
                                      onChange={(e) => setNewActivityName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddActivity();
                                        if (e.key === 'Escape') {
                                          setIsAddingActivity(false);
                                          setNewActivityName("");
                                        }
                                      }}
                                      className="flex-1"
                                      autoFocus
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={handleAddActivity}
                                      disabled={!newActivityName.trim() || updateActivitiesMutation.isPending}
                                    >
                                      {updateActivitiesMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        "הוסף"
                                      )}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setIsAddingActivity(false);
                                        setNewActivityName("");
                                      }}
                                    >
                                      ביטול
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <Droppable droppableId={day.day.toString()}>
                                {(provided, snapshot) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`space-y-2 min-h-[100px] p-2 rounded-lg transition-colors ${
                                      snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
                                    }`}
                                  >
                                    {day.activities.map((activity, index) => (
                                      <Draggable 
                                        key={`${day.day}-${index}`} 
                                        draggableId={`${day.day}-${index}`} 
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow ${
                                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                            }`}
                                          >
                                            <div
                                              {...provided.dragHandleProps}
                                              className="mr-3 cursor-move hover:text-primary"
                                            >
                                              <GripVertical className="w-4 h-4 text-gray-400" />
                                            </div>
                                            
                                            <div className="flex-1">
                                              {editingActivity?.dayIndex === day.day && editingActivity?.activityIndex === index ? (
                                                <div className="flex items-center space-x-2">
                                                  <Input
                                                    value={editActivityName}
                                                    onChange={(e) => setEditActivityName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') handleSaveEditActivity();
                                                      if (e.key === 'Escape') {
                                                        setEditingActivity(null);
                                                        setEditActivityName("");
                                                      }
                                                    }}
                                                    className="flex-1"
                                                    autoFocus
                                                  />
                                                  <Button 
                                                    size="sm" 
                                                    onClick={handleSaveEditActivity}
                                                    disabled={!editActivityName.trim() || updateActivitiesMutation.isPending}
                                                  >
                                                    {updateActivitiesMutation.isPending ? (
                                                      <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                      <Save className="w-4 h-4" />
                                                    )}
                                                  </Button>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => {
                                                      setEditingActivity(null);
                                                      setEditActivityName("");
                                                    }}
                                                  >
                                                    ביטול
                                                  </Button>
                                                </div>
                                              ) : (
                                                <div className="font-medium">{activity}</div>
                                              )}
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleEditActivity(day.day, index)}
                                                disabled={editingActivity !== null}
                                              >
                                                <Edit3 className="w-4 h-4" />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteActivity(day.day, index)}
                                                disabled={updateActivitiesMutation.isPending}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    
                                    {day.activities.length === 0 && (
                                      <div className="text-center py-8 text-gray-500">
                                        <div className="text-lg mb-2">אין פעילויות ליום זה</div>
                                        <div className="text-sm">לחץ על "הוסף פעילות" כדי להתחיל</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        </DragDropContext>

                          {/* Tips */}
                          {day.tips.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">טיפים מקומיים</h4>
                              <div className="space-y-2">
                                {day.tips.map((tip, index) => (
                                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm">{tip}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת איטינררי</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את האיטינררי "{itinerary.title}"?
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteItineraryMutation.mutate();
                setIsDeleteDialogOpen(false);
              }}
              disabled={deleteItineraryMutation.isPending}
            >
              {deleteItineraryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}