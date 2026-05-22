// M3 Chip primitive (Tier 2 Step 2.4, v92).
//
// Compact, oval-but-not-quite container for a short label + optional leading
// icon/emoji. M3 spec chip height is ~32dp; ours runs slightly shorter for the
// dense category-badge use case. Two variants:
//
//   variant="display"   — non-interactive (default). Renders as a styled span.
//   variant="filter"    — toggleable. Renders as a Pressable; `selected` state
//                         flips bg/text color.
//
// Colors accept overrides for category-driven palettes (ResourcesTab CAT_META).
// When no overrides, falls back to the M3 surfaceContainerHigh + outline pair.
//
// `iconText` is a leading display string — can be an emoji (`"📘"`), a Material
// Symbol name wrapped in <span className="material-symbols-rounded">, or null.
// Kept generic so the component doesn't lock callers into either icon system.

import React from 'react';
import { Text } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, shape } from '../../theme.js';

const BASE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: shape.sm, // 8 — M3 chip corner
  borderWidth: 1,
  fontSize: 11,
  fontWeight: '800',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  lineHeight: '16px',
  whiteSpace: 'nowrap',
};

export function Chip({
  label,
  iconText = null,
  variant = 'display',
  selected = false,
  onPress,
  // Color overrides — falls back to M3 surface tones when omitted.
  bg,
  textColor,
  borderColor,
}) {
  const resolvedBg = bg ?? (selected ? colors.primary : colors.surfaceContainerHigh);
  const resolvedText = textColor ?? (selected ? colors.onPrimary : colors.onSurface);
  const resolvedBorder = borderColor ?? (selected ? colors.primary : colors.outlineVariant);

  // Display variant — non-interactive span. Matches the inline-chip pattern
  // already used in ResourcesTab category badges.
  if (variant === 'display') {
    return (
      <span
        style={{
          ...BASE_STYLE,
          backgroundColor: resolvedBg,
          color: resolvedText,
          border: `1px solid ${resolvedBorder}`,
        }}
      >
        {iconText != null && <span>{iconText}</span>}
        <span>{label}</span>
      </span>
    );
  }

  // Filter variant — toggleable Pressable. Inherits the press-morph + scale
  // animation from the unified Pressable primitive.
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: resolvedBg,
        borderRadius: shape.sm,
        borderWidth: 1,
        borderColor: resolvedBorder,
        paddingVertical: 4,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
      }}
    >
      {iconText != null && (
        <Text style={{ color: resolvedText, fontSize: 11 }}>{iconText}</Text>
      )}
      <Text
        style={{
          color: resolvedText,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default Chip;
