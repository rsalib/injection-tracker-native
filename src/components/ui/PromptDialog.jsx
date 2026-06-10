import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { InputField } from './InputField.jsx';
import { colors, glass, button, input, blur } from '../../theme.js';

export function PromptDialog({
  title,
  message,
  initialValue = '',
  placeholder = '',
  inputType = 'text',
  onConfirm,
  onCancel,
  confirmText = 'Save',
}) {
  const [value, setValue] = useState(String(initialValue || ''));
  const [entered, setEntered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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

  const handleSubmit = () => onConfirm(value);

  return (
    // Overlay: raw div for position:fixed (DOM-specific, like <select>/<svg>/<a>)
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: blur.dialog, WebkitBackdropFilter: blur.dialog, background: colors.overlayDark, opacity: entered ? 1 : 0, transition: 'opacity var(--motion-medium, 400ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))' }}>
      {/* Animation host: raw div — CSS transitions don't apply via RN StyleSheet (Dev Rule 31) */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        opacity: entered ? 1 : 0,
        transform: entered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(10px)',
        transition: 'opacity var(--motion-medium, 400ms) var(--motion-emphasizedDecelerate, cubic-bezier(0.05, 0.7, 0.1, 1.0)), transform var(--motion-medium, 400ms) var(--motion-emphasizedDecelerate, cubic-bezier(0.05, 0.7, 0.1, 1.0))',
      }}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <InputField id="field-promptdialog-18" name="field-promptdialog-18" nativeID="field-promptdialog-18"
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={inputType === 'number' ? 'numeric' : 'default'}
          autoFocus
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
          style={styles.input}
        />
        <View style={styles.btnRow}>
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </Pressable>
          <Pressable onPress={handleSubmit} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>{confirmText.toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>
      </div>
    </div>
  );
}

export default PromptDialog;

const styles = StyleSheet.create({
  card: {
    ...glass.modal,
    padding: 28,
    width: '100%',
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.34,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    ...input.field,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
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
    ...button.primary, // TODO: expo-linear-gradient(135deg, #0e7490, #0a84ff) for native
    flex: 1,
    cursor: 'pointer',
  },
  confirmText: {
    ...button.secondaryText,
  },
});
