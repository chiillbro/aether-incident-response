// import { Message } from '@/types';
// import { useSession } from 'next-auth/react';
// import { formatDistanceToNow } from 'date-fns';
// import { cn } from '@/lib/utils';
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Assuming Avatar

// interface ChatMessageItemProps {
//   message: Message;
//   // Optional: Pass previous message to detect grouping opportunities
//   prevMessage?: Message | null;
// }

// // Helper for initials
// const getInitials = (name?: string | null): string => { 
//    if (!name) return '?';
//    const names = name.split(' ');
//    if (names.length > 1) {
//      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
//    }
//    return name.substring(0, 2).toUpperCase();
//  };

// export function ChatMessageItem({ message, prevMessage }: ChatMessageItemProps) {
//   const { data: session } = useSession();
//   const currentUserId = session?.user?.id;
//   const isCurrentUser = message.sender.id === currentUserId;

//   // --- Logic for Grouping ---
//   // Group if same sender and sent within (e.g.) 5 minutes of previous message
//   const isGrouped = prevMessage
//                     && prevMessage.sender.id === message.sender.id
//                     && (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) < (5 * 60 * 1000); // 5 mins

//   // --- Logic for Alternating Sides (Example - Could be based on index or other factors) ---
//   // For simplicity, let's stick to User Left / Other Right for now, but you could alternate here
//   const messageAlignment = isCurrentUser ? "justify-end" : "justify-start";
//   const bubbleAlignment = isCurrentUser ? "items-end" : "items-start";
//   const bubbleStyles = isCurrentUser
//       ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none shadow-md" // Example gradient, different rounding
//       : "bg-card border text-card-foreground rounded-tl-none shadow-sm"; // Example: Card background

//   return (
//     // Adjust margin based on grouping
//     <div className={cn(
//       "flex items-end gap-2 md:gap-3", // Use items-end to align avatar with bottom of bubble
//       messageAlignment,
//       isGrouped ? "mt-1" : "mt-4" // Reduced top margin if grouped
//     )}>
//       {/* Avatar - Show only if NOT grouped OR if it's the first message */}
//       {!isCurrentUser && (!isGrouped || !prevMessage) && (
//           <Avatar className="h-8 w-8 border flex-shrink-0">
//               <AvatarFallback>{getInitials(message.sender?.name)}</AvatarFallback>
//           </Avatar>
//       )}
//       {/* Add placeholder for grouped messages to maintain alignment */}
//       {!isCurrentUser && isGrouped && <div className="w-8 flex-shrink-0"></div>}


//       {/* Message Content Wrapper */}
//       <div className={cn(
//         "max-w-[70%] flex flex-col",
//         bubbleAlignment
//       )}>
//          {/* Sender Name - Show only if NOT grouped OR first message from sender */}
//          {!isCurrentUser && (!isGrouped || !prevMessage) && (
//               <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
//                  {message.sender?.name || 'Unknown User'}
//               </p>
//          )}

//         {/* Message Bubble */}
//         <div className={cn(
//            "rounded-xl px-3.5 py-2.5 text-sm break-words", // Slightly more padding, different rounding
//            bubbleStyles,
//            isGrouped ? (isCurrentUser ? 'rounded-br-md' : 'rounded-bl-md') : '' // Adjust rounding slightly for grouped
//         )}>
//           <p className='leading-relaxed'>{message.content}</p>
//         </div>

//         {/* Timestamp - Show only for the LAST message in a group */}
//         {/* Basic check: assume last if not grouped? Needs refinement maybe */}
//         {!isGrouped && (
//             <p className="text-[10px] text-muted-foreground mt-1 px-1">
//                 {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
//             </p>
//         )}
//       </div>

//        {/* Avatar for current user (optional, similar logic) */}
//         {isCurrentUser && (!isGrouped || !prevMessage) && (
//              <Avatar className="h-8 w-8 border flex-shrink-0 order-last">
//                  <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
//              </Avatar>
//         )}
//         {/* Placeholder */}
//         {isCurrentUser && isGrouped && <div className="w-8 flex-shrink-0 order-last"></div>}

//     </div>
//   );
// }

// import { Message } from '@/types';
// import { useSession } from 'next-auth/react';
// import { formatDistanceToNow } from 'date-fns';
// import { cn } from '@/lib/utils';
// // Import an Avatar component if you have one or want to use a placeholder
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// interface ChatMessageItemProps {
//   message: Message;
// }

// // Helper for initials (if using Avatar)
// const getInitials = (name?: string | null): string => {
//     if (!name) return '?';
//     const names = name.split(' ');
//     // Handle cases with more than 2 names, just take first and last
//     if (names.length > 1) {
//         return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
//     } else if (names.length === 1 && names[0].length > 0) {
//         return names[0].substring(0, 2).toUpperCase();
//     }
//     return '?';
// };

// export function ChatMessageItem({ message }: ChatMessageItemProps) {
//   const { data: session } = useSession();
//   const isCurrentUser = message.sender.id === session?.user?.id;

//   return (
//     // --- ADD MARGIN BOTTOM HERE ---
//     <div className={cn(
//       "flex w-full items-start gap-2 md:gap-3", // Added mb-4 (margin-bottom) for spacing
//       isCurrentUser ? "justify-end" : "justify-start"
//     )}>
//       {/* Avatar for other users */}
//       {!isCurrentUser && (
//           <Avatar className="h-8 w-8 border flex-shrink-0">
//               {/* Add src={user.avatarUrl} if available */}
//               <AvatarFallback>{getInitials(message.sender?.name)}</AvatarFallback>
//           </Avatar>
//       )}

//       {/* Message Bubble Content */}
//       <div className={cn(
//         "max-w-[70%] flex flex-col", // Added flex flex-col
//         isCurrentUser ? "items-end" : "items-start" // Align items inside bubble
//       )}>
//          {/* Sender Name (only for others) */}
//          {!isCurrentUser && (
//               <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
//                  {message.sender?.name || 'Unknown User'}
//               </p>
//          )}
//         {/* The actual message bubble */}
//         <div className={cn(
//            "rounded-lg px-3 py-2 text-sm break-words shadow-sm", // Added shadow-sm
//            isCurrentUser
//              ? "bg-primary text-primary-foreground rounded-br-none" // Example: Primary color, different rounding
//              : "bg-muted text-muted-foreground rounded-bl-none" // Example: Muted color, different rounding
//         )}>
//           {/* Message content */}
//           <p className='leading-relaxed'>{message.content}</p> {/* Added leading-relaxed */}
//         </div>
//         {/* Timestamp below the bubble */}
//         <p className={cn(
//            "text-[10px] text-muted-foreground mt-1 px-1",
//            // isCurrentUser ? "text-right" : "text-left" // Alignment handled by parent flex
//         )}>
//           {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
//         </p>
//       </div>

//       {/* Avatar for current user (optional) */}
//       {/* {isCurrentUser && (
//           <Avatar className="h-8 w-8 border flex-shrink-0">
//                <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
//           </Avatar>
//       )} */}
//     </div>
//   );
// }

// frontend/src/components/chat/ChatMessageItem.tsx
import { Message } from '@/types';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageItemProps {
  message: Message;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const { data: session } = useSession();
  const isCurrentUser = message.sender.id === session?.user?.id;

  const messageAlignment = isCurrentUser ? "justify-end" : "justify-start";
  const bubbleAlignment = isCurrentUser ? "items-end" : "items-start";
  const bubbleStyles = isCurrentUser
      ? "bg-primary text-primary-foreground rounded-br-none shadow-md"
      : "bg-card border text-card-foreground rounded-bl-none shadow-sm";

  return (
    // No vertical margins needed here anymore
    <div className={cn(
      "flex w-full items-start gap-2 md:gap-3",
      messageAlignment
    )}>
      {/* Avatar for other users */}
      {!isCurrentUser && (
          <Avatar className="h-8 w-8 border flex-shrink-0">
              <AvatarFallback>{getInitials(message.sender?.name)}</AvatarFallback>
          </Avatar>
      )}

      {/* Message Bubble Content */}
      <div className={cn(
        "max-w-[70%] lg:max-w-[65%] flex flex-col",
        bubbleAlignment
      )}>
         {/* Sender Name */}
         {!isCurrentUser && (
              <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
                 {message.sender?.name || 'Unknown User'}
              </p>
         )}
        {/* Bubble */}
        <div className={cn(
           "rounded-lg px-3 py-2 text-sm break-words",
           bubbleStyles
        )}>
          <p className='leading-relaxed'>{message.content}</p>
        </div>
        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}