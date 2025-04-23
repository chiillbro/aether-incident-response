import { useCallback, useEffect, useRef } from 'react';

export const useResizeObserver = <T extends HTMLElement>(options?: {
  callback?: ResizeObserverCallback;
}) => {
  const ref = useRef<T>(null);
  const callback = useCallback<ResizeObserverCallback>((...args) => {
    options?.callback?.(...args);
  }, [options?.callback]);

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new ResizeObserver(callback);
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [callback]);

  return { ref };
};