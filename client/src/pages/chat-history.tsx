import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  MessageCircle, 
  Trash2, 
  Clock,
  ArrowRight,
  Bot,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface ChatSession {
  id: number;
  userId: string;
  title: string;
  messages: any[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatHistory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

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
      setSelectedSession(null);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-teal-500 rounded-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {t('chat_history.title')}
              </h1>
              <p className="text-gray-600">
                {t('chat_history.subtitle')}
              </p>
            </div>
          </div>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600">
            <Link href="/">
              <Bot className="w-4 h-4 mr-2" />
              {t('chat_history.new_chat')}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card className="border-t-4 border-t-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  {t('chat_history.your_conversations')}
                  <Badge variant="secondary" className="ml-auto">{sessions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
                      <p className="text-gray-500">{t('chat_history.no_sessions')}</p>
                      <Button asChild variant="link" className="mt-2">
                        <Link href="/">
                          {t('chat_history.start_first_chat')}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {sessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className={`w-full text-left p-3 rounded-lg transition-all hover:bg-orange-50 border-2 ${
                            selectedSession?.id === session.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">
                                {session.title}
                              </h3>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {session.messages?.length || 0} {t('chat_history.messages')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatDate(session.lastMessageAt)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedSession.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('common.created')}: {new Date(selectedSession.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(selectedSession.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {selectedSession.messages.map((message: any, index: number) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${
                              message.sender === 'user'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <p className="text-xs font-semibold mb-2">
                                  {t('ai_assistant.trip_suggestions')}:
                                </p>
                                <ul className="text-xs space-y-1">
                                  {message.suggestions.map((suggestion: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span>{suggestion.destination}, {suggestion.country}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <span className="text-xs opacity-70 mt-2 block">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {t('chat_history.select_conversation')}
                  </h3>
                  <p className="text-gray-500">
                    {t('chat_history.select_conversation_desc')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
