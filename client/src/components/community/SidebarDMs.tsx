import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { MessageSquare, Plus, Search, Users2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface DMRoom {
  id: number;
  name: string;
  type: string;
  partnerName?: string;
  lastMessage?: {
    message: string;
    createdAt: string;
    authorName?: string;
  };
  unreadCount?: number;
  memberCount: number;
  lastActivity: string;
}

interface SidebarDMsProps {
  selectedRoom: number | null;
  onRoomSelect: (roomId: number, roomName?: string) => void;
  onNewDM?: () => void;
}

export function SidebarDMs({ selectedRoom, onRoomSelect, onNewDM }: SidebarDMsProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [partnerInput, setPartnerInput] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get guest name from localStorage
  const [guestName, setGuestName] = useState('');
  useEffect(() => {
    const storedGuestName = localStorage.getItem('globemate_guest_name') || '';
    setGuestName(storedGuestName);
  }, []);

  // Fetch DM rooms
  const { data: dmRooms = [], isLoading, error } = useQuery({
    queryKey: ['/api/dm-rooms'],
    queryFn: () => apiRequest('/api/dm-rooms'),
    retry: false,
    refetchInterval: 10000 // Poll every 10 seconds for new DMs
  });

  // Create DM mutation
  const createDMMutation = useMutation({
    mutationFn: async (partnerName: string) => {
      const currentGuestName = localStorage.getItem('globemate_guest_name') || t('chat.guest');
      return apiRequest('/api/dm-rooms', {
        method: 'POST',
        body: JSON.stringify({
          partnerName: partnerName.trim(),
          guestName: currentGuestName
        })
      });
    },
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dm-rooms'] });
      onRoomSelect(newRoom.id, newRoom.name);
      setShowNewDMModal(false);
      setPartnerInput('');
      toast({
        title: t('chat.dm_created'),
        description: t('chat.started_conversation_with', { name: newRoom.partnerName || t('chat.user_fallback') }),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('chat.failed_to_create_dm'),
        variant: "destructive",
      });
    }
  });

  const handleCreateDM = () => {
    if (!partnerInput.trim()) {
      toast({
        title: t('chat.partner_name_required'),
        description: t('chat.enter_partner_name_error'),
        variant: "destructive",
      });
      return;
    }

    // Check if guest name is set
    const currentGuestName = localStorage.getItem('globemate_guest_name');
    if (!currentGuestName || !currentGuestName.trim()) {
      toast({
        title: t('chat.your_name_required'),
        description: t('chat.set_your_name_first_error'),
        variant: "destructive",
      });
      return;
    }

    createDMMutation.mutate(partnerInput);
  };

  // Ensure dmRooms is always an array
  const roomsArray = Array.isArray(dmRooms) ? dmRooms : [];
  
  const filteredRooms = roomsArray.filter((room: DMRoom) => {
    if (!searchTerm) return true;
    return room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           room.partnerName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatLastActivity = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return t('chat.recently');
    }
  };

  const getAvatarLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getPartnerName = (room: DMRoom) => {
    if (room.partnerName) return room.partnerName;
    // Extract partner name from DM room name if needed
    const roomName = room.name || '';
    if (roomName.includes(' & ')) {
      const names = roomName.split(' & ');
      return names.find(name => name !== guestName) || names[0];
    }
    return roomName;
  };

  if (isLoading) {
    return (
      <Card className="w-80 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('chat.direct_messages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
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

  if (error) {
    return (
      <Card className="w-80 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('chat.direct_messages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">{t('chat.unable_to_load_dms')}</p>
            <p className="text-xs text-gray-400">{t('chat.try_refreshing_page')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('chat.direct_messages')}
          </CardTitle>
          <Dialog open={showNewDMModal} onOpenChange={setShowNewDMModal}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="p-2">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('chat.start_new_conversation_modal')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="partner-name">{t('chat.partner_name')}</Label>
                  <Input
                    id="partner-name"
                    placeholder={t('chat.enter_name_to_chat_placeholder')}
                    value={partnerInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartnerInput(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateDM()}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {guestName ? (
                    <p>{t('chat.chatting_as')} <strong>{guestName}</strong></p>
                  ) : (
                    <p className="text-amber-600">{t('chat.set_name_in_chat_room_first')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateDM}
                    disabled={createDMMutation.isPending || !partnerInput.trim()}
                    className="flex-1"
                  >
                    {createDMMutation.isPending ? t('chat.creating') : t('chat.start_chat')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewDMModal(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('chat.search_conversations')}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium mb-2">{t('chat.no_conversations_yet')}</p>
                <p className="text-xs text-gray-400 mb-4">
                  {t('chat.start_new_conversation')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewDMModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('chat.new_dm')}
                </Button>
              </div>
            ) : (
              filteredRooms.map((room: DMRoom) => {
                const partnerName = getPartnerName(room);
                const isSelected = selectedRoom === room.id;
                
                return (
                  <div
                    key={room.id}
                    onClick={() => onRoomSelect(room.id, room.name)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {getAvatarLetter(partnerName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {partnerName}
                          </h4>
                          {room.unreadCount && room.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {room.lastMessage && (
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {room.lastMessage.authorName && room.lastMessage.authorName !== partnerName && (
                              <span className="font-medium">{t('chat.you_prefix')}</span>
                            )}
                            {room.lastMessage.message}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatLastActivity(room.lastActivity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}