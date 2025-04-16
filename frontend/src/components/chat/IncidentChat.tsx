import { Message, UserSnippet } from '@/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import VirtualizedChatMessages from './VirtualizedChatMessages';
import { stressTestMessages } from '@/utils/test-utils';
import { TypingIndicator } from './TypingIndicator';

interface IncidentChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  incidentId: string; // Needed for context/debugging maybe
  isLoading: boolean; // To disable input while connecting
  typingUsers: Map<string, string>;
  users: UserSnippet[]; // Assuming you have user data
  onTyping: () => void;
}

export function IncidentChat({ messages, onSendMessage, incidentId, isLoading, typingUsers, users, onTyping }: IncidentChatProps) {

// const typingNames = typingUsers
//     .map(id => users.find(u => u.id === id)?.name)
//     .filter(Boolean);

  return (
    <Card className="flex flex-col h-[60vh]"> {/* Fixed height container */}

      {/* {typingNames.length > 0 && (
        <div className="px-4 py-1 text-sm text-muted-foreground">
          {typingNames.join(', ')} {typingNames.length > 1 ? 'are' : 'is'} typing...
        </div>
      )} */}
      {/* {typingNames.length > 0 && (
        <div className="px-4 py-1 text-sm text-muted-foreground flex items-center gap-2">
          <TypingIndicator />
          {typingNames.join(', ')} {typingNames.length > 1 ? 'are' : 'is'} typing...
        </div>
      )} */}
       <CardHeader>
          <CardTitle>Incident War Room</CardTitle>
       </CardHeader>
       <Separator/>
       <CardContent className="flex-1 overflow-hidden p-0"> {/* Allow content to scroll */}
         <VirtualizedChatMessages users={users} typingUsers={typingUsers} messages={messages} />
         {/* <VirtualizedChatMessages messages={stressTestMessages} /> */}
          {/* <ChatMessages messages={messages} /> */}
       </CardContent>
       <Separator/>
       <CardFooter className="p-4 border-t">
          <ChatInput onTyping={onTyping} onSendMessage={onSendMessage} isLoading={isLoading} />
       </CardFooter>
    </Card>
  );
}