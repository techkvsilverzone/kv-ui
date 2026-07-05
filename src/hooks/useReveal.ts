import { useEffect, useRef } from 'react';

/**
 * Scroll-reveal: attach the returned ref to an element that has the `reveal`
 * utility class (see index.css). When the element scrolls into view it gains
 * `is-visible` and fades/slides in. Reveals once, then unobserves.
 *
 * Falls back to visible immediately if IntersectionObserver is unavailable or
 * the user prefers reduced motion (the CSS also no-ops motion in that case).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // options is a fresh object each render; intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
