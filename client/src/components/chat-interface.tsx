import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from "@/hooks/useAuth"; // Demo mode
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Users, 
  MapPin,
  Loader2,
  Plus,
  Hash,
  Bot,
  Sparkles
} from "lucide-react";

interface ChatInterfaceProps {
  onBack: () => void;
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = null; // Demo mode - no auth
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/chat/rooms"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedRoom],
    enabled: !!selectedRoom,
  });

  // WebSocket connection
  useEffect(() => {
    if (selectedRoom && user) {
      setIsConnecting(true);
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setSocket(ws);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedRoom] });
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setSocket(null);
        setIsConnecting(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        toast({
          title: "Connection Error",
          description: "Could not connect to chat. Please try again.",
          variant: "destructive",
        });
      };

      return () => {
        ws.close();
      };
    }
  }, [selectedRoom, user, queryClient, toast]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedRoom || !user) return;

    const messageData = {
      type: 'chat_message',
      roomId: selectedRoom,
      userId: user.id,
      text: newMessage.trim(),
    };

    socket.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <MapPin className="w-4 h-4" />;
      case 'general':
        return <Hash className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const selectedRoomData = chatRooms.find((room: any) => room.id === selectedRoom);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-700">Chat Rooms</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Room List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chat Rooms</span>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                {roomsLoading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : chatRooms.length > 0 ? (
                  <div className="space-y-1">
                    {chatRooms.map((room: any) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedRoom === room.id ? 'bg-primary bg-opacity-10 border-r-2 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getRoomIcon(room.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-700 truncate">
                              {room.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate">
                                {room.destination || 'General chat'}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                Online
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No chat rooms</h3>
                    <p className="text-gray-500 text-sm">Chat rooms will appear here</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-3">
            {selectedRoom ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedRoomData && getRoomIcon(selectedRoomData.type)}
                      <span className="ml-2">{selectedRoomData?.name}</span>
                    </div>
                    {isConnecting && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </div>
                    )}
                  </CardTitle>
                  {selectedRoomData?.destination && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedRoomData.destination}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col h-[480px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message: any) => {
                          const isOwnMessage = message.userId === user?.id;
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex items-start space-x-3 ${
                                isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                              }`}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.user?.profileImageUrl} />
                                <AvatarFallback className="text-xs">
                                  {message.user?.firstName?.[0]}{message.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                  {!isOwnMessage && (
                                    <span className="text-sm font-medium text-slate-700">
                                      {message.user?.firstName} {message.user?.lastName}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatTime(message.createdAt)}
                                  </span>
                                </div>
                                
                                <div
                                  className={`inline-block p-3 rounded-lg max-w-xs ${
                                    isOwnMessage
                                      ? 'bg-primary text-white'
                                      : 'bg-gray-100 text-slate-700'
                                  }`}
                                >
                                  <p className="text-sm">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
                          <p className="text-gray-500">Start the conversation!</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={!socket || isConnecting}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !socket || isConnecting}
                        className="bg-primary hover:bg-orange-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Chat Room</h3>
                  <p className="text-gray-500">Choose a room from the sidebar to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
