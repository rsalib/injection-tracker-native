// Global design tokens — edit here to change the entire app's appearance.
// Every component imports from this file. No styling value should be hardcoded in any component.

// =============================================================================
// COLORS
// =============================================================================
export const colors = {
  // Base backgrounds
  bg: '#111827',
  bgDeep: '#0f1923',
  bgDeepest: '#0d1f2d',
  bgMid: '#1f2937',
  bgMid2: '#374151',
  bgMid3: '#4b5563',
  bgFallback: '#121212',
  navy: '#0f172a',
  loginGradientStop: '#0a2e5c', // Apple Deep Blue stop

  // Translucent surfaces (most common card/well bgs)
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceDark: 'rgba(17, 24, 39, 0.85)',
  surfaceMid: 'rgba(17, 24, 39, 0.6)',
  surfaceRow: 'rgba(17, 24, 39, 0.4)',
  surfaceDeep: '#2a3441', // v97: repointed from translucent slate-900-0.3 to opaque M3 slate-700-mid (same value as surfaceContainerM3 — the glass.card outer surface). Tier 2 gap closure.
  surfaceEmpty: 'rgba(31, 41, 55, 0.2)',
  surfaceCard: 'rgba(31,41,55,0.4)',

  // Overlays / shadows
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayDark: 'rgba(0, 0, 0, 0.75)',
  shadowSoft: 'rgba(0, 0, 0, 0.2)',

  // Borders
  border: 'rgba(255,255,255,0.05)',
  borderSubtle: 'rgba(255, 255, 255, 0.1)',
  borderFaint: 'rgba(255, 255, 255, 0.03)',
  borderFaint2: 'rgba(255,255,255,0.06)',
  borderMid: 'rgba(255,255,255,0.08)',
  borderHighTop: 'rgba(255, 255, 255, 0.25)',
  borderHighLeft: 'rgba(255, 255, 255, 0.12)',
  borderHighlight: 'rgba(255, 255, 255, 0.15)',

  // -----------------------------------------------------------------------
  // M3 color roles — sub-project 14 (v86) — Tier 1 Neural Expressive paint.
  // Dark-theme tonal palette derived from a #0a84ff seed via Material Theme
  // Builder. The "role" names below (primary / onPrimary / *Container,
  // surface / onSurface / outline, error / *Container) are the canonical
  // M3 surface system. New M3-role tokens are added alongside legacy ones.
  // Existing legacy tokens (`primary`, `blue`, `textPrimary`,
  // `textSecondary`, `textMuted`, `errorStrong`) are *repurposed* to point
  // at the new M3 equivalents — that is the actual paint swap. Translucent
  // surface tokens (`surface`, `surfaceRow`, etc.) are deliberately NOT
  // touched: glass identity is kept through Tier 1 and only retires in
  // Tier 2 when blur is dropped for opaque tonal `surfaceContainer*`.
  // -----------------------------------------------------------------------

  // Primary brand — M3 primary role (light tonal 80 on dark theme).
  // Buttons paint primary bg + onPrimary text (M3 filled-button pattern).
  // Decorative legacy `blue` (icons, accent strokes) now aliases primary.
  blue: '#a8c8ff',
  blueFaint: 'rgba(168, 200, 255, 0.05)',
  blueDim: 'rgba(168, 200, 255, 0.22)',
  blueMid: 'rgba(168, 200, 255, 0.42)',
  primary: '#a8c8ff',
  onPrimary: '#003062',
  primaryContainer: '#00468a',
  onPrimaryContainer: '#d6e3ff',

  // Secondary — desaturated blue-gray. Containers for less-emphatic actions.
  secondary: '#bbc7db',
  onSecondary: '#253140',
  secondaryContainer: '#3c4858',
  onSecondaryContainer: '#d7e3f7',

  // Tertiary — hue-shifted accent (warm violet) for contrast/highlights.
  tertiary: '#d8bdde',
  onTertiary: '#3b2942',
  tertiaryContainer: '#533f5a',
  onTertiaryContainer: '#f4daf9',

  // Surface roles — opaque tonal surfaces. Sub-project 21 (v93) retinted
  // from neutral grays to Tailwind slate family — cards now sit in the
  // same hue family as the deep-navy backdrop gradient (which already
  // uses slate-900 #111827), eliminating the warm/brown simultaneous-contrast
  // cast that neutral grays picked up against the cool blue field. Consumed
  // by glass.cardSubtle (Low) / glass.card (M3) / glass.cardEmphasis (High)
  // / glass.modal (Highest) / glass.stepBox (Low). surfaceM3 + Lowest are
  // defined for the full M3 scale but not currently consumed.
  surfaceM3: '#111827',                 // Tailwind slate-900 (matches colors.bg)
  surfaceContainerLowest: '#0f172a',    // Tailwind slate-950
  surfaceContainerLow: '#1f2937',       // Tailwind slate-800
  surfaceContainerM3: '#2a3441',        // Between slate-800 and slate-700
  surfaceContainerHigh: '#374151',      // Tailwind slate-700
  surfaceContainerHighest: '#4b5563',   // Tailwind slate-600

  // On-surface text + outline roles (consumed by textPrimary/Secondary/Muted aliases below).
  onSurface: '#e2e2e6',
  onSurfaceVariant: '#c3c6cf',
  outline: '#8d9199',
  outlineVariant: '#43474e',

  // Error roles — M3 tonal 80/20/30/90.
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  // Text — legacy names aliased to M3 on-surface roles.
  white: '#ffffff',
  textPrimary: '#e2e2e6',       // M3 onSurface
  textSecondary: '#c3c6cf',     // M3 onSurfaceVariant
  textMuted: '#8d9199',         // M3 outline
  textTertiary: '#d1d5db',
  textLight: '#e5e7eb',
  textSortLabel: '#b0b8c4',
  textAmber: '#ffd60a',
  textGreen: '#30d158',
  textBlue: '#a8c8ff',          // aliases M3 primary

  // Semantic
  error: '#ff453a',
  errorStrong: '#ffb4ab',       // M3 error (tonal 80)
  errorStrongBg: 'rgba(255, 69, 58, 0.15)',
  errorLight: '#ff6961',
  errorSoft: 'rgba(255, 69, 58, 0.1)',
  success: '#30d158',
  amber: '#ffd60a',
  amberWarm: '#ffd60a',

  // Accents — Apple systemPurple (dark base / vibrant)
  purple: '#bf5af2',
  purpleLight: '#da8fff',

  // Dropdown (light-on-dark portal overlay)
  dropdownBg: '#f3f4f6',
  dropdownDivider: 'rgba(0, 0, 0, 0.06)',

  // Sync indicators
  syncPending: '#ff9f0a', // Apple System Orange
  syncSaving: '#ffd60a', // Apple System Yellow

  blueSurface: 'rgba(168, 200, 255, 0.22)',  // Neural Expressive accent wash for active/hover card states
  blueGlowSoft: 'rgba(168, 200, 255, 0.5)',
  errorDeepBg: 'rgba(255, 69, 58, 0.2)',
  errorDeepBorder: 'rgba(255, 69, 58, 0.4)',
  stackBadgeBg: 'rgba(255, 214, 10, 0.15)',
  tealDeep: 'rgba(168, 200, 255, 0.15)',
  tealBorder: 'rgba(168, 200, 255, 0.25)',
  tealBorderFaint: 'rgba(168, 200, 255, 0.12)',

  // Missing error colors
  errorSoftBg: 'rgba(255, 69, 58, 0.3)',
  errorSoftFaint: 'rgba(255, 69, 58, 0.15)',
  errorDeepMid: 'rgba(255, 69, 58, 0.4)',
  errorBright: 'rgba(255, 69, 58, 0.8)',
  errorFaint: 'rgba(255, 69, 58, 0.2)',
  errorDark: 'rgba(255, 69, 58, 0.6)',
  errorDarkMid: 'rgba(255, 69, 58, 0.4)',
  errorDarkestSolid: 'rgba(100, 10, 10, 0.95)',
  errorDarkest: '#4a0e0e',
  errorDarkBg: '#3d0707',
  errorDarkBorder: '#7a1212',
  errorDarkBorderAlt: '#941818',

  // Missing success colors
  successBorder: 'rgba(48, 209, 88, 0.3)',
  successSoft: 'rgba(48, 209, 88, 0.15)',
  successDeep: 'rgba(48, 209, 88, 0.4)',
  successDark: 'rgba(48, 209, 88, 0.6)',
  successDarkestSolid: 'rgba(10, 60, 20, 0.95)',
  successDarkSoft: 'rgba(48, 209, 88, 0.3)',
  successLightSoft: 'rgba(48, 209, 88, 0.4)',
  successLightFaint: 'rgba(48, 209, 88, 0.1)',
  successDarkBg: '#1e4620',
  successDarkest: '#123014',

  // Missing orange/yellow/amber colors
  orangeBorder: 'rgba(255, 159, 10, 0.3)',
  orangeSoft: 'rgba(255, 159, 10, 0.15)',
  yellowBorder: 'rgba(255, 214, 10, 0.3)',
  yellowSoft: 'rgba(255, 214, 10, 0.15)',
  orangeDeep: 'rgba(255, 159, 10, 0.4)',
  yellowDeep: 'rgba(255, 214, 10, 0.4)',
  yellowDeepSoft: 'rgba(255, 214, 10, 0.3)',
  orangeDarkBg: '#542000',
  orangeDarkBorder: '#8c3a00',
  yellowDarkBorder: 'rgba(255, 214, 10, 0.5)',
  textYellow: '#ffd60a',
  textOrange: '#ff9f0a',

  // Missing purple colors
  purpleMid: 'rgba(191, 90, 242, 0.6)',
  purpleBorder: 'rgba(191, 90, 242, 0.3)',
  purpleSoft: 'rgba(191, 90, 242, 0.15)',
  purpleFaint: 'rgba(191, 90, 242, 0.1)',
  purpleDeepSoft: 'rgba(126, 34, 206, 0.1)',
  purpleDarkBg: '#3b0764',
  purpleDarkBorder: '#7e22ce',
  purpleBorderBright: '#bf5af2',

  // Missing blue colors
  blueBorder: 'rgba(168, 200, 255, 0.3)',
  blueSoft: 'rgba(168, 200, 255, 0.15)',
  blueLight: '#64d2ff',
  blueDarkBorder: '#0070e3',
  blueDarkBg: '#0c1a30',

  // Misnamed teal* tokens — values are actually blue. Known debt; left as-is for a
  // dedicated future cleanup pass. Treat them as blue-family aliases for now.
  tealMid: 'rgba(168, 200, 255, 0.3)',
  tealDarkBg: '#0c1a30',
  tealDarkest: '#071a2e',
  blueHeavy: 'rgba(168, 200, 255, 0.8)',
  blueDeep: 'rgba(168, 200, 255, 0.4)',
  blueDeepBorder: 'rgba(168, 200, 255, 0.08)',
  blueGlass: 'rgba(168, 200, 255, 0.6)',

  // Missing gray/white/black colors
  grayBorder: 'rgba(142, 142, 147, 0.3)',
  graySoft: 'rgba(142, 142, 147, 0.15)',
  shadowLight: 'rgba(0, 0, 0, 0.18)',
  shadowMid: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.4)',
  shadowDeep: 'rgba(0, 0, 0, 0.5)',
  shadowHeavy: 'rgba(0, 0, 0, 0.6)',
  transparentBg: 'rgba(17, 24, 39, 0)',
  surfaceCardSolid: 'rgba(31, 41, 55, 0.95)',
  borderFaint3: 'rgba(255, 255, 255, 0.08)',
  borderFaint4: 'rgba(255, 255, 255, 0.06)',
  borderHigh: 'rgba(255, 255, 255, 0.2)',
  overlayFaint: 'rgba(0, 0, 0, 0.06)',
  errorFaintBg: 'rgba(255, 69, 58, 0.1)',
};

// =============================================================================
// GLASS — composite card/well surfaces
// =============================================================================

// -----------------------------------------------------------------------
// Tier 2 Step 2.1 (sub-project 17, v89) — Liquid Glass identity retires.
// Card variants drop translucent backgrounds + backdropFilter blur and adopt
// opaque M3 tonal `surfaceContainer*` levels. Depth now communicated through
// M3 layered elevation shadows (shadow.elevation1..5) instead of blur-based
// vibrancy. cardWarning keeps its amber wash (semantic, not chrome) but
// drops the blur. Border highlights kept where present — they read as gentle
// rim-light on opaque surfaces, not as part of the glass effect.
// -----------------------------------------------------------------------

export const glass = {
  // Standard card — surfaceContainerM3 (M3 standard surface container tone).
  card: {
    backgroundColor: colors.surfaceContainerM3,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.borderHighTop,
    borderLeftColor: colors.borderHighLeft,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)', // elevation2
  },

  // Subtle card — surfaceContainerLow. Use for ancillary/secondary cards
  // (stat cards, utility cards, side surfaces). Recedes against standard cards.
  cardSubtle: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)', // elevation1
  },

  // Emphasis card — surfaceContainerHigh. Use for hero CTA cards and primary
  // focal surfaces. borderRadius 28 = radius.hero (sub-project 12, v84).
  cardEmphasis: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderLeftColor: 'rgba(255, 255, 255, 0.18)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)', // elevation3
  },

  // Warning card — leans warm. Amber wash is the semantic signal, not chrome,
  // so kept verbatim; blur dropped. Reserved for conditional application
  // (e.g., interactionCard only when interactionError is truthy).
  cardWarning: {
    backgroundColor: 'rgba(255, 159, 10, 0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 214, 10, 0.2)',
    borderLeftColor: colors.borderHighLeft,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)', // elevation2
  },

  // Modal — surfaceContainerHighest (M3 reserves highest tonal level for
  // overlaid surfaces). elevation4 — pronounced layered shadow.
  modal: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)', // elevation4
  },

  // Inset sub-surface — inner wells, input backgrounds
  well: {
    backgroundColor: colors.borderFaint,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  wellDark: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },

  // Teal well — syringe/blend math boxes
  tealWell: {
    backgroundColor: 'rgba(8, 51, 68, 0.4)',
    borderColor: 'rgba(21, 94, 117, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
  },

  // Dark row — log entries, schedule rows
  darkRow: {
    backgroundColor: colors.surfaceRow,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },

  // Medium dark — result items, chat bubbles
  mediumDark: {
    backgroundColor: colors.surfaceMid,
  },

  // Empty state placeholder
  emptyState: {
    backgroundColor: colors.surfaceEmpty,
    borderRadius: 24,
  },

  // TitrationModal stepBox — inset card inside a modal. surfaceContainerLow
  // (one step down from the parent modal's surfaceContainerHighest), elevation2.
  stepBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)', // elevation2
  },
};

// =============================================================================
// BUTTON — shared pill geometry, color variants
// =============================================================================

const pillShape = {
  borderRadius: 100,
  padding: 16,
  alignItems: 'center',
};

export const button = {
  primary: {
    ...pillShape,
    backgroundColor: colors.primary,
    boxShadow: '0 4px 12px rgba(168, 200, 255, 0.3)',
  },
  primaryText: {
    // M3 filled-button pattern: onPrimary text on primary bg.
    // primary is light blue (#a8c8ff); white text would fail contrast — onPrimary (#003062) guarantees AA.
    color: colors.onPrimary,
    fontWeight: '900',
    fontSize: 15,
  },
  secondary: {
    ...pillShape,
    backgroundColor: colors.surface,
  },
  secondaryText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  danger: {
    ...pillShape,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  dangerText: {
    color: colors.error,
    fontWeight: '800',
    fontSize: 13,
  },
};

// =============================================================================
// ALERT — coordinated amber palette (Dashboard low-stock / expiry warning)
// =============================================================================

export const alert = {
  amberBg: '#422006',
  amberBorder: '#92400e',
  amberText: '#fcd34d',
  amberAccent: '#713f12',
};

// =============================================================================
// ERROR BOX — coordinated bg + border pair for inline error states
// =============================================================================

export const errorBox = {
  bg: 'rgba(255, 69, 58, 0.1)',
  border: 'rgba(255, 69, 58, 0.2)',
};

// =============================================================================
// SITE ACTIVE — amber-warm pair for the active site cell in SiteRotation
// =============================================================================

export const siteActive = {
  bg: 'rgba(113, 63, 18, 0.3)',
  border: 'rgba(146, 64, 14, 0.4)',
};

// =============================================================================
// CYCLE END — Finish (amber) + Stop Now (red) coordinated pair
// =============================================================================

export const cycleEnd = {
  finishBg: 'rgba(113, 63, 18, 0.4)',
  finishBorder: '#92400e',
  finishText: colors.textAmber,
  nowBg: 'rgba(127, 29, 29, 0.4)',
  nowBorder: '#7f1d1d',
  nowText: colors.errorLight,
};

// =============================================================================
// SYRINGE — fill visualizer dynamic states + static chrome
// =============================================================================

export const syringe = {
  // Normal state — iOS systemBlue fill
  normalFillFrom: '#071a2e',
  normalFillTo: colors.blue,
  normalText: colors.blue,
  normalGlow: 'rgba(168, 200, 255, 0.8)',
  normalBorder: colors.bgMid2,

  // Overdrawn state — red fill
  overdrawnFillFrom: '#4a0e0e',
  overdrawnFillTo: colors.errorStrong,
  overdrawnText: colors.errorStrong,
  overdrawnGlow: 'rgba(255, 69, 58, 0.8)',
  overdrawnBorder: '#941818',

  // Static visualizer chrome
  barrelBg: colors.bgMid,
  trackBg: colors.bg,
  trackBorder: colors.bgMid3,
  overdrawnBannerBg: '#3d0707',
  overdrawnBannerText: colors.errorLight,
};

// =============================================================================
// TOAST — error / success / info variants
// =============================================================================

export const toast = {
  error: {
    bg: 'rgba(69, 10, 10, 0.95)',
    border: 'rgba(127, 29, 29, 0.6)',
    text: colors.errorLight,
  },
  success: {
    bg: 'rgba(20, 83, 45, 0.95)',
    border: 'rgba(22, 101, 52, 0.6)',
    text: colors.textGreen,
  },
  info: {
    bg: 'rgba(31, 41, 55, 0.95)',
    border: colors.borderSubtle,
    text: colors.white,
  },
};

// =============================================================================
// BADGE — 7 color variants (from Badge.jsx COLOR_MAP)
// =============================================================================

export const badge = {
  blue: {
    bg: 'rgba(168, 200, 255, 0.15)',
    text: '#64d2ff',
    border: 'rgba(168, 200, 255, 0.3)',
    glow: '0 0 4px rgba(168, 200, 255, 0.4)',
  },
  green: {
    bg: 'rgba(48, 209, 88, 0.15)',
    text: '#30d158',
    border: 'rgba(48, 209, 88, 0.3)',
    glow: '0 0 4px rgba(48, 209, 88, 0.4)',
  },
  red: {
    bg: 'rgba(255, 69, 58, 0.15)',
    text: '#ff6961',
    border: 'rgba(255, 69, 58, 0.3)',
  },
  yellow: {
    bg: 'rgba(255, 214, 10, 0.15)',
    text: '#ffd60a',
    border: 'rgba(255, 214, 10, 0.3)',
  },
  orange: {
    bg: 'rgba(255, 159, 10, 0.15)',
    text: '#ff9f0a',
    border: 'rgba(255, 159, 10, 0.3)',
  },
  purple: {
    bg: 'rgba(191, 90, 242, 0.15)',
    text: '#da8fff',
    border: 'rgba(191, 90, 242, 0.3)',
  },
  gray: {
    bg: 'rgba(142, 142, 147, 0.15)',
    text: '#8e8e93',
    border: 'rgba(142, 142, 147, 0.3)',
  },
};

// =============================================================================
// SHADOW — every distinct boxShadow / textShadow value in the codebase
// =============================================================================

export const shadow = {
  // -----------------------------------------------------------------------
  // M3 elevation tokens — sub-project 17 (v89), Tier 2 Step 2.1.
  // Layered ambient + key shadows per M3 elevation level. Replaces the
  // blur-based depth language (glass + backdrop-filter) with explicit
  // shadow geometry. Levels 1–5 correspond to M3 dp 1/3/6/8/12 in tactile
  // hierarchy: low (subtle) → high (modal overlays). glass.* card variants
  // consume these inline (not by token reference) so a future card-by-card
  // tuning remains a one-property edit; tokens here are the canonical set.
  // -----------------------------------------------------------------------
  elevation1: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
  elevation2: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
  elevation3: '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
  elevation4: '0 2px 3px rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)',
  elevation5: '0 4px 4px rgba(0, 0, 0, 0.3), 0 8px 12px 6px rgba(0, 0, 0, 0.15)',

  glassCard: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  glassModal: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  btnPrimary: '0 4px 12px rgba(168, 200, 255, 0.3)',
  btnPrimaryInset: '0 4px 12px rgba(168, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  blueGlowSmall: '0 0 8px rgba(168, 200, 255, 0.6)',
  blueGlowLarge: '0 0 8px rgba(168, 200, 255, 0.8), 0 0 16px rgba(168, 200, 255, 0.4)',
  dropdownPanel: '0 4px 16px rgba(0, 0, 0, 0.18)',
  errorBtn: '0 4px 12px rgba(255, 69, 58, 0.3)',
  errorCircuit: '0 10px 25px -5px rgba(255, 69, 58, 0.4)',
  loginCard: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
  toast: '0 10px 25px rgba(0, 0, 0, 0.4)',
  aiInputBar: '0 4px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  aiSendBtn: '0 4px 16px rgba(168, 200, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  tabBarCapsule: '0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  calcResult: '0 10px 40px -10px rgba(168, 200, 255, 0.25)',
  syringeInset: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
  resultItem: '0 4px 12px rgba(0, 0, 0, 0.2)',
  msgBubbleUser: '0 4px 12px rgba(168, 200, 255, 0.2)',
  pendingDot: '0 0 8px #ff9f0a',
  // textShadow
  tabActiveGlow: '0 0 12px rgba(168, 200, 255, 0.6)',
};

// =============================================================================
// BLUR — backdropFilter values
// =============================================================================

// Apple vibrancy recipe: blur + saturate(180%) — saturate boost makes colors
// punch through translucent surfaces instead of washing out to gray.
export const blur = {
  card: 'blur(40px) saturate(180%)',
  header: 'blur(20px) saturate(180%)',
  dialog: 'blur(16px) saturate(180%)',
  input: 'blur(12px) saturate(180%)',
  login: 'blur(24px) saturate(180%)',
};

// =============================================================================
// INPUT — text input field + label
// =============================================================================

export const input = {
  // Standalone pill TextInput
  field: {
    backgroundColor: colors.surfaceRow, // v97: inner-well color — matches dashboard inset-row treatment
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopColor: colors.borderHighlight,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: colors.white,
    fontSize: 16,
    outlineStyle: 'none',
  },
  // Smaller pill for archive/filter search inputs
  fieldSearch: {
    backgroundColor: colors.surfaceRow, // v97: inner-well color
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 15,
    outlineStyle: 'none',
  },
  // Compact variant of fieldSearch — smaller font for dense archive/filter rows
  fieldSearchCompact: {
    backgroundColor: colors.surfaceRow, // v97: inner-well color
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 14,
    outlineStyle: 'none',
  },
  // Multiline textarea variant (notes fields)
  fieldMultiline: {
    backgroundColor: colors.surfaceRow, // v97: inner-well color
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: colors.white,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
  // Transparent inline input — for TextInputs embedded inside a pillWrapper or glass card
  fieldPill: {
    flex: 1,
    backgroundColor: 'transparent',
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    outlineStyle: 'none',
    minWidth: 0,
  },
  // Compact transparent inline input — chat composer style (tighter padding, medium weight)
  fieldChat: {
    flex: 1,
    backgroundColor: 'transparent',
    color: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    outlineStyle: 'none',
    minWidth: 0,
  },
  // Raw CSS objects for composite pill wrappers — <div> containers holding <input> + <select>/divider/unit
  // Used as inline style on DOM elements. Width is structural (caller decides) so not included.
  compositePill: {
    display: 'flex',
    background: colors.surfaceRow, // v97: inner-well color
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '100px',
    overflow: 'hidden',
  },
  compositePillFaint: {
    display: 'flex',
    background: colors.surfaceRow, // v97: inner-well color
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '100px',
    overflow: 'hidden',
  },
  compositePillAccent: {
    display: 'flex',
    background: colors.borderFaint,
    border: `1px solid ${colors.blueBorder}`,
    borderRadius: '100px',
    overflow: 'hidden',
  },
  // Inner vertical divider for composite pill wrappers
  compositePillDivider: {
    width: 1,
    background: colors.borderSubtle,
    margin: '8px 0',
  },
  compositePillDividerCompact: {
    width: 1,
    background: colors.borderSubtle,
    margin: '6px 0',
  },
  compositePillDividerAccent: {
    width: 1,
    background: colors.blueBorder,
    margin: '8px 0',
  },
  // Raw CSS object for standalone <select> elements (surface background)
  // Must be used as inline style on DOM elements — StyleSheet silently strips backdropFilter
  rawSelect: {
    width: '100%',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    borderTop: `1px solid ${colors.borderHighlight}`,
    borderRadius: '100px',
    padding: '14px 18px',
    color: colors.white,
    fontSize: 16,
    boxSizing: 'border-box',
    outline: 'none',
  },
  // Raw CSS object for <select>/<input type="date/time"> with faint background
  rawSelectFaint: {
    width: '100%',
    background: colors.borderFaint,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '100px',
    padding: '14px 18px',
    color: colors.white,
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
};

// =============================================================================
// TYPE — typography scale
// =============================================================================

// -----------------------------------------------------------------------
// M3 type scale — sub-project 15 (v87), Tier 1 Step 1.2.
// 15 canonical roles (display/headline/title/body/label × Large/Medium/Small).
// fontSize + lineHeight + letterSpacing match the M3 spec; weights leaned
// heavier than M3 defaults for the Expressive direction (display 900,
// headline 800, title 700, label 700). Default color is textPrimary,
// which after step 1.1 aliases M3 onSurface (#e2e2e6). Roboto Flex variable
// font is loaded in index.css; type tokens themselves do not specify
// fontFamily — inheritance from html, body carries the stack.
// -----------------------------------------------------------------------
const _m3 = {
  displayLarge:  { fontSize: 57, lineHeight: 64, letterSpacing: -0.25, fontWeight: '900', color: colors.textPrimary },
  displayMedium: { fontSize: 45, lineHeight: 52, letterSpacing: 0,     fontWeight: '900', color: colors.textPrimary },
  displaySmall:  { fontSize: 36, lineHeight: 44, letterSpacing: 0,     fontWeight: '900', color: colors.textPrimary },

  headlineLarge:  { fontSize: 32, lineHeight: 40, letterSpacing: 0, fontWeight: '800', color: colors.textPrimary },
  headlineMedium: { fontSize: 28, lineHeight: 36, letterSpacing: 0, fontWeight: '800', color: colors.textPrimary },
  headlineSmall:  { fontSize: 24, lineHeight: 32, letterSpacing: 0, fontWeight: '800', color: colors.textPrimary },

  titleLarge:  { fontSize: 22, lineHeight: 28, letterSpacing: 0,    fontWeight: '700', color: colors.textPrimary },
  titleMedium: { fontSize: 16, lineHeight: 24, letterSpacing: 0.15, fontWeight: '600', color: colors.textPrimary },
  titleSmall:  { fontSize: 14, lineHeight: 20, letterSpacing: 0.1,  fontWeight: '600', color: colors.textPrimary },

  bodyLarge:  { fontSize: 16, lineHeight: 24, letterSpacing: 0.5,  fontWeight: '400', color: colors.textPrimary },
  bodyMedium: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25, fontWeight: '400', color: colors.textPrimary },
  bodySmall:  { fontSize: 12, lineHeight: 16, letterSpacing: 0.4,  fontWeight: '400', color: colors.textPrimary },

  labelLarge:  { fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontWeight: '700', color: colors.textPrimary },
  labelMedium: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '700', color: colors.textSecondary },
  labelSmall:  { fontSize: 11, lineHeight: 16, letterSpacing: 0.5, fontWeight: '700', color: colors.textSecondary },
};

export const type = {
  // Canonical M3 roles — preferred for any new code.
  ..._m3,

  // -----------------------------------------------------------------------
  // Legacy aliases — preserve consumer JSX. Each redirects to the closest
  // M3 role and overlays only the consumer-needed extras (marginBottom,
  // uppercase transform, specific color). M3 fontSize + letterSpacing
  // take effect on every consumer — that is the v87 visible paint shift.
  // -----------------------------------------------------------------------

  // Card titles ("Active Protocols", "Today's Schedule", etc.)
  // 20/800/-0.4 → 22/700/0 (M3 titleLarge). marginBottom + white preserved.
  cardTitle: { ..._m3.titleLarge, color: colors.white, marginBottom: 16 },

  // Section header eyebrow ("ACTIVE PROTOCOLS" uppercase row label)
  // 16/800/upper/ls 2 → 14/700/upper/ls 0.1 (M3 labelLarge + upper)
  sectionHeading: { ..._m3.labelLarge, color: colors.white, textTransform: 'uppercase' },

  // Body copy
  body: { ..._m3.bodyMedium },

  // Smaller body — meta text
  // 11/textMuted → 12/textMuted (M3 bodySmall + muted color)
  caption: { ..._m3.bodySmall, color: colors.textMuted },

  // v98: type.tabLabel removed — M3 NavigationBar consumes its label style
  // directly via navBar.label / labelActive (labelSmall, 11pt/700/+0.5).

  // Neural Expressive hierarchy aliases
  heading1: { ..._m3.headlineSmall, color: colors.white },                                       // 24/800/0
  heading2: { ..._m3.titleLarge, color: colors.white },                                          // 22/700/0
  subheading: { ..._m3.labelLarge, color: colors.textSecondary, textTransform: 'uppercase' },    // 14/700/0.1 upper

  // Bold body — med names, log row primary text
  bodyEmphasis: { ..._m3.titleSmall, fontWeight: '700' },                                        // 14/700/0.1

  // Mid-weight uppercase eyebrow labels
  sectionLabel: { ..._m3.labelMedium, textTransform: 'uppercase' },                              // 12/700/0.5 upper

  // Smallest uppercase labels — badges, meta pills
  microLabel: { ..._m3.labelSmall, fontWeight: '800', textTransform: 'uppercase' },              // 11/800/0.5 upper

  // Form-field labels — modal "lbl" rows
  formLabel: { ..._m3.labelSmall, fontWeight: '800', textTransform: 'uppercase' },               // 11/800/0.5 upper

  // Hero numeric callouts — Calculator result, Dashboard stat values
  // 32/900/-0.8 → 36/900/0 (M3 displaySmall). Per-site fontSize override allowed.
  display: { ..._m3.displaySmall, color: colors.white },
};

// =============================================================================
// SPACING + RADIUS
// =============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  cardPad: 20,
  screenPad: 16,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 100,
  // Shape hierarchy — semantic radii used by card/row variants (sub-project 12, v84)
  hero: 28,       // emphasis cards — slightly larger than standard
  standard: 24,   // default glass card — matches glass.card current value (no visual change)
  inset: 20,      // inset rows inside a card — matches Dashboard schedule/protocol/recent current value (no visual change)
};

// -----------------------------------------------------------------------
// M3 shape scale — sub-project 18 (v90), Tier 2 Step 2.2.
// Canonical M3 corner-radius scale: none → xs → sm → md → lg → xl → full.
// Use these for any *new* radius declaration. Legacy `radius` export
// (pill / inset / standard / hero / sm/md/lg/xl) is kept alongside for
// the existing 4 consumer call sites (App.jsx pill button, Dashboard
// inset rows) — Tier 1 alias-preservation philosophy.
//
// emphasisCTA is the M3 "asymmetric expressive" CTA shape — two diagonal
// corners at xl (28), two at sm (8). Defined here but not yet consumed —
// reserved for Tier 2 Step 2.4 FAB / hero CTA. Apply via spread on the
// container View's style, NOT as a single borderRadius value.
// -----------------------------------------------------------------------
export const shape = {
  none: 0,
  xs:   4,
  sm:   8,
  md:  12,
  lg:  16,
  xl:  28,
  full: 9999,
  emphasisCTA: {
    borderTopLeftRadius:     28,
    borderTopRightRadius:     8,
    borderBottomLeftRadius:   8,
    borderBottomRightRadius: 28,
  },
};

// =============================================================================
// LAYOUT — global layout magic numbers used across the shell
// =============================================================================

export const layout = {
  contentMaxWidth: 672,       // v2 border-box content width (matches paddingHorizontal: 16 → 640px content)
  // v100: tabBarMaxWidth restored — floating capsule caps width on wider viewports
  tabBarMaxWidth: 500,
  headerClearance: 160,       // ScrollView paddingTop to clear fixed header (legacy static — prefer headerClearanceSafe)
  // v104 fine-tune: bumped 150 → 160 to cover the ~10px of header card elevation
  // shadow that was bleeding into content on desktop (no safe-area-inset-top to
  // pad it). PWA already had ample clearance via the iOS notch inset; an extra
  // 10px there is imperceptible.
  headerClearanceSafe: 'calc(160px + env(safe-area-inset-top))',
  // v104 fine-tune: changed from static 100 to safe-area-aware calc. On PWA with
  // a home indicator, the tab bar capsule's TOP edge sits at ~64dp + env(...)
  // (typically 34px), pushing it ~98px above the screen bottom — only 2px of
  // breathing room above content with the old static 100. Now scales with the
  // device's home-indicator inset so bottom-of-tab content clears the floating
  // capsule on every form factor.
  tabBarClearance: 'calc(100px + env(safe-area-inset-bottom))',
  tabBarSafeBottom: 'max(12px, env(safe-area-inset-bottom))',
  noiseOpacity: 0.06,
};

// =============================================================================
// MOTION — shared transitions
// =============================================================================

export const motion = {
  // -----------------------------------------------------------------------
  // M3 emphasized motion curves — sub-project 16 (v88), Tier 1 Step 1.3.
  // The M3 motion language uses cubic-beziers tuned for tactile, expressive
  // animation. `emphasized` is the default for interactive feedback;
  // `emphasizedDecelerate` for elements arriving on screen (hover lift,
  // panel reveal); `emphasizedAccelerate` for elements leaving (dismissal).
  // `standard` is the fallback for ambient transitions. Durations follow
  // the M3 token scale: short for micro-interactions, medium for component
  // changes, long for full-screen transitions.
  // -----------------------------------------------------------------------
  emphasized:           'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  standard:             'cubic-bezier(0.2, 0.0, 0, 1.0)',

  // Numeric bezier coefficients — for RN Easing.bezier() consumers
  // (JS Animated cannot consume the CSS string form).
  emphasizedBezier:           [0.2, 0.0, 0, 1.0],
  emphasizedDecelerateBezier: [0.05, 0.7, 0.1, 1.0],
  emphasizedAccelerateBezier: [0.3, 0.0, 0.8, 0.15],

  // Duration tokens — M3 standard scale (ms)
  short: 200,
  medium: 400,
  long: 500,

  tabTransition: 'all 0.3s ease',
  hoverLiftPx: -2,
};

// =============================================================================
// GRADIENTS — app shell background gradients (consumed by index.css via CSS vars)
// =============================================================================

export const gradients = {
  screen: 'linear-gradient(160deg, #0f1923 0%, #111827 40%, #0d1f2d 100%)',
  headerFade: 'linear-gradient(to bottom, #111827 80%, rgba(17,24,39,0) 100%)',
  // v98: tabBarFade removed — the M3 NavigationBar is opaque and edge-to-edge;
  // no fade needed (and a fade would tint content above the bar).
};

// =============================================================================
// NAVBAR — bottom navigation bar styling
// =============================================================================

export const navBar = {
  // Sub-project 25 (v100): compact floating M3 NavigationBar — matches the
  // header card aesthetic (surfaceContainerHigh + 24px corners + rim-light
  // borders + elevation2) for visual symmetry between the top and bottom
  // chrome. Drops the v98 full-bleed edge-to-edge surface, which read as
  // disproportionately tall and visually disconnected from the header card.
  // Keeps the M3 indicator-pill-behind-icon affordance and secondaryContainer
  // tonal color from v98. Labels only render on the active tab (compact mode
  // — full M3 always-visible labels can't fit 6 destinations on a 320–400px
  // viewport without truncation per sub-project 24's accepted trade-off).
  bar: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopColor: colors.borderHighTop,
    borderLeftColor: colors.borderHighLeft,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)', // elevation2
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 6,
    gap: 2,
    cursor: 'pointer',
  },
  iconWrap: {
    width: 56,
    height: 28,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    // M3 spec: active indicator uses secondaryContainer behind the icon only.
    backgroundColor: colors.secondaryContainer,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.onSurface,
    textAlign: 'center',
  },
  iconActive: colors.onSecondaryContainer,
  iconInactive: colors.onSurfaceVariant,
};
