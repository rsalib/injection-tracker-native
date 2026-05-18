import React from 'react';
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
  return (
    // Overlay: raw div for position:fixed (DOM-specific, like <select>/<svg>/<a>)
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: blur.dialog, WebkitBackdropFilter: blur.dialog, background: colors.overlayDark }}>
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
      <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default ConfirmDialog;

const styles = StyleSheet.create({
  card: {
    ...glass.modal,
    padding: 32,
    maxWidth: 340,
    width: '100%',
    alignItems: 'center',
    animationKeyframes: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
