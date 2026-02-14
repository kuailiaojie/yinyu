import { useEffect, useState } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener('change', fn);
    return () => media.removeEventListener('change', fn);
  }, []);
  return reduced;
}
