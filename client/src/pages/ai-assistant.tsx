import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Button } from "../components/ui/button.js";
import { Badge } from "../components/ui/badge.js";
import { ScrollArea } from "../components/ui/scroll-area.js";
import { useToast } from "../hooks/use-toast.js";
import { apiRequest, queryClient } from "../lib/queryClient.js";
import { Link, useLocation } from "wouter";
import { 
  MessageCircle, 
  Trash2, 
  Clock,
  Bot,
  Sparkles,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import AiChat from "../components/ai-chat.js";

interface ChatSession {
  id: number;
  userId: string;
  title: string;
  messages: any[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AiAssistant() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);

  // Check for initial message from home page
  useEffect(() => {
    const storedMessage = sessionStorage.getItem('initialAiMessage');
    if (storedMessage) {
      setInitialMessage(storedMessage);
      sessionStorage.removeItem('initialAiMessage');
      // Clear after a short delay to allow AiChat to process it
      const timer = setTimeout(() => {
        setInitialMessage(undefined);
      }, 1000);
      
      // Cleanup timeout on unmount
      return () => clearTimeout(timer);
    }
  }, []);

  // Scroll to chat area when page loads
  useEffect(() => {
    // Wait for the page to fully render
    const scrollTimer = setTimeout(() => {
      // Find the chat area and scroll it into view (centered)
      const chatArea = document.querySelector('.lg\\:col-span-3');
      if (chatArea) {
        chatArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback: scroll to a reasonable position (not top, not bottom)
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, []);

  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"]
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
      toast({
        title: t('chat_history.deleted_title'),
        description: t('chat_history.deleted_desc'),
      });
      if (selectedSession?.id === deleteMutation.variables) {
        setSelectedSession(null);
      }
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('chat_history.delete_error'),
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleNewChat = () => {
    setSelectedSession(null);
    setInitialMessage(undefined); // Clear initial message for fresh chat
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-teal-500 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  {t('ai_assistant.title')}
                </h1>
                <p className="text-gray-600">
                  {t('ai_assistant.subtitle')}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                {t('common.back')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-t-4 border-t-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    {t('chat_history.your_conversations')}
                  </CardTitle>
                  <Badge variant="secondary">{sessions.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3 border-b">
                  <Button 
                    onClick={handleNewChat}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    data-testid="button-new-chat"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('chat_history.new_chat')}
                  </Button>
                </div>
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">{t('chat_history.no_sessions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 p-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`relative group rounded-2xl transition-all duration-300 overflow-hidden ${
                            selectedSession?.id === session.id
                              ? 'bg-gradient-to-br from-orange-50 via-orange-100 to-teal-50 border-2 border-orange-500 shadow-lg scale-[1.02]'
                              : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg hover:scale-[1.01]'
                          }`}
                        >
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="w-full text-left p-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`relative p-3 rounded-2xl shadow-sm transition-all duration-300 ${
                                selectedSession?.id === session.id
                                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200'
                                  : 'bg-gradient-to-br from-teal-400 to-teal-500 shadow-teal-200 group-hover:from-orange-400 group-hover:to-orange-500'
                              }`}>
                                <MessageCircle className="w-5 h-5 text-white" />
                                {selectedSession?.id === session.id && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-base mb-2 line-clamp-2 transition-colors ${
                                  selectedSession?.id === session.id
                                    ? 'text-orange-900'
                                    : 'text-gray-900 group-hover:text-orange-700'
                                }`}>
                                  {session.title}
                                </h3>
                                <div className="flex items-center gap-4 text-xs">
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                                    selectedSession?.id === session.id
                                      ? 'bg-orange-200/50 text-orange-800'
                                      : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-700'
                                  }`}>
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span className="font-semibold">{session.messages?.length || 0}</span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                                    selectedSession?.id === session.id
                                      ? 'bg-teal-200/50 text-teal-800'
                                      : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700'
                                  }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-medium">{formatDate(session.lastMessageAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(session.id);
                            }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:bg-red-50 rounded-xl border-2 border-transparent hover:border-red-200"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {selectedSession ? (
              <AiChat 
                className="h-full" 
                sessionId={selectedSession.id}
                initialMessages={selectedSession.messages.map((msg: any, index: number) => ({
                  id: `${selectedSession.id}-${index}`,
                  content: msg.content,
                  sender: msg.sender,
                  timestamp: new Date(msg.timestamp),
                  suggestions: msg.suggestions,
                  type: msg.type
                }))}
              />
            ) : (
              <AiChat className="h-full" initialMessage={initialMessage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
