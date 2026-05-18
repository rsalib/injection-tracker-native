import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors } from '../../theme.js';

const OPTIONS = [
  { v: 'newest', l: 'Newest' },
  { v: 'oldest', l: 'Oldest' },
  { v: 'az',     l: 'A-Z' },
  { v: 'za',     l: 'Z-A' },
];

export function SortBar({ sort, setSort }) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(o => (
        <Pressable
          key={o.v}
          onPress={() => setSort(o.v)}
          style={[styles.btn, sort === o.v && styles.btnActive]}
        >
          <Text style={[styles.label, sort === o.v && styles.labelActive]}>{o.l}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default SortBar;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  btn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.bgMid2,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSortLabel,
  },
  labelActive: {
    color: colors.white,
  },
});
