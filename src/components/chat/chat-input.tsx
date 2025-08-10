
import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // Corresponds to max-h-52 roughly
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [content]);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!content.trim() || isLoading) return;
    onSendMessage(content);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-background/80 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl">
        <Textarea
          ref={textareaRef}
          placeholder="Ask your AI tutor anything..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          className="resize-none pr-16 py-3 max-h-52"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !content.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-accent text-accent-foreground hover:bg-accent/90"
          aria-label="Send message"
        >
         {isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <ArrowUp className="h-4 w-4" />
  )}
        </Button>
      </form>
    </div>
  );
}
