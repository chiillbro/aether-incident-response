import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Use Textarea for multi-line
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onTyping: () => void;  // Add this prop
}

export function ChatInput({ onSendMessage, isLoading, onTyping }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (value) {
      onTyping();
    }
  };

  const handleSend = () => {
    const content = inputValue.trim();
    if (content && !isLoading) {
      onSendMessage(content);
      setInputValue(''); // Clear input after sending
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
     // Send on Enter, allow Shift+Enter for new line
     if (event.key === 'Enter' && !event.shiftKey) {
         event.preventDefault(); // Prevent default newline behavior
         handleSend();
     }
  };


  return (
    <div className="flex w-full items-center space-x-2">
      <Textarea
        placeholder={isLoading ? "Connecting..." : "Type your message here..."}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none" // Prevent manual resize
        rows={1} // Start with 1 row, auto-expands slightly
        disabled={isLoading}
      />
      <Button type="button" size="icon" onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}