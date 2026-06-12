// Responsive layout primitives (v123) — the ONLY mechanism tab components use
// for desktop-specific composition. Each renders a raw <div> carrying a class
// whose layout rules live entirely in index.css:
//
//   - Mobile (<1024px): both classes are a plain `flex column + gap` stack, so
//     wrapping existing adjacent siblings is pixel-identical to today's layout
//     (pass gap={0} where the children carry their own margins).
//   - Desktop (≥1024px, via index.css media query):
//       .rsp-cols → flex row, each child flex: 1 (side-by-side panels; a
//                   conditionally-absent child lets its sibling take full width)
//       .rsp-grid → CSS grid, 2 columns, align-items: start (card grids whose
//                   items expand independently — e.g. expandable med cards)
//
// Changing column counts, breakpoints, or gaps for the whole app is a one-place
// edit in index.css — tab files never carry desktop style literals.
import React from 'react';

export function ResponsiveColumns({ gap, children }) {
  return (
    <div className="rsp-cols" style={gap != null ? { '--rsp-gap': `${gap}px` } : undefined}>
      {children}
    </div>
  );
}

export function ResponsiveGrid({ gap, children }) {
  return (
    <div className="rsp-grid" style={gap != null ? { '--rsp-gap': `${gap}px` } : undefined}>
      {children}
    </div>
  );
}
