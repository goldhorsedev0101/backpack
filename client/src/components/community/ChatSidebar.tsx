import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { MessageCircle, Users, MapPin, Plus, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  type: string;
  destination?: string;
  memberCount: number;
  maxMembers: number;
  tags?: string[];
  lastActivity: string;
  isActive: boolean;
}

interface ChatSidebarProps {
  selectedRoom: number | null;
  onRoomSelect: (roomId: number) => void;
  onCreateRoom?: () => void;
}

export function ChatSidebar({ selectedRoom, onRoomSelect, onCreateRoom }: ChatSidebarProps) {
  const { data: rooms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/chat-rooms'],
    retry: false
  });

  const formatLastActivity = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'destination': return '🗺️';
      case 'travel_style': return '🎒';
      case 'activity': return '🏃';
      case 'general': return '💬';
      default: return '💬';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-80 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !Array.isArray(rooms)) {
    return (
      <Card className="w-80 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              {error ? 'Unable to load chat rooms' : 'Chat rooms are being set up'}
            </p>
            <div className="space-y-2">
              {error && (
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
              {onCreateRoom && (
                <Button onClick={onCreateRoom} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat Rooms
          </CardTitle>
          {onCreateRoom && (
            <Button onClick={onCreateRoom} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-2">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No chat rooms yet</p>
                <p className="text-sm text-gray-400 mb-4">Be the first to start a conversation! 👋</p>
                {onCreateRoom && (
                  <Button onClick={onCreateRoom} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                )}
              </div>
            ) : (
              rooms.map((room: ChatRoom) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedRoom === room.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => onRoomSelect(room.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="text-lg">
                        {getRoomIcon(room.type)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{room.name}</h3>
                        {!room.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      
                      {room.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      
                      {room.destination && (
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{room.destination}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{room.memberCount}/{room.maxMembers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastActivity(room.lastActivity)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {room.tags && room.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {room.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {room.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{room.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}