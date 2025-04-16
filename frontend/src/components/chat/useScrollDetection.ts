// // src/components/chat/useScrollDetection.ts
// import { useEffect, useState } from 'react';

// export const useScrollDetection = (scrollRef: React.RefObject<HTMLElement | null>) => {
//   const [showScrollButton, setShowScrollButton] = useState(false);

//   useEffect(() => {
//     const container = scrollRef?.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const { scrollTop, scrollHeight, clientHeight } = container;
//       const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
//       setShowScrollButton(!isNearBottom);
//     };

//     container.addEventListener('scroll', handleScroll);
//     return () => container.removeEventListener('scroll', handleScroll);
//   }, [scrollRef]);

//   return { showScrollButton };
// };


import { useEffect, useState } from 'react';

export const useScrollDetection = (scrollRef: React.RefObject<HTMLElement | null>) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - (scrollTop + clientHeight) > 100);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return { showScrollButton, handleScroll };
};