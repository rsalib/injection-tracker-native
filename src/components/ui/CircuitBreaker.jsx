import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors } from '../../theme.js';

export function CircuitBreaker({ icon, title, message, buttonText, onAction }) {
  return (
    <View style={styles.circuitScreen}>
      <Text style={styles.circuitIcon}>{icon || '⚡️'}</Text>
      <Text style={styles.circuitTitle}>{title || 'System Fault'}</Text>
      <Text style={styles.circuitBody}>{message || 'Unknown error'}</Text>
      <Pressable onPress={onAction} style={styles.circuitBtn}>
        <Text style={styles.circuitBtnText}>{buttonText || 'RETRY'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  circuitScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: '100vh',
  },
  circuitIcon: {
    fontSize: 72,
    marginBottom: 24,
  },
  circuitTitle: {
    color: colors.errorStrong,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: -0.56,
    textAlign: 'center',
  },
  circuitBody: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: 400,
    textAlign: 'center',
  },
  circuitBtn: {
    backgroundColor: colors.errorStrong,
    borderRadius: 100,
    paddingVertical: 18,
    paddingHorizontal: 32,
    cursor: 'pointer',
    boxShadow: `0 10px 25px -5px ${colors.errorDeepMid}`,
  },
  circuitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
});
