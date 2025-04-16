// "use client";

// import { useVirtualizer } from '@tanstack/react-virtual';
// import { useEffect, useRef, useState } from 'react';
// import { ChatMessageItem } from './ChatMessageItem';
// import { Message } from '@/types';
// import { ScrollArea } from '../ui/scroll-area';

// interface VirtualizedChatMessagesProps {
//   messages: Message[];
// }

// export const VirtualizedChatMessages: React.FC<VirtualizedChatMessagesProps> = ({ messages }) => {

//   const parentRef = useRef<HTMLDivElement>(null);
//   const count = messages.length;
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const lastMessageRef = useRef<HTMLDivElement>(null);
  
//     // Helper to scroll to bottom of the chat window
//   const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
//       if (lastMessageRef.current) {
//         lastMessageRef.current.scrollTo({
//           top: lastMessageRef.current.scrollHeight,
//           behavior,
//         });
//       }
//     };
  
//     useEffect(() => {
//       setTimeout(() => {
//         lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     }, [messages]);

//   const virtualizer = useVirtualizer({
//     count,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 64,
//     overscan: 5,
//   });

//   return (
//     messages.length === 0 ? (
//           <p className="text-center text-sm text-gray-500 py-4">
//               No messages yet. Start the conversation!
//             </p>
//           ) : (
//     <div className="relative h-full overflow-auto p-4 pr-6">
//       <ScrollArea
//         ref={parentRef}
//         className="overflow-auto"
//         style={{ 
//           height: `${virtualizer.getTotalSize()}px`,
//           width: '100%',
//           position: 'relative',

//         }}
//       >
        
//         {virtualizer.getVirtualItems().map((virtualItem) => {
//           const message = messages[virtualItem.index];
//           return (
//             <div
//               ref={lastMessageRef} 
//               key={virtualItem.key}
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: `${virtualItem.size}px`,
//                 transform: `translateY(${virtualItem.start}px)`,
//               }}
//             >
//               <ChatMessageItem message={message} />
//             </div>
//           );
//         })}
//       </ScrollArea>
//     </div>
//     )
//   );
// };

// export default VirtualizedChatMessages;


// "use client";

// import { useVirtualizer } from '@tanstack/react-virtual';
// import { useEffect, useRef, useState, UIEvent } from 'react';
// import { ChatMessageItem } from './ChatMessageItem';
// import { Message } from '@/types';
// import { ScrollArea } from '../ui/scroll-area';
// import { ScrollToBottom } from './ScrollToBottom';

// interface VirtualizedChatMessagesProps {
//   messages: Message[];
// }

// export const VirtualizedChatMessages: React.FC<VirtualizedChatMessagesProps> = ({ messages }) => {
//   const parentRef = useRef<HTMLDivElement>(null);
//   const [showScrollButton, setShowScrollButton] = useState(false);

//   // Use a ref on the container instead of the individual last message.
//   const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
//     if (parentRef.current) {
//       parentRef.current.scrollTo({ top: parentRef.current.scrollHeight, behavior });
//     }
//   };

//   // Scroll to bottom on initial load and when messages change.
//   useEffect(() => {
//     // A short delay may allow virtualizer to recalc the heights
//     setTimeout(() => {
//       scrollToBottom('smooth');
//     }, 100);
//   }, [messages]);

//   // Virtualizer initialization
//   const virtualizer = useVirtualizer({
//     count: messages.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 64,
//     overscan: 5,
//   });

//   // Scroll event handler to decide when to show the scroll-to-bottom button
//   const handleScroll = (e: UIEvent<HTMLDivElement>) => {
//     const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
//     const isNearBottom = scrollHeight - (scrollTop + clientHeight) > 0;
//     setShowScrollButton(isNearBottom);
//   };

//   return (
//     <div className="relative h-full overflow-auto p-4 pr-6" onScroll={handleScroll} ref={parentRef}>
//       {/* The container height equals the total virtualized content size */}
//       <div style={{ 
//           height: `${virtualizer.getTotalSize()}px`,
//           width: '100%',
//           position: 'relative'
//         }}>
//         {virtualizer.getVirtualItems().map((virtualItem) => {
//           const message = messages[virtualItem.index];
//           const isLastItem = virtualItem.index === messages.length - 1;
//           return (
//             <div
//               key={virtualItem.key}
//               ref={isLastItem ? undefined : null} // We don't need to attach a ref to every item.
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: `${virtualItem.size}px`,
//                 transform: `translateY(${virtualItem.start}px)`,
//               }}
//             >
//               <ChatMessageItem message={message} />
//             </div>
//           );
//         })}
//       </div>

//       {/* ScrollToBottom button */}
//       {showScrollButton && (
//         <div className="sticky bottom-0 right-0 z-10">
//         <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default VirtualizedChatMessages;


"use client";

import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState, UIEvent, useCallback } from 'react';
import { ChatMessageItem } from './ChatMessageItem';
import { Message, UserSnippet } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { ScrollToBottom } from './ScrollToBottom';
import { TypingIndicator } from './TypingIndicator';

interface VirtualizedChatMessagesProps {
  messages: Message[];
  users: UserSnippet[];
  typingUsers: Map<string, string>;
}

const TYPING_INDICATOR_HEIGHT = 40; // Adjust based on your actual indicator height

export const VirtualizedChatMessages: React.FC<VirtualizedChatMessagesProps> = ({ messages, typingUsers, users }) => {
  // Ref for the scroll container.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Controls the visibility of the scroll-to-bottom button.
  const [showScrollButton, setShowScrollButton] = useState(false);

  // const typingNames = (typingUsers || [])
  //   .map(id => users.find(u => u.id === id)?.name)
  //   .filter(Boolean);

  /**
   * Scrolls the container to the bottom with the specified behavior.
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, [scrollContainerRef]);

  // useEffect(() => {
  //   console.log('Virtualized items:', virtualizer.getVirtualItems());
  //   console.log('Total messages:', messages.length);
  //   console.log('Rendered items:', virtualizer.getVirtualItems().length);
  // }, [messages]);


  // Scroll to bottom on initial load and when the messages array changes.
  useEffect(() => {
    // Delay to allow virtualizer to update size calculations.
    const timeout = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, typingUsers.size]);

  // Initialize the virtualizer.
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  /**
   * Handles scroll events and determines whether to show the ScrollToBottom button.
   * Uses a threshold and only updates state when a change is required.
   */
  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Use a threshold (e.g., 100px) to decide when to show the button.
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const shouldShow = distanceFromBottom > 100;
    // Update state only if there's a change.
    setShowScrollButton((prev) => (prev === shouldShow ? prev : shouldShow));
  }, []);

  return (
    <div className="relative h-full">
      {/* The scroll container for virtualized messages */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-auto p-4 pr-6"
        onScroll={handleScroll}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ChatMessageItem message={message} />
              </div>
            );
          })}
          {/* {typingNames.length > 0 && (
        <div className="px-4 py-1 text-sm text-muted-foreground flex items-center gap-2">
          <TypingIndicator />
          {typingNames.join(', ')} {typingNames.length > 1 ? 'are' : 'is'} typing...
        </div>
      )} */}
      {/* Typing indicator positioned below all messages */}
      {typingUsers.size > 0 && (
            <div
              style={{
                position: 'absolute',
                top: virtualizer.getTotalSize(),
                left: 0,
                right: 0,
                height: `${TYPING_INDICATOR_HEIGHT}px`,
                paddingTop: '1rem',
                // paddingLeft: '1rem',
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <TypingIndicator />
              {Array.from(typingUsers.values()).join(', ')} {typingUsers.size > 1 ? 'are' : 'is'} typing...
            </div>
          )}
        </div>
      </div>

      {/* Absolute container for ScrollToBottom, pinned at bottom-right */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4 z-10">
          <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
        </div>
      )}
    </div>
  );
};

export default VirtualizedChatMessages;


// "use client";

// import { useVirtualizer } from '@tanstack/react-virtual';
// import { useEffect, useRef, useState } from 'react';
// import { ChatMessageItem } from './ChatMessageItem';
// import { Message } from '@/types';
// import { ScrollArea } from '../ui/scroll-area';
// import { ScrollToBottom } from './ScrollToBottom';
// import { useScrollDetection } from './useScrollDetection';

// interface VirtualizedChatMessagesProps {
//   messages: Message[];
// }

// export const VirtualizedChatMessages: React.FC<VirtualizedChatMessagesProps> = ({ messages }) => {
//   const parentRef = useRef<HTMLDivElement>(null);
//   const count = messages.length;
//   const { showScrollButton, handleScroll } = useScrollDetection(parentRef);
//   const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
//   const virtualizer = useVirtualizer({
//     count,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 84, // Average message height
//     overscan: 10,
//   });

//   // Verify virtualization by checking DOM nodes
//   useEffect(() => {
//     console.log('Virtualized items:', virtualizer.getVirtualItems());
//     console.log('Total messages:', messages.length);
//     console.log('Rendered items:', virtualizer.getVirtualItems().length);
//   }, [messages]);

//   // Auto-scroll logic
//   useEffect(() => {
//     if (shouldAutoScroll && messages.length > 0) {
//       virtualizer.scrollToIndex(messages.length - 1, { align: 'end', behavior: 'auto' });
//     }
//   }, [messages.length, shouldAutoScroll]);

//   return (
//     <div className="relative h-full">
//       <ScrollArea
//         ref={parentRef}
//         className="h-full p-4 pr-6"
//         onScroll={(e) => {
//           handleScroll(e);
//           const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
//           setShouldAutoScroll(scrollHeight - (scrollTop + clientHeight) < 100);
//         }}
//       >
//         <div
//           style={{
//             height: `${virtualizer.getTotalSize()}px`,
//             width: '100%',
//             position: 'relative',
//           }}
//         >
//           {virtualizer.getVirtualItems().map((virtualItem) => {
//             const message = messages[virtualItem.index];
//             return (
//               <div
//                 key={virtualItem.key}
//                 data-index={virtualItem.index}
//                 ref={virtualizer.measureElement}
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   width: '100%',
//                   transform: `translateY(${virtualItem.start}px)`,
//                 }}
//               >
//                 <ChatMessageItem message={message} />
//               </div>
//             );
//           })}
//         </div>
//       </ScrollArea>

//       {showScrollButton && (
//         <ScrollToBottom 
//           onClick={() => virtualizer.scrollToIndex(messages.length - 1, { behavior: 'smooth' })}
//         />
//       )}
//     </div>
//   );
// };

// export default VirtualizedChatMessages;