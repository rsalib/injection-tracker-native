// Bridges theme.js tokens into CSS custom properties on :root so index.css
// can read the same values JS does. Single source of truth = theme.js.
// Imported once from main.jsx before App renders.

import { colors, gradients, motion } from './theme.js';

function setVar(name, value) {
  if (value == null) return;
  document.documentElement.style.setProperty(`--${name}`, String(value));
}

Object.entries(colors).forEach(([k, v]) => setVar(k, v));
Object.entries(gradients).forEach(([k, v]) => setVar(`gradient-${k}`, v));

// Motion — bridge the cubic-bezier string curves (skip array bezier tuples
// and the legacy `tabTransition`/`hoverLiftPx`).
['emphasized', 'emphasizedDecelerate', 'emphasizedAccelerate', 'standard'].forEach((k) => {
  setVar(`motion-${k}`, motion[k]);
});

// Motion durations — bridged as ms-suffixed CSS values so transition/animation
// rules in index.css and inline styles can reference var(--motion-short) etc.
['short', 'medium', 'long'].forEach((k) => {
  setVar(`motion-${k}`, `${motion[k]}ms`);
});
