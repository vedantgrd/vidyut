import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useRouteFocus
 * Automatically manages focus when the route changes, directing keyboard focus
 * to the primary `<main>` element to ensure screen readers announce the new page content.
 */
export const useRouteFocus = (mainElementId: string = 'main-content') => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We defer focus slightly to allow Framer Motion entry animations to mount the DOM node
    const timer = setTimeout(() => {
      const mainElement = document.getElementById(mainElementId);
      if (mainElement) {
        // Elements need tabIndex={-1} to receive programmatic focus
        mainElement.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, mainElementId]);
};
