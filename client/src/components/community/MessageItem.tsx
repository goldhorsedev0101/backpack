import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { User, Bot, Download, File, Image, Eye, MoreVertical, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';

interface Attachment {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

interface Message {
  id: number;
  room_id: number;
  user_id?: string;
  author_name?: string;
  message: string;
  created_at: string;
  message_type?: string;
  is_deleted?: boolean;
  is_edited?: boolean;
  edited_at?: string;
  attachments?: Attachment[];
}

interface MessageItemProps {
  message: Message;
  onNavigateToDM?: (dmRoomId: number) => void;
}

export function MessageItem({ message, onNavigateToDM }: MessageItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatFullTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'PPP pp');
    } catch {
      return timestamp;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  const handleImagePreview = (url: string) => {
    setImagePreviewOpen(url);
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Invite to DM mutation
  const inviteToDMMutation = useMutation({
    mutationFn: async () => {
      const currentGuestName = localStorage.getItem('globemate_guest_name') || '';
      const targetAuthor = message.author_name || message.user_id || 'Unknown';
      
      if (!currentGuestName) {
        throw new Error('Please set your name first');
      }
      
      if (currentGuestName === targetAuthor) {
        throw new Error('Cannot create DM with yourself');
      }
      
      // Check if DM room already exists
      const { data: existingRooms } = await supabase
        .from('chat_rooms')
        .select('id, name')
        .eq('type', 'private')
        .or(`name.ilike.%${currentGuestName}%${targetAuthor}%,name.ilike.%${targetAuthor}%${currentGuestName}%`);
      
      if (existingRooms && existingRooms.length > 0) {
        return existingRooms[0];
      }
      
      // Create new DM room
      const roomPayload = {
        name: `DM: ${currentGuestName} & ${targetAuthor}`,
        description: `Private conversation`,
        type: 'private',
        is_private: true,
        created_by: 'guest',
        is_active: true,
        metadata: { type: 'private', dm: true }
      };
      
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert([roomPayload])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add both participants as members
      const members = [
        {
          room_id: room.id,
          guest_name: currentGuestName,
          role: 'admin'
        },
        {
          room_id: room.id,
          guest_name: targetAuthor,
          role: 'member'
        }
      ];
      
      try {
        await supabase
          .from('chat_room_members')
          .insert(members);
      } catch (memberError) {
        console.warn('Could not add DM members:', memberError);
      }
      
      return room;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dm-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat-rooms'] });
      
      if (onNavigateToDM) {
        onNavigateToDM(room.id);
      }
      
      toast({
        title: "DM Opened",
        description: `Started conversation with ${message.author_name || 'user'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create DM",
        description: error.message || "Could not create direct message",
        variant: "destructive",
      });
    }
  });

  const handleInviteToDM = () => {
    if (!message.author_name && !message.user_id) {
      toast({
        title: "Cannot Invite",
        description: "Unable to identify message author",
        variant: "destructive",
      });
      return;
    }
    
    inviteToDMMutation.mutate();
  };

  const getAvatarContent = () => {
    const authorName = message.author_name || 'Guest';
    const firstLetter = authorName.charAt(0).toUpperCase();
    
    // Generate a consistent color based on the author name
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = authorName.length % colors.length;
    
    return (
      <AvatarFallback className={`${colors[colorIndex]} text-white font-medium`}>
        {firstLetter}
      </AvatarFallback>
    );
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {isImageFile(attachment.mimeType) ? (
              <div className="space-y-2">
                <div className="relative max-w-xs">
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImagePreview(attachment.url)}
                    onError={() => setImageError(true)}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 opacity-75 hover:opacity-100"
                    onClick={() => handleImagePreview(attachment.url)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">{attachment.filename}</span>
                  <div className="flex items-center gap-2">
                    <span>{formatFileSize(attachment.sizeBytes)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(attachment)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <File className="w-8 h-8 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{attachment.filename}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(attachment.sizeBytes)}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMessageContent = () => {
    // Handle different message types
    if (message.message_type === 'system') {
      return (
        <div className="italic text-gray-500 text-sm">
          {message.message}
        </div>
      );
    }

    // Regular text message with basic formatting
    const messageText = message.message || '';
    
    // Simple URL detection and linking
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = messageText.split(urlRegex);
    
    return (
      <div className="text-gray-800 whitespace-pre-wrap break-words">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </div>
    );
  };

  return (
    <div className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
      <Avatar className="w-10 h-10 flex-shrink-0">
        {getAvatarContent()}
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">
              {message.author_name || (message.user_id ? `User ${message.user_id.slice(0, 8)}` : 'Guest')}
            </span>
            
            {!message.user_id && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Guest
              </Badge>
            )}
            
            {message.is_edited && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                edited
              </Badge>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs text-gray-500 hover:text-gray-700">
                    {formatTime(message.created_at)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {formatFullTime(message.created_at)}
                    {message.is_edited && message.edited_at && (
                      <>
                        <br />
                        <span className="text-xs text-gray-400">
                          Edited: {formatFullTime(message.edited_at)}
                        </span>
                      </>
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Message Actions Menu */}
          {(message.author_name || message.user_id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleInviteToDM}
                  disabled={inviteToDMMutation.isPending}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {inviteToDMMutation.isPending ? 'Creating DM...' : 'Invite to DM'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="text-sm space-y-2">
          {renderMessageContent()}
          {renderAttachments()}
        </div>
      </div>
      
      {/* Image Preview Modal */}
      {imagePreviewOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setImagePreviewOpen(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={imagePreviewOpen}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}