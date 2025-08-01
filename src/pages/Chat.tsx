import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  subject: string;
  created_at: string;
}

const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    if (currentSession) {
      fetchMessages();
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
      
      // Auto-select the most recent session
      if (data && data.length > 0 && !currentSession) {
        setCurrentSession(data[0].id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch chat sessions',
        variant: 'destructive',
      });
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', currentSession)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat',
          subject: 'General Discussion',
        })
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      setCurrentSession(data.id);
      setMessages([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession || loading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      // Add user message
      const { error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSession,
          role: 'user',
          content: userMessage,
        });

      if (userMessageError) throw userMessageError;

      // Refresh messages to show user message immediately
      await fetchMessages();

      // Simulate AI response (replace with actual AI integration)
      const aiResponse = generateAIResponse(userMessage);
      
      const { error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSession,
          role: 'assistant',
          content: aiResponse,
        });

      if (aiMessageError) throw aiMessageError;

      // Update session title if it's the first message
      const currentSessionData = sessions.find(s => s.id === currentSession);
      if (currentSessionData?.title === 'New Chat') {
        const newTitle = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
        await supabase
          .from('chat_sessions')
          .update({ title: newTitle })
          .eq('id', currentSession);
        
        setSessions(prev => prev.map(s => 
          s.id === currentSession ? { ...s, title: newTitle } : s
        ));
      }

      await fetchMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simple response generation - replace with actual AI integration
    const responses = [
      "That's an interesting question! Let me help you understand this concept better.",
      "I can definitely help you with that. Here's what you need to know:",
      "Great question! This is a fundamental concept in learning.",
      "Let me break this down for you step by step:",
      "I understand your confusion. Let's clarify this together:",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse} Based on your question about "${userMessage.substring(0, 30)}...", I would recommend focusing on the core principles and practicing with real examples.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat Sessions
                  </CardTitle>
                  <Button size="icon" variant="outline" onClick={createNewSession}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  {sessionsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No chat sessions yet. Start a new conversation!
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {sessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setCurrentSession(session.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            currentSession === session.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className="font-medium truncate">{session.title}</div>
                          <div className="text-sm opacity-70 truncate">{session.subject}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>AI Tutor Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {!currentSession ? (
                    <div className="text-center text-muted-foreground py-12">
                      Select a chat session or create a new one to start chatting
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <div className="text-xs opacity-70 mt-2">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-pulse">AI is typing...</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                {currentSession && (
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask your AI tutor anything..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={loading || !newMessage.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;