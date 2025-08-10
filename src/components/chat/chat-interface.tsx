import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarInset,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { ChatSidebar } from "./chat-sidebar";
import { ChatInput } from "./chat-input";
import { ChatEmpty } from "./chat-empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatSession, Message } from "@/lib/chat-types";
import { ChatMessage } from "./chat-messages";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eWJodnVmcnF6eXRheXVmYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Nzk0NDUsImV4cCI6MjA2OTU1NTQ0NX0.TIgpjaNbZwsrr39hfh61kkqv34AFFJEgZQFWm9LNssY";
const LS_KEY = 'mentorai_sessions';
const newId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
    
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if(!isClient) return;
    try {
      const savedSessions = localStorage.getItem(LS_KEY);
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        if (parsedSessions.length > 0 && !activeSessionId) {
          setActiveSessionId(parsedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load sessions from localStorage", error);
      toast({
        title: "Error",
        description: "Could not load your previous chat sessions.",
        variant: "destructive",
      });
    }
  }, [isClient]);

  useEffect(() => {
    if(!isClient) return;
    try {
      if (sessions.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify(sessions));
      } else {
        localStorage.removeItem(LS_KEY);
      }
    } catch (error) {
      console.error("Failed to save sessions to localStorage", error);
    }
  }, [sessions, isClient]);

  const activeChat = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: newId(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setSessions(prev => [newChat, ...prev]);
    setActiveSessionId(newChat.id);
    return newChat.id;
  };

  const deleteChat = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    if (activeSessionId === sessionId) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
    toast({
      title: "Chat Deleted",
      description: "The chat session has been removed.",
    });
  };

  const clearAllChats = () => {
    setSessions([]);
    setActiveSessionId(null);
    toast({
      title: "All Chats Cleared",
      description: "Your chat history has been wiped.",
    });
  };

  const sendMessage = async (content: string) => {
    try {
      // Ensure we have an active session
      const sessionId = activeSessionId || createNewChat();
          
      // Create and add user message
      const userMessage = createMessage('user', content);
      addMessageToSession(sessionId, userMessage);
          
      setIsLoading(true);
          
      // Get AI response
      const aiResponse = await getAiResponseWithHistory(sessionId, content);
      const aiMessage = createMessage('assistant', aiResponse.response);
      addMessageToSession(sessionId, aiMessage);

    } catch (error) {
      handleSendMessageError(error, activeSessionId);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  function createMessage(role: 'user' | 'assistant', content: string): Message {
    return { id: newId(), role, content };
  }

  function addMessageToSession(sessionId: string, message: Message) {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message] }
          : s
      )
    );
  }

  async function getAiResponseWithHistory(sessionId: string, content: string) {
    const res = await fetch("https://qzybhvufrqzytayufaww.supabase.co/functions/v1/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ message: content }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Supabase function error:', errorText);
      throw new Error(`Failed to get AI response: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return { response: data.response };
  }

  function handleSendMessageError(error: unknown, sessionId?: string | null) {
    console.error("Failed to send message", error);
      
    toast({
      title: "An error occurred",
      description: "Failed to get a response from the AI tutor.",
      variant: "destructive",
    });
      
    if (sessionId) {
      const errorMessage = createMessage('assistant', "Sorry, I couldn't process that. Please try again.");
      addMessageToSession(sessionId, errorMessage);
    }
  }
      
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-sidebar text-foreground">
        <SidebarInset className="flex flex-row h-full">
          {/* Sidebar Section */}
          <div className="flex flex-col h-full w-64 border-r border-border bg-sidebar">
            <SidebarContent className="flex-1 overflow-y-auto p-2">
              <ChatSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={setActiveSessionId}
                onNewChat={createNewChat}
                onDeleteChat={deleteChat}
              />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-border">
              {sessions.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All Chats</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your chat sessions.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={clearAllChats}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </SidebarFooter>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full bg-background">
            {activeChat ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {activeChat.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>AI is thinking...</span>
                    </div>
                  )}
                </div>
                <div className="sticky bottom-0 bg-background p-4">
                  <ChatInput
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <ChatEmpty onNewChat={createNewChat} />
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
