// M3 Segmented Button primitive (Tier 2 Step 2.4, v92).
//
// Row of mutually-exclusive options; one selected at a time. M3 spec: connected
// pill geometry where the row reads as a single capsule with internal dividers.
// Selected option fills with primary (or `selectedBg` override); unselected
// stay on `surfaceContainerLow`.
//
// Not yet wired by any consumer in v92. Documented as a ready primitive for
// future use (the MedsTab "Active / Archived" view toggle is a natural fit
// once it's converted from collapse-toggle to true segmented switch). Matches
// the conservative-primitive pattern established by `glass.cardWarning`
// (sub-project 11) — net-additive, no behavior change to current screens.
//
// API:
//   <SegmentedButton
//     options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }]}
//     value={view}
//     onChange={setView}
//   />

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, shape } from '../../theme.js';

export function SegmentedButton({ options = [], value, onChange }) {
  return (
    <View style={styles.row}>
      {options.map((opt, i) => {
        const selected = opt.value === value;
        const isFirst = i === 0;
        const isLast = i === options.length - 1;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange?.(opt.value)}
            style={{
              flex: 1,
              backgroundColor: selected ? colors.secondaryContainer : colors.surfaceContainerLow,
              borderWidth: 1,
              borderColor: colors.outlineVariant,
              borderLeftWidth: isFirst ? 1 : 0,
              borderTopLeftRadius: isFirst ? shape.full : 0,
              borderBottomLeftRadius: isFirst ? shape.full : 0,
              borderTopRightRadius: isLast ? shape.full : 0,
              borderBottomRightRadius: isLast ? shape.full : 0,
              paddingVertical: 10,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                color: selected ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 0.1,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
});

export default SegmentedButton;
