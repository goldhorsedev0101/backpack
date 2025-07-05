import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  Send, 
  Loader2,
  Sparkles,
  MapPin,
  DollarSign,
  Calendar,
  User
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AiChatProps {
  className?: string;
}

export default function AiChat({ className }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm TripWise AI, your South American travel assistant. I can help you with trip planning, budget advice, destination recommendations, and practical travel tips. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', { message });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      }]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    
    chatMutation.mutate(userMessage.content);
  };

  const quickPrompts = [
    { text: "Plan a 2-week trip to Peru", icon: MapPin },
    { text: "Budget advice for backpacking", icon: DollarSign },
    { text: "Best time to visit Colombia", icon: Calendar },
    { text: "Safety tips for solo travel", icon: User }
  ];

  const handleQuickPrompt = (prompt: string) => {
    setNewMessage(prompt);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <span>TripWise AI Assistant</span>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="w-4 h-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="w-4 h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground mb-3">Quick questions to get started:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => {
                const IconComponent = prompt.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="justify-start text-left h-auto py-2"
                  >
                    <IconComponent className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{prompt.text}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="px-4 py-3 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask me anything about South American travel..."
              className="flex-1"
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newMessage.trim() || chatMutation.isPending}
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}