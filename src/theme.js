// Global design tokens — edit here to change the entire app's appearance.

export const colors = {
  bg: '#111827',
  bgDeep: '#0f1923',
  bgMid: '#1f2937',
  cyan: '#22d3ee',
  cyanDim: 'rgba(34, 211, 238, 0.1)',
  primary: '#0e7490',
  white: '#ffffff',
  textPrimary: '#f9fafb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  textAmber: '#fde68a',
  textGreen: '#86efac',
  textCyan: '#22d3ee',
  error: '#f87171',
  success: '#4ade80',
  amber: '#fbbf24',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHighTop: 'rgba(255, 255, 255, 0.25)',
  borderHighLeft: 'rgba(255, 255, 255, 0.12)',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceDark: 'rgba(17, 24, 39, 0.85)',
  surfaceDeep: 'rgba(17, 24, 39, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

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
  },
  // Inline style — must be spread alongside glass.card on the same View
  cardBlur: {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
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
  },
  modalBlur: {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
  },
  // Inset sub-surface — inner wells, input backgrounds
  well: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  wellDark: {
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
};

const pillShape = { borderRadius: 100, padding: 16, alignItems: 'center' };
export const button = {
  // Primary CTA — full cyan gradient equivalent (solid fallback until expo-linear-gradient)
  primary: { ...pillShape, backgroundColor: colors.primary, boxShadow: '0 4px 12px rgba(34, 211, 238, 0.3)' },
  primaryText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  // Secondary — ghost pill, no border
  secondary: { ...pillShape, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  secondaryText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  // Destructive — red tint with border
  danger: { ...pillShape, backgroundColor: 'rgba(248, 113, 113, 0.15)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)' },
  dangerText: { color: colors.error, fontWeight: '800', fontSize: 13 },
};

export const input = {
  field: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 15,
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

export const type = {
  sectionHeading: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
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
};

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
