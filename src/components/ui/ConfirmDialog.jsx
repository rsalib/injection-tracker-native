import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function ConfirmDialog({
  titleIcon = '⚠️',
  titleText = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  confirmBg = 'rgba(239, 68, 68, 0.15)',
  confirmColor = '#f87171',
}) {
  return (
    // Overlay: raw div for position:fixed (DOM-specific, like <select>/<svg>/<a>)
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.75)' }}>
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
    backgroundColor: 'rgba(31, 41, 55, 0.98)',
    borderRadius: 32,
    padding: 32,
    maxWidth: 340,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    animationKeyframes: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.36,
    textAlign: 'center',
  },
  message: {
    color: '#9ca3af',
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
    flex: 1,
    padding: 14,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cancelText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 100,
    alignItems: 'center',
    cursor: 'pointer',
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
