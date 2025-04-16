// MessageReactions.tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../ui/button';
import { SmilePlus } from 'lucide-react';
import { Message } from '@/types';

const REACTIONS = ['👍', '👎', '❤️', '🚀', '🎉', '😮', '👀'];

export function MessageReactions({ message, onReact }: { 
  message: Message;
  onReact: (emoji: string) => void 
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
          <SmilePlus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1 bg-background">
        <div className="flex gap-1">
          {REACTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="h-8 w-8 p-0 text-lg hover:bg-accent"
              onClick={() => onReact(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}