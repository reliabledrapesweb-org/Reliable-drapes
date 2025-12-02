import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position
 * @param threshold - Scroll threshold in pixels (default: 50)
 * @returns Boolean indicating if user has scrolled past threshold
 */
export function useScrollPosition(threshold: number = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
