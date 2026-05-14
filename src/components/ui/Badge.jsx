import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLOR_MAP = {
  blue:   { bg: 'rgba(59, 130, 246, 0.15)',  text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
  green:  { bg: 'rgba(34, 197, 94, 0.15)',   text: '#86efac', border: 'rgba(34, 197, 94, 0.3)' },
  red:    { bg: 'rgba(239, 68, 68, 0.15)',   text: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
  yellow: { bg: 'rgba(234, 179, 8, 0.15)',   text: '#fde68a', border: 'rgba(234, 179, 8, 0.3)' },
  orange: { bg: 'rgba(249, 115, 22, 0.15)',  text: '#fdba74', border: 'rgba(249, 115, 22, 0.3)' },
  purple: { bg: 'rgba(168, 85, 247, 0.15)',  text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.3)' },
  gray:   { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
};

export function Badge({ label, color = 'gray' }) {
  const { bg, text, border } = COLOR_MAP[color] || COLOR_MAP.gray;
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

export default Badge;

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
