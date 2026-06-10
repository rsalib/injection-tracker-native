import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, glass, button, blur } from '../../theme.js';

export function ConfirmDialog({
  titleIcon = '⚠️',
  titleText = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  confirmBg = colors.errorStrongBg,
  confirmColor = colors.error,
}) {
  const [entered, setEntered] = useState(false);

  // Double-rAF guarantees the from-frame paints before the transition fires
  // (single rAF can be batched into the mount paint — Modal.jsx v101 pattern).
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
    };
  }, []);

  return (
    // Overlay: raw div for position:fixed (DOM-specific, like <select>/<svg>/<a>)
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: blur.dialog, WebkitBackdropFilter: blur.dialog, background: colors.overlayDark, opacity: entered ? 1 : 0, transition: 'opacity var(--motion-medium, 400ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))' }}>
      {/* Animation host: raw div — CSS transitions don't apply via RN StyleSheet (Dev Rule 31) */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        opacity: entered ? 1 : 0,
        transform: entered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(10px)',
        transition: 'opacity var(--motion-medium, 400ms) var(--motion-emphasizedDecelerate, cubic-bezier(0.05, 0.7, 0.1, 1.0)), transform var(--motion-medium, 400ms) var(--motion-emphasizedDecelerate, cubic-bezier(0.05, 0.7, 0.1, 1.0))',
      }}>
        <View style={styles.card}>
          <Text style={styles.icon}>{titleIcon}</Text>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.btnRow}>
            <Pressable onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.confirmBtn, { backgroundColor: confirmBg }]}>
              <Text style={[styles.confirmText, { color: confirmColor }]}>{confirmText.toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>
      </div>
    </div>
  );
}

export default ConfirmDialog;

const styles = StyleSheet.create({
  card: {
    ...glass.modal,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.36,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 21,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    ...button.secondary,
    flex: 1,
    cursor: 'pointer',
  },
  cancelText: {
    ...button.secondaryText,
  },
  confirmBtn: {
    ...button.secondary,
    flex: 1,
    cursor: 'pointer',
  },
  confirmText: {
    ...button.secondaryText,
  },
});
