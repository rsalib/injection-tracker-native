import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { badge, type } from '../../theme.js';

const COLOR_MAP = badge;

export function Badge({ label, color = 'gray' }) {
  const { bg, text, border, glow } = COLOR_MAP[color] || COLOR_MAP.gray;
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, glow && { boxShadow: glow }]}>
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
    ...type.microLabel,
  },
});
