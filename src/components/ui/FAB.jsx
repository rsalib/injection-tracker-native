// M3 Floating Action Button (Tier 2 Step 2.4, v92; portal fix v94).
//
// Pattern: extended FAB (icon + label), bottom-right anchored, viewport-pinned.
// Rendered via `createPortal(…, document.body)` so the fixed positioning
// escapes the ancestor containing block created by the ScrollView (RN-for-Web's
// ScrollView wraps content in an `overflow: auto` div with implicit
// `will-change: transform` on some paths; that traps `position: fixed`
// descendants and makes them scroll with the page). Same precedent as
// `SearchDropdown.jsx` which portals for the same reason.
//
// Surface: M3 primary container (`primaryContainer` bg + `onPrimaryContainer`
// label/icon). Elevation: 3 (M3 standard for FAB at rest).
//
// Caller owns state — FAB is a pure display + onPress.

import React from 'react';
import { createPortal } from 'react-dom';
import { Text } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, shadow, shape } from '../../theme.js';

export function FAB({ icon = 'add', label, onPress, disabled = false }) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        right: 'max(20px, env(safe-area-inset-right))',
        // --fab-bottom is set only by index.css's desktop media query (32px —
        // no tab bar to clear at ≥1024px); the fallback is the mobile offset
        // that clears the floating tab capsule. v123.
        bottom: 'var(--fab-bottom, max(96px, calc(env(safe-area-inset-bottom) + 80px)))',
        zIndex: 50,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          backgroundColor: colors.primaryContainer,
          borderRadius: shape.lg, // 16 — M3 FAB shape
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          boxShadow: shadow.elevation3,
          cursor: 'pointer',
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{
            fontSize: 24,
            color: colors.onPrimaryContainer,
            lineHeight: '24px',
            fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
          }}
        >
          {icon}
        </span>
        {label != null && (
          <Text
            style={{
              color: colors.onPrimaryContainer,
              fontSize: 14,
              fontWeight: '800',
              letterSpacing: 0.1,
            }}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </div>,
    document.body
  );
}

export default FAB;
