import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/lib/chat-types";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

export function ChatSidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteChat }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full p-2">
      <Button onClick={onNewChat} className="mb-2">
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      <ScrollArea className="flex-1 -mx-2">
        <div className="px-2 space-y-1">
          {sessions.map(session => (
            <div key={session.id} className="group relative">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 truncate pr-8 h-10",
                  activeSessionId === session.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1 text-left">{session.title}</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(session.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
