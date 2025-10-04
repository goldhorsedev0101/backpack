import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Send, Loader2, RefreshCw, Hash, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MessageItem } from './MessageItem';
import { FileUpload } from './FileUpload';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface Message {
  id: number;
  room_id: number;
  user_id?: string;
  author_name?: string;
  message: string;
  created_at: string;
  message_type?: string;
  is_deleted?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

interface FileUploadPreview {
  file: File;
  id: string;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

interface RoomViewProps {
  roomId: number;
  roomName?: string;
  roomDescription?: string;
  isPrivate?: boolean;
  onNavigateToDM?: (dmRoomId: number) => void;
}

export function RoomView({ roomId, roomName, roomDescription, isPrivate, onNavigateToDM }: RoomViewProps) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileUploadPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get guest name from localStorage
  useEffect(() => {
    const storedGuestName = localStorage.getItem('globemate_guest_name') || '';
    setGuestName(storedGuestName);
  }, []);

  // Save guest name to localStorage
  const saveGuestName = (name: string) => {
    localStorage.setItem('globemate_guest_name', name);
    setGuestName(name);
  };

  // Fetch messages for the room
  const { 
    data: messages = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/chat/messages', roomId],
    queryFn: () => apiRequest(`/api/chat/messages/${roomId}`),
    enabled: !!roomId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
    retry: false
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { 
      message: string; 
      author_name?: string;
      attachments?: FileUploadPreview[];
    }) => {
      let uploadedAttachments: any[] = [];
      
      // Upload files if any
      if (messageData.attachments && messageData.attachments.length > 0) {
        setUploading(true);
        try {
          const uploadPromises = messageData.attachments.map(async (filePreview) => {
            const formData = new FormData();
            formData.append('file', filePreview.file);
            formData.append('roomId', roomId.toString());
            
            const response = await fetch('/api/upload-attachment', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            return response.json();
          });
          
          uploadedAttachments = await Promise.all(uploadPromises);
        } catch (error) {
          setUploading(false);
          throw error;
        }
      }
      
      // Send message with attachment references
      return apiRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          room_id: roomId,
          message: messageData.message,
          author_name: messageData.author_name,
          message_type: uploadedAttachments.length > 0 ? 'file' : 'text',
          attachments: uploadedAttachments
        })
      });
    },
    onSuccess: () => {
      setNewMessage('');
      setSelectedFiles([]);
      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', roomId] });
      scrollToBottom();
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      setUploading(false);
      toast({
        title: t('chat.errors.cant_send_message'),
        description: t('chat.errors.check_connection'),
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    
    // Check if we have a message or files
    if (!trimmedMessage && selectedFiles.length === 0) return;
    if (sendMessageMutation.isPending || uploading) return;

    // Anti-spam check
    if (trimmedMessage && trimmedMessage.length > 2000) {
      toast({
        title: t('chat.errors.message_too_long'),
        description: t('chat.errors.character_limit'),
        variant: "destructive"
      });
      return;
    }

    // Guest mode: ask for name if not provided
    if (!guestName.trim()) {
      const name = prompt("What's your name? (This will be saved for future messages)");
      if (!name?.trim()) return;
      saveGuestName(name.trim());
    }

    // Send message with attachments
    sendMessageMutation.mutate({
      message: trimmedMessage || (selectedFiles.length > 0 ? `Shared ${selectedFiles.length} file(s)` : ''),
      author_name: guestName || 'Guest',
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined
    });
  };

  const handleFilesSelected = (files: FileUploadPreview[]) => {
    setSelectedFiles(files);
  };

  const handleFileRemove = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || messages.length === 0) return;
    
    setIsLoadingMore(true);
    try {
      // TODO: Implement pagination for message history
      // This would need to be implemented in the API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!roomId) {
    return (
      <Card className="flex-1 h-full flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <Hash className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">{t('chat.select_chat_room')}</h3>
            <p className="text-gray-500">{t('chat.choose_room_from_sidebar')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 h-full flex flex-col">
      {/* Room Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isPrivate ? <Lock className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
              {roomName || t('community.room_number', { number: roomId })}
              {isPrivate && (
                <Badge variant="outline" className="text-xs">{t('chat.private')}</Badge>
              )}
            </CardTitle>
            {roomDescription && (
              <p className="text-sm text-gray-600 mt-1">{roomDescription}</p>
            )}
            {isPrivate && (
              <p className="text-xs text-gray-500 mt-1">{t('chat.private_room_notice')}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t('chat.errors.unable_to_load_messages')}</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('chat.errors.try_again')}
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">{t('chat.no_messages_yet')}</h3>
              <p className="text-gray-500">{t('chat.be_first_to_say_hi')}</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {/* Load More Button */}
              {messages.length >= 30 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadMoreMessages}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {t('chat.load_earlier_messages')}
                  </Button>
                </div>
              )}

              {/* Messages */}
              {Array.isArray(messages) && messages
                .filter((msg: Message) => !msg.is_deleted)
                .map((message: Message) => (
                  <MessageItem 
                    key={message.id} 
                    message={message}
                    onNavigateToDM={onNavigateToDM}
                  />
                ))
              }
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Composer */}
        <div className="flex-shrink-0 border-t p-4 space-y-3">
          {/* File Upload Section */}
          <FileUpload
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            selectedFiles={selectedFiles}
            uploading={uploading}
            disabled={sendMessageMutation.isPending}
          />
          
          {/* Message Input */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder={`Message #${roomName || roomId}...`}
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending || uploading}
                className="resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  {guestName ? (
                    <span>{t('chat.posting_as')}: <strong>{guestName}</strong></span>
                  ) : (
                    <span>{t('chat.name_prompt')}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {t('chat.keyboard_shortcuts')}
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || sendMessageMutation.isPending || uploading}
              size="lg"
            >
              {sendMessageMutation.isPending || uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}