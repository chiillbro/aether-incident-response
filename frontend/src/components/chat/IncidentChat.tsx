import { Message } from '@/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface IncidentChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  incidentId: string; // Needed for context/debugging maybe
  isLoading: boolean; // To disable input while connecting
}

export function IncidentChat({ messages, onSendMessage, incidentId, isLoading }: IncidentChatProps) {
  return (
    <Card className="flex flex-col h-[60vh]"> {/* Fixed height container */}
       <CardHeader>
          <CardTitle>Incident War Room</CardTitle>
       </CardHeader>
       <Separator/>
       <CardContent className="flex-1 overflow-hidden p-0"> {/* Allow content to scroll */}
          <ChatMessages messages={messages} />
       </CardContent>
       <Separator/>
       <CardFooter className="p-4 border-t">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
       </CardFooter>
    </Card>
  );
}