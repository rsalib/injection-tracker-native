import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from '../../theme.js';
import { NAV_TABS } from '../../constants.js';

// Sub-project 26 — Container transform between tabs, Tier 3 Step 3.3.
//
// Composited cross-fade between tab contents on activeTab change. Outgoing
// layer fades + translates outward on emphasizedAccelerate; incoming layer
// fades + translates inward on emphasizedDecelerate. Both run in parallel
// over motion.short (200ms). Direction (forward / backward) is derived from
// NAV_TABS ordering so the morph reads as motion through the tab strip.
//
// Why composited transform + opacity (not layout-based width/height):
//   - Tabs are lazy-loaded (React.lazy + Suspense); unmounted tabs cannot be
//     measured pre-mount, so layout-based morphs are unfeasible.
//   - Suspense fallback height drift would invalidate any measured target.
//   - GPU compositor runs transform/opacity independently of the JS thread
//     and layout pipeline — survives JS jank and Suspense fallbacks.
//
// Why CSS transitions driven by React state (not Animated.Value):
//   - Same architecture as Modal.jsx's slide. One-shot enter/exit doesn't
//     need an interruptible Animated.Value; the compositor handles it.
//   - Matches the established Liquid-Glass-era → M3 transition pattern.
//
// Why a snapshot of the prior children (not parallel-render of all tabs):
//   - The user-facing wrap pattern is `<TabContainer activeTab=...>...</...>`
//     around the existing 6-way conditional in App.jsx. Children prop already
//     reflects the new tab when activeTab changes — TabContainer captures the
//     prior children via ref + useLayoutEffect and renders it in an absolute-
//     positioned overlay for motion.short, then drops it. Outgoing tab briefly
//     fresh-mounts (loses local state) for ~200ms during the fade; acceptable
//     because (a) outgoing has pointer-events: none and is fading to 0, and
//     (b) tabs are presentational — App.jsx owns the data.
//
// Why useLayoutEffect (not useEffect) for the snapshot:
//   - Without it, the new tab paints at full opacity for one frame before the
//     effect fires and re-renders with entered=false. useLayoutEffect runs
//     synchronously after commit, before the browser paints — batches the
//     prevChildren/entered state into the first visible frame.
//
// Why double-rAF before flipping entered=true:
//   - Modern engines (Chromium 100+, WebKit 17+) may batch the mount render
//     and the entered=true render into a single paint, skipping the CSS
//     transition (the from-state never paints). Same fix used in Modal.jsx
//     (v101). Double-rAF guarantees the from-state paints before the to-state
//     render commits.

const OFFSET_PX = 12;

export function TabContainer({ activeTab, onTabChange, children }) {
  const [prevChildren, setPrevChildren] = useState(null);
  const [direction, setDirection] = useState(0);
  const [entered, setEntered] = useState(true);
  const lastTabRef = useRef(activeTab);
  const childrenRef = useRef(children);

  // Keep last-committed children fresh for the next swap snapshot.
  useEffect(() => {
    childrenRef.current = children;
  });

  useLayoutEffect(() => {
    const prev = lastTabRef.current;
    if (prev === activeTab) return;

    const tabIds = NAV_TABS.map((t) => t.id);
    const fromIdx = tabIds.indexOf(prev);
    const toIdx = tabIds.indexOf(activeTab);
    const dir = toIdx > fromIdx ? 1 : toIdx < fromIdx ? -1 : 0;

    // Fire the parent's swap hook before the cross-fade begins so scroll
    // reset / parallax reset land while the incoming layer is still at
    // opacity 0 / translated. The new tab becomes visible already at top.
    if (onTabChange) onTabChange(activeTab, prev);

    setPrevChildren(childrenRef.current);
    setDirection(dir);
    setEntered(false);
    lastTabRef.current = activeTab;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    const clearTimer = setTimeout(() => {
      setPrevChildren(null);
    }, motion.short);

    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
      clearTimeout(clearTimer);
    };
  }, [activeTab, onTabChange]);

  const enterFromX = direction >= 0 ? OFFSET_PX : -OFFSET_PX;
  const exitToX = direction >= 0 ? -OFFSET_PX : OFFSET_PX;

  // Incoming layer: starts at translated + transparent, transitions to rest.
  // emphasizedDecelerate is the M3 curve for elements arriving on screen.
  const incomingStyle = {
    opacity: entered ? 1 : 0,
    transform: entered ? 'translate3d(0,0,0)' : `translate3d(${enterFromX}px, 0, 0)`,
    transition: entered
      ? 'opacity var(--motion-short, 200ms) var(--motion-emphasizedDecelerate, cubic-bezier(0.05, 0.7, 0.1, 1.0)), transform var(--motion-short, 200ms) var(--motion-emphasizedDecelerate, cubic-bezier(0.05, 0.7, 0.1, 1.0))'
      : 'none',
    willChange: 'opacity, transform',
  };

  // Outgoing layer: starts at rest, transitions to translated + transparent.
  // emphasizedAccelerate is the M3 curve for elements leaving the screen.
  // Position: absolute so the outgoing layer overlays the incoming without
  // contributing to layout height — incoming determines ScrollView contentSize.
  // pointerEvents: none so taps during the fade route to the incoming layer
  // (or, more importantly, past it — the outgoing tab is no longer interactive).
  const outgoingStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: entered ? 0 : 1,
    transform: entered ? `translate3d(${exitToX}px, 0, 0)` : 'translate3d(0,0,0)',
    transition: entered
      ? 'opacity var(--motion-short, 200ms) var(--motion-emphasizedAccelerate, cubic-bezier(0.3, 0.0, 0.8, 0.15)), transform var(--motion-short, 200ms) var(--motion-emphasizedAccelerate, cubic-bezier(0.3, 0.0, 0.8, 0.15))'
      : 'none',
    pointerEvents: 'none',
    willChange: 'opacity, transform',
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {prevChildren && <div style={outgoingStyle}>{prevChildren}</div>}
      <div style={incomingStyle}>{children}</div>
    </div>
  );
}

export default TabContainer;
