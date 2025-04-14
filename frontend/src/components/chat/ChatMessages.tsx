// import { Message } from '@/types';
// import { ChatMessageItem } from './ChatMessageItem';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { useEffect, useRef } from 'react';

// interface ChatMessagesProps {
//   messages: Message[];
// }

// export function ChatMessages({ messages }: ChatMessagesProps) {
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const viewportRef = useRef<HTMLDivElement>(null);


//    // Auto-scroll to bottom when new messages arrive
//   //  useEffect(() => {
//   //      if (viewportRef.current) {
//   //          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
//   //      }
//   //  }, [messages]);

//    useEffect(() => {
//     if (scrollAreaRef.current) {
//         scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//     }
// }, [messages]);

//   return (
//      <ScrollArea className="h-full p-4" ref={scrollAreaRef} 
//     //  viewportRef={viewportRef}
//      >
//        <div className="space-y-4">
//          {messages.length === 0 && (
//              <p className="text-center text-sm text-gray-500 py-4">No messages yet. Start the conversation!</p>
//          )}
//          {messages.map((msg) => (
//            <ChatMessageItem key={msg.id} message={msg} />
//          ))}
//        </div>
//      </ScrollArea>
//   );
// }


// import { Message } from '@/types';
// import { ChatMessageItem } from './ChatMessageItem';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { ChatScrollButton } from './ScrollToBottom';

// interface ChatMessagesProps {
//   messages: Message[];
// }

// export function ChatMessages({ messages }: ChatMessagesProps) {
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const [showScrollButton, setShowScrollButton] = useState(false);

//   // Function to scroll to bottom
//   const scrollToBottom = useCallback(() => {
//     if (scrollAreaRef.current) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//       setShowScrollButton(false);
//     }
//   }, []);

//   // Auto-scroll and toggle scroll button based on scroll position
//   useEffect(() => {
//     const el = scrollAreaRef.current;
//     if (!el) return;
    
//     // Determine if user is near bottom (within 100px)
//     const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    
//     // Auto-scroll if near bottom, otherwise show button
//     if (isNearBottom) {
//       scrollToBottom();
//     } else {
//       setShowScrollButton(true);
//     }
//   }, [messages, scrollToBottom]);

//   // Handle scroll event in the scroll area
//   const handleScroll = useCallback(() => {
//     const el = scrollAreaRef.current;
//     if (!el) return;
//     const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
//     setShowScrollButton(!isNearBottom);
//   }, []);

//   return (
//     <div className="relative">
//       <ScrollArea
//         className="h-full p-4"
//         ref={scrollAreaRef}
//         onScroll={handleScroll} // Attach onScroll event handler
//       >
//         <div className="space-y-4">
//           {messages.length === 0 && (
//             <p className="text-center text-sm text-gray-500 py-4">
//               No messages yet. Start the conversation!
//             </p>
//           )}
//           {messages.map((msg) => (
//             <ChatMessageItem key={msg.id} message={msg} />
//           ))}
//         </div>
//       </ScrollArea>
//       {showScrollButton && (
//         <ChatScrollButton onClick={scrollToBottom} />
//       )}
//     </div>
//   );
// }


// import { Message } from '@/types';
// import { ChatMessageItem } from './ChatMessageItem';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { useEffect, useRef, useState } from 'react';
// import { ScrollToBottom } from './ScrollToBottom';
// import { useScrollDetection } from './useScrollDetection';

// interface ChatMessagesProps {
//   messages: Message[];
// }

// export function ChatMessages({ messages }: ChatMessagesProps) {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const { showScrollButton } = useScrollDetection(scrollRef);
//   const [autoScroll, setAutoScroll] = useState(true);
//   const prevMessagesLength = useRef(messages.length);

//   // Enhanced scroll logic
//   const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTo({
//         top: scrollRef.current.scrollHeight,
//         behavior
//       });
//     }
//   };
  

//   // Auto-scroll only if:
//   // - New message added (not initial load)
//   // - User hasn't scrolled up
//   useEffect(() => {
//     if (autoScroll && messages.length !== prevMessagesLength.current) {
//       scrollToBottom('smooth');
//     }
//     prevMessagesLength.current = messages.length;
//   }, [messages.length, autoScroll]);

//   return (
//     <div className="relative h-full">
//       <ScrollArea 
//         ref={scrollRef}
//         className="h-full p-4 pr-6"
//         onScroll={(e) => {
//           const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
//           const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
//           setAutoScroll(isNearBottom);
//         }}
//       >
//         <div className="space-y-4">
//           {messages.length === 0 && (
//             <p className="text-center text-sm text-gray-500 py-4">
//               No messages yet. Start the conversation!
//             </p>
//           )}
//           {messages.map((msg) => (
//             <ChatMessageItem key={msg.id} message={msg} />
//           ))}
//         </div>
//       </ScrollArea>
      
//       {showScrollButton && (
//         <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
//       )}
//     </div>
//   );
// }

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
             onScroll={(e) => console.log("hello", e)}
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
