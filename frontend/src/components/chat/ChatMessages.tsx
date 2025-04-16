import { Message } from '@/types';
import { ChatMessageItem } from './ChatMessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { ScrollToBottom } from './ScrollToBottom';
// If you wish, you can also import a custom hook for scroll detection,
// but here we show an inline approach for enterprise clarity.

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Helper to scroll to bottom of the chat window
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollTo({
        top: lastMessageRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);


  return (
    <div className="relative h-full">
      <ScrollArea 
        className="h-full p-4 pr-6"
      >
        <div className="space-y-4"
        >
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => 
            <div key={msg.id}
             ref={lastMessageRef} 
            > <ChatMessageItem message={msg} /> 
          </div>)
          )}
        </div>
      </ScrollArea>

      {/* The scroll-to-bottom button only shows when not near the bottom */}
      {showScrollButton && (
        <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
      )}
    </div>
  );
}
