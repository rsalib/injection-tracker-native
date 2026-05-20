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
  surfaceDeep: 'rgba(17, 24, 39, 0.3)',
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

  // Primary brand — Apple System Blue family
  // colors.blue (#0a84ff) — iOS systemBlue. Decorative use only (icons, accent strokes,
  //   large/bold text, badges that don't host white text).
  // colors.primary (#0066CC) — accessible darker variant. ALL solid-fill buttons that
  //   host white text use this token. Guarantees WCAG AA contrast at small text sizes.
  blue: '#0a84ff',
  blueFaint: 'rgba(10, 132, 255, 0.05)',
  blueDim: 'rgba(10, 132, 255, 0.1)',
  blueMid: 'rgba(10, 132, 255, 0.2)',
  primary: '#0066CC',

  // Text
  white: '#ffffff',
  textPrimary: '#f9fafb',
  textSecondary: '#8e8e93',
  textMuted: '#636366',
  textTertiary: '#d1d5db',
  textLight: '#e5e7eb',
  textSortLabel: '#b0b8c4',
  textAmber: '#ffd60a',
  textGreen: '#30d158',
  textBlue: '#0a84ff',

  // Semantic
  error: '#ff453a',
  errorStrong: '#ff3b30',
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

  blueSurface: 'rgba(10, 132, 255, 0.08)',  // Neural Expressive accent wash for active/hover card states
  blueGlowSoft: 'rgba(10, 132, 255, 0.25)',
  errorDeepBg: 'rgba(255, 69, 58, 0.2)',
  errorDeepBorder: 'rgba(255, 69, 58, 0.4)',
  stackBadgeBg: 'rgba(255, 214, 10, 0.15)',
  tealDeep: 'rgba(10, 132, 255, 0.15)',
  tealBorder: 'rgba(10, 132, 255, 0.25)',
  tealBorderFaint: 'rgba(10, 132, 255, 0.12)',

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
  blueBorder: 'rgba(10, 132, 255, 0.3)',
  blueSoft: 'rgba(10, 132, 255, 0.15)',
  blueLight: '#64d2ff',
  blueDarkBorder: '#0070e3',
  blueDarkBg: '#0c1a30',

  // Misnamed teal* tokens — values are actually blue. Known debt; left as-is for a
  // dedicated future cleanup pass. Treat them as blue-family aliases for now.
  tealMid: 'rgba(10, 132, 255, 0.3)',
  tealDarkBg: '#0c1a30',
  tealDarkest: '#071a2e',
  blueHeavy: 'rgba(10, 132, 255, 0.8)',
  blueDeep: 'rgba(10, 132, 255, 0.4)',
  blueDeepBorder: 'rgba(10, 132, 255, 0.08)',
  blueGlass: 'rgba(10, 132, 255, 0.6)',

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
  surfaceCardMid: 'rgba(31, 41, 55, 0.6)',
  borderFaint3: 'rgba(255, 255, 255, 0.08)',
  borderFaint4: 'rgba(255, 255, 255, 0.06)',
  borderHigh: 'rgba(255, 255, 255, 0.2)',
  overlayFaint: 'rgba(0, 0, 0, 0.06)',
  errorFaintBg: 'rgba(255, 69, 58, 0.1)',
};

// =============================================================================
// GLASS — composite card/well surfaces
// =============================================================================

export const glass = {
  // Standard glass card — tabs, dashboard cards, section cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.borderHighTop,
    borderLeftColor: colors.borderHighLeft,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    // Backdrop blur bundled in so every card consumer gets the full glass effect
    // via a single `...glass.card` spread — single source of truth.
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  },

  // Modal glass — overlay dialogs
  modal: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
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

  // TitrationModal stepBox — variant of card with lighter shadow
  stepBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
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
    boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)',
  },
  primaryText: {
    color: colors.white,
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
  normalGlow: 'rgba(10, 132, 255, 0.8)',
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
    bg: 'rgba(10, 132, 255, 0.15)',
    text: '#64d2ff',
    border: 'rgba(10, 132, 255, 0.3)',
    glow: '0 0 4px rgba(10, 132, 255, 0.4)',
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
  glassCard: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  glassModal: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  btnPrimary: '0 4px 12px rgba(10, 132, 255, 0.3)',
  btnPrimaryInset: '0 4px 12px rgba(10, 132, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  blueGlowSmall: '0 0 8px rgba(10, 132, 255, 0.6)',
  blueGlowLarge: '0 0 8px rgba(10, 132, 255, 0.8), 0 0 16px rgba(10, 132, 255, 0.4)',
  dropdownPanel: '0 4px 16px rgba(0, 0, 0, 0.18)',
  errorBtn: '0 4px 12px rgba(255, 69, 58, 0.3)',
  errorCircuit: '0 10px 25px -5px rgba(255, 69, 58, 0.4)',
  loginCard: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
  toast: '0 10px 25px rgba(0, 0, 0, 0.4)',
  aiInputBar: '0 4px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  aiSendBtn: '0 4px 16px rgba(10, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  tabBarCapsule: '0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  calcResult: '0 10px 40px -10px rgba(10, 132, 255, 0.25)',
  syringeInset: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
  resultItem: '0 4px 12px rgba(0, 0, 0, 0.2)',
  msgBubbleUser: '0 4px 12px rgba(10, 132, 255, 0.2)',
  pendingDot: '0 0 8px #ff9f0a',
  // textShadow
  tabActiveGlow: '0 0 12px rgba(10, 132, 255, 0.6)',
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.borderFaint,
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
    backgroundColor: colors.borderFaint,
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
    backgroundColor: colors.surface,
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
    background: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '100px',
    overflow: 'hidden',
  },
  compositePillFaint: {
    display: 'flex',
    background: colors.borderFaint,
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

export const type = {
  sectionHeading: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.white,
  },
  body: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 11,
    color: colors.textMuted,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  // Neural Expressive hierarchy — for expressive headers and nested section titles
  heading1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, color: colors.white },
  heading2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, color: colors.white },
  subheading: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 },
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
};

// =============================================================================
// LAYOUT — global layout magic numbers used across the shell
// =============================================================================

export const layout = {
  contentMaxWidth: 672,       // v2 border-box content width (matches paddingHorizontal: 16 → 640px content)
  tabBarMaxWidth: 500,        // tab capsule cap
  headerClearance: 150,       // ScrollView paddingTop to clear fixed header (legacy static — prefer headerClearanceSafe)
  headerClearanceSafe: 'calc(150px + env(safe-area-inset-top))',
  tabBarClearance: 100,       // ScrollView paddingBottom to clear fixed tab bar
  tabBarSafeBottom: 'max(16px, calc(env(safe-area-inset-bottom) - 20px))',
  noiseOpacity: 0.06,
};

// =============================================================================
// MOTION — shared transitions
// =============================================================================

export const motion = {
  tabTransition: 'all 0.3s ease',
  hoverLiftPx: -2,
};

// =============================================================================
// GRADIENTS — app shell background gradients (consumed by index.css via CSS vars)
// =============================================================================

export const gradients = {
  screen: 'linear-gradient(160deg, #0f1923 0%, #111827 40%, #0d1f2d 100%)',
  headerFade: 'linear-gradient(to bottom, #111827 80%, rgba(17,24,39,0) 100%)',
  tabBarFade: 'linear-gradient(to top, #111827 80%, rgba(17,24,39,0) 100%)',
};

// =============================================================================
// NAVBAR — bottom navigation bar styling
// =============================================================================

export const navBar = {
  capsule: {
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 100,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  btnActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderColor: 'rgba(10, 132, 255, 0.3)',
    borderWidth: 1,
  },
  label: {
    color: '#8e8e93',
  },
  iconActive: '#0a84ff',
  iconInactive: '#636366',
};
