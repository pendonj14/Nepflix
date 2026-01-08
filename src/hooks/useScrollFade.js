// hooks/useScrollFade.js
import { useEffect, useRef, useState } from 'react';

export const useScrollFade = () => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update progress based on how much of the item is visible
        setProgress(entry.intersectionRatio);
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, progress];
};