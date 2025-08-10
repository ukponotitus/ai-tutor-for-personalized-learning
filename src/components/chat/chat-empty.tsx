import { Bot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatEmptyProps {
  onNewChat: () => void;
}

export function ChatEmpty({ onNewChat }: ChatEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Bot className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold font-headline">Welcome to MentorAI</h2>
      <p className="max-w-md text-muted-foreground">
        Select a previous conversation or start a new one to get help from your personal AI tutor.
      </p>
      <Button onClick={onNewChat} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        Start a New Chat
      </Button>
    </div>
  );
}
