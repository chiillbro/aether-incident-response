// src/components/chat/useScrollDetection.ts
import { useEffect, useState } from 'react';

export const useScrollDetection = (scrollRef: React.RefObject<HTMLElement | null>) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const container = scrollRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  return { showScrollButton };
};