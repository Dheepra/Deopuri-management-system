import { useEffect, useRef, useState } from 'react';

// IntersectionObserver-based reveal trigger. Returns a ref + boolean.
// Attach the ref to any element and use `revealed` to gate animation classes.
export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, revealed];
}
