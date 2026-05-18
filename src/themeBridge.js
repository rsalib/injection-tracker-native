// Bridges theme.js tokens into CSS custom properties on :root so index.css
// can read the same values JS does. Single source of truth = theme.js.
// Imported once from main.jsx before App renders.

import { colors, gradients } from './theme.js';

function setVar(name, value) {
  if (value == null) return;
  document.documentElement.style.setProperty(`--${name}`, String(value));
}

Object.entries(colors).forEach(([k, v]) => setVar(k, v));
Object.entries(gradients).forEach(([k, v]) => setVar(`gradient-${k}`, v));
