import { useEffect, useRef, useState } from "react";

/**
 * Hook for triggering animations when element enters viewport.
 */
export function useScrollAnimation(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Hook for counting animation.
 */
export function useCountAnimation(
  end: number,
  duration = 2000,
  startOnVisible = true
) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const { ref, isVisible } = useScrollAnimation(0.3);

  useEffect(() => {
    if (startOnVisible && !isVisible) return;
    if (hasStarted) return;

    setHasStarted(true);
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, isVisible, startOnVisible, hasStarted]);

  return { count, ref, isVisible };
}
