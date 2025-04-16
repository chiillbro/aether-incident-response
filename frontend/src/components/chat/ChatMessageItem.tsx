import { Message } from '@/types';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
// import { Check, CheckCheck, Clock } from 'lucide-react';

interface ChatMessageItemProps {
  message: Message;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const { data: session } = useSession();
  const isCurrentUser = message.sender.id === session?.user?.id;

  return (
    <div className={cn(
      "flex items-start gap-3",
      isCurrentUser ? "justify-end" : "justify-start"
    )}>
      {/* Optional: Add Avatar component later */}
      {/* {!isCurrentUser && <Avatar>...</Avatar>} */}
      <div className={cn(
        "max-w-[70%]", // Limit message width
        isCurrentUser ? "order-1" : "order-2"
      )}>
        <div className={cn(
           "rounded-lg px-3 py-2 text-sm break-words", // Allow long words to break
           isCurrentUser
             ? "bg-blue-500 text-white"
             : "bg-gray-100 text-gray-900"
        )}>
           {!isCurrentUser && ( // Show sender name for others' messages
              <p className="font-medium text-xs mb-1">{message.sender?.name || 'Unknown User'}</p>
           )}
          <p>{message.content}</p>
        </div>
         {/* Add to message bubble */}
        {/* <div className="flex items-center gap-1 mt-1">
  {message.status === 'sent' && <Check className="h-3 w-3 text-muted-foreground" />}
  {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
  {message.status === 'pending' && <Clock className="h-3 w-3 text-muted-foreground" />}
  <span className="text-xs text-muted-foreground">
    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
  </span>
</div> */}
        <p className={cn(
           "text-xs text-gray-500 mt-1",
           isCurrentUser ? "text-right" : "text-left"
        )}>
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </p>
      </div>
       {/* {isCurrentUser && <Avatar>...</Avatar>} */}
    </div>
  );
}