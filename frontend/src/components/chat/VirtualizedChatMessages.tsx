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
  users?: UserSnippet[];
  typingUsers: Map<string, string>;
}

const TYPING_INDICATOR_HEIGHT = 40; // Adjust based on your actual indicator height
const ROW_VERTICAL_SPACING = 6; // Desired space between messages (pb-4 equivalent)


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

  // --- Use Dynamic Measurement ---
  // Store measured sizes in a ref to avoid recalculations on re-render
  const rowSizeCache = useRef<Map<number, number>>(new Map());

  // --- INCREASE ESTIMATE SIZE ---
  // Estimate needs to include average item height PLUS desired spacing below item
  // Try 88 = ~64 (average bubble) + 8 (name) + 16 (spacing below)
  // Adjust this value based on testing!
  // const estimateSize = useCallback(() => 88, []);
  // -----------------------------

  // Initialize the virtualizer.
  // const virtualizer = useVirtualizer({
  //   count: messages.length,
  //   getScrollElement: () => scrollContainerRef.current,
  //   estimateSize: estimateSize,
  //   overscan: 5,
  // });

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollContainerRef.current,
    // Provide estimate, but measurement will override it
    estimateSize: useCallback(() => 88, []), // Keep a reasonable estimate
    // --- ADD MEASUREMENT LOGIC ---
    measureElement: (element) => {
        // Add the desired spacing to the measured height
        return element.getBoundingClientRect().height + ROW_VERTICAL_SPACING;
    },
    // Store measurements for stability
    // This part seems less standard in v3, measurement often happens implicitly
    // Let's rely on the measureElement callback for now.
    // If performance issues arise, explore explicit caching strategies if library supports.
    // --- --------------------- ---
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

   // --- Calculate Total Height (more accurate with measurements) ---
  // Note: getTotalSize() uses measured sizes if available, otherwise estimates.
  const totalHeight = virtualizer.getTotalSize() + (typingUsers.size > 0 ? TYPING_INDICATOR_HEIGHT + ROW_VERTICAL_SPACING : 0);
  // ---------------------------------------------------------------



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

  // return (
  //   <div className="relative h-full bg-muted/20 dark:bg-muted/5">
  //     {/* The scroll container for virtualized messages */}
  //     <div
  //       ref={scrollContainerRef}
  //       className="h-full overflow-y-auto overflow-x-hidden p-4 pr-6"
  //       onScroll={handleScroll}
  //       style={{ contain: 'strict' }}
  //     >
  //       <div
  //         style={{
  //           height: `${virtualizer.getTotalSize()}px`,
  //           width: '100%',
  //           position: 'relative',
  //         }}
  //       >
  //         {virtualizer.getVirtualItems().map((virtualItem, index) => {
  //           const message = messages[virtualItem.index];
  //           return (
  //             <div
  //               key={virtualItem.key}
  //               style={{
  //                 position: 'absolute',
  //                 top: 0,
  //                 left: 0,
  //                 width: '100%',
  //                 // height: `${virtualItem.size}px`, // Add extra height for current user
  //                 transform: `translateY(${virtualItem.start}px)`,
  //               }}
  //             >
  //               <ChatMessageItem message={message} />
  //             </div>
  //           );
  //         })}
  //         {/* {typingNames.length > 0 && (
  //       <div className="px-4 py-1 text-sm text-muted-foreground flex items-center gap-2">
  //         <TypingIndicator />
  //         {typingNames.join(', ')} {typingNames.length > 1 ? 'are' : 'is'} typing...
  //       </div>
  //     )} */}
  //     {/* Typing indicator positioned below all messages */}
  //     {typingUsers.size > 0 && (
  //           <div
  //             style={{
  //               // position: 'absolute',
  //               // top: virtualizer.getTotalSize(),
  //               // left: 0,
  //               // right: 0,
  //               // height: `${TYPING_INDICATOR_HEIGHT}px`,
  //               // paddingTop: '1rem',
  //               // paddingLeft: '1rem',

  //               position: 'absolute',
  //               top: `${virtualizer.getTotalSize()}px`, // Position after last message
  //               left: 0,
  //               width: '100%', // Ensure it spans width
  //               height: `${TYPING_INDICATOR_HEIGHT}px`,
  //               // Add horizontal padding to match scroll container's padding
  //               paddingLeft: '1rem', // Match p-4
  //               paddingRight: '1.5rem', // Match pr-6
  //             }}
  //             className="flex items-center gap-2 text-sm text-muted-foreground"
  //           >
  //             <TypingIndicator />
  //             {Array.from(typingUsers.values()).join(', ')} {typingUsers.size > 1 ? 'are' : 'is'} typing...
  //           </div>
  //         )}
  //       </div>
  //     </div>

  //     {/* Absolute container for ScrollToBottom, pinned at bottom-right */}
  //     {showScrollButton && (
  //       <div className="absolute bottom-4 right-4 z-10">
  //         <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
  //       </div>
  //     )}
  //   </div>
  // );

  return (
    <div className="relative h-full bg-muted/20 dark:bg-muted/5">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-hidden p-4 pr-6" // Keep padding here
        onScroll={handleScroll}
        style={{ contain: 'strict' }}
      >
        {/* Virtualizer Sizer Div */}
        <div
          style={{
            height: `${totalHeight}px`, // Use measured total height
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Rendered Virtual Items */}
          {virtualItems.map((virtualItem) => {
            const message = messages[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                // --- Attach ref for measurement ---
                ref={virtualizer.measureElement}
                // ---------------------------------
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  // Height is determined by measurement now
                  // height: `${virtualItem.size}px`, // REMOVE THIS
                  transform: `translateY(${virtualItem.start}px)`,
                   // REMOVE PADDING HERE - handled by measurement + item's internal padding/margin
                }}
              >
                 {/* Add spacing *below* the item content using margin */}
                 <div 
                //\\  style={{ marginBottom: `${ROW_VERTICAL_SPACING}px` }}
                 >
                     <ChatMessageItem message={message} />
                 </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div
              style={{
                position: 'absolute',
                top: `${virtualizer.getTotalSize()}px`,
                left: 0,
                width: '100%',
                height: `${TYPING_INDICATOR_HEIGHT}px`,
                paddingLeft: '1rem', // Horizontal padding
                paddingRight: '1.5rem',
                // paddingBottom: `${ROW_VERTICAL_SPACING}px`, // Padding below indicator
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground pt-2"
            >
              <TypingIndicator />
              {/* ... Typing users text ... */}
               {Array.from(typingUsers.values()).slice(0, 2).join(', ')}
               {typingUsers.size > 2 && `, and ${typingUsers.size - 2} more`}
               {typingUsers.size > 1 ? ' are' : ' is'} typing...
            </div>
          )}
        </div>
      </div>

      {/* Scroll To Bottom Button */}
      
       {/* Absolute container for ScrollToBottom, pinned at bottom-right */}
       {showScrollButton && (
         <div className="absolute bottom-4 right-4 z-10">
           <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
         </div>
       )}
    </div>
  )
};

export default VirtualizedChatMessages;