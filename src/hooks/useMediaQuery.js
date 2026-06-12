// Shared viewport media-query hook (v123). Extracted from Modal.jsx's inline
// matchMedia pattern so the desktop shell swap (App.jsx, 1024px) and the modal
// sheet split (Modal.jsx, independent 768px breakpoint) share one
// implementation. Subscribes to matchMedia 'change' so live resizes / device
// rotations across the breakpoint update consumers without a reload.
import { useState, useEffect } from 'react';
import { layout } from '../theme.js';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// Desktop shell breakpoint (≥1024px) — drives the Sidebar vs Header+bottom-nav
// structural swap in App.jsx. Dimensional values (widths, clearances, grid
// columns) live in index.css media queries, not here.
export function useIsDesktop() {
  return useMediaQuery(layout.desktopMediaQuery);
}
