import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  User,
  Save,
  RefreshCw,
  Clock
} from "lucide-react";
import { RealPlaceLinks } from "@/components/RealPlaceLinks";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: TripSuggestion[];
  type?: 'question' | 'suggestions' | 'general';
}

interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

interface TripSuggestion {
  destination: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  estimatedBudget: {
    low: number;
    high: number;
  };
  highlights: string[];
  travelStyle: string[];
  duration: string;
  realPlaces?: RealPlace[];
}

interface AiChatProps {
  className?: string;
}

export default function AiChat({ className }: AiChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm GlobeMate – your smart travel assistant for worldwide adventures! 🌎\n\nWhether you're traveling solo, as a couple, or with family and kids, I'll help you build the perfect trip! Just tell me what you're thinking (even incomplete ideas like 'I want to go to Japan with 2 adults and 2 kids') and I'll ask the right questions about budget, timing, and what you love to do!\n\nTry one of the prompts below or just start chatting:",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [allSuggestions, setAllSuggestions] = useState<TripSuggestion[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
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
      // Prepare chat history for API call
      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const response = await apiRequest('/api/ai/chat', { 
        method: 'POST',
        body: JSON.stringify({
          message,
          chatHistory,
          previousSuggestions: allSuggestions
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.message || data.response,
        sender: 'ai',
        timestamp: new Date(),
        type: data.type,
        suggestions: data.suggestions
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Add new suggestions to the collection
      if (data.suggestions && data.suggestions.length > 0) {
        setAllSuggestions(prev => [...prev, ...data.suggestions]);
      }
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
    { text: "I want to go to Peru", icon: MapPin },
    { text: "Help me plan a budget trip", icon: DollarSign },
    { text: "I love hiking and nature", icon: Calendar },
    { text: "Solo travel adventure", icon: User }
  ];

  const handleQuickPrompt = (prompt: string) => {
    setNewMessage(prompt);
  };

  const saveTripMutation = useMutation({
    mutationFn: async (suggestion: TripSuggestion) => {
      const tripData = {
        destination: `${suggestion.destination}, ${suggestion.country}`,
        description: suggestion.description,
        estimatedBudget: suggestion.estimatedBudget.high,
        duration: suggestion.duration,
        isPublic: false,
        highlights: suggestion.highlights,
        travelStyle: suggestion.travelStyle
      };
      
      const response = await apiRequest('/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trip Saved!",
        description: "Your trip has been saved to My Trips.",
      });
    },
    onError: (error) => {
      console.error('Save trip error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save trip. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateMoreSuggestions = () => {
    if (messages.length > 1) {
      chatMutation.mutate("Can you give me 3 more different trip suggestions?");
    }
  };

  // Auto-save chat session
  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      if (messages.length <= 2) return null; // Don't save if only welcome message + 1 user message
      
      // Generate title from first user message
      const firstUserMessage = messages.find(m => m.sender === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 60) + (firstUserMessage.content.length > 60 ? '...' : '')
        : 'New Conversation';
      
      const sessionData = {
        title,
        messages: messages.slice(1), // Exclude welcome message
      };

      if (currentSessionId) {
        // Update existing session
        const response = await apiRequest(`/api/chat-sessions/${currentSessionId}`, {
          method: 'PUT',
          body: JSON.stringify(sessionData)
        });
        return response.json();
      } else {
        // Create new session
        const response = await apiRequest('/api/chat-sessions', {
          method: 'POST',
          body: JSON.stringify(sessionData)
        });
        const newSession = await response.json();
        setCurrentSessionId(newSession.id);
        return newSession;
      }
    }
  });

  // Auto-save when messages change
  useEffect(() => {
    if (messages.length > 2) {
      const timer = setTimeout(() => {
        saveSessionMutation.mutate();
      }, 2000); // Save 2 seconds after last message
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const SuggestionCard = ({ suggestion }: { suggestion: TripSuggestion }) => (
    <div className="bg-card border rounded-lg p-4 mb-3 space-y-3 overflow-hidden">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg break-words">{suggestion.destination}</h4>
          <p className="text-sm text-muted-foreground break-words">{suggestion.country}</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          {suggestion.duration}
        </Badge>
      </div>
      
      <p className="text-sm break-words">{suggestion.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium">Budget:</span> ${suggestion.estimatedBudget.low}-${suggestion.estimatedBudget.high}
        </div>
        <div>
          <span className="font-medium">Best Time:</span> {suggestion.bestTimeToVisit}
        </div>
      </div>
      
      <div>
        <span className="font-medium text-xs">Highlights:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {suggestion.highlights.slice(0, 3).map((highlight, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs break-words max-w-full">
              {highlight}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Real Places Links Component */}
      <RealPlaceLinks suggestion={suggestion} />
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => saveTripMutation.mutate(suggestion)}
          disabled={saveTripMutation.isPending}
          className="flex-1"
        >
          <Save className="w-3 h-3 mr-1" />
          Save Trip
        </Button>
      </div>
    </div>
  );

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <span className="break-words">{t('ai_assistant.title')}</span>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            {t('ai_assistant.badge')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
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
                  className={`max-w-[80%] rounded-lg px-3 py-2 break-words ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  
                  {/* Display trip suggestions if included */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">🌎 {t('ai_assistant.trip_suggestions') || 'Trip Suggestions'}</h4>
                        {allSuggestions.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={generateMoreSuggestions}
                            disabled={chatMutation.isPending}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            {t('ai_assistant.more_ideas') || 'More Ideas'}
                          </Button>
                        )}
                      </div>
                      {message.suggestions.map((suggestion, idx) => (
                        <SuggestionCard key={idx} suggestion={suggestion} />
                      ))}
                    </div>
                  )}
                  
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
            <div className="grid grid-cols-1 gap-2">
              {quickPrompts.map((prompt, index) => {
                const IconComponent = prompt.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="justify-start text-left h-auto py-2.5 px-3 w-full"
                  >
                    <IconComponent className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs truncate">{prompt.text}</span>
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
              placeholder="Ask me anything about travel worldwide..."
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