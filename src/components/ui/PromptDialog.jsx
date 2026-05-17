import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, glass, button, input } from '../../theme.js';

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
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => onConfirm(value);

  return (
    // Overlay: raw div for position:fixed (DOM-specific, like <select>/<svg>/<a>)
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.75)' }}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TextInput
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
      <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default PromptDialog;

const styles = StyleSheet.create({
  card: {
    ...glass.modal,
    padding: 28,
    maxWidth: 360,
    width: '100%',
    animationKeyframes: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 16,
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
    ...button.primary, // TODO: expo-linear-gradient(135deg, #0e7490, #22d3ee) for native
    flex: 1,
    cursor: 'pointer',
  },
  confirmText: {
    ...button.secondaryText,
  },
});
