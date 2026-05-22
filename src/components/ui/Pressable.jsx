import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable as RNPressable, StyleSheet } from 'react-native';
import { motion } from '../../theme.js';

// M3 emphasized motion curves — see theme.js motion docblock.
const EMPHASIZED = Easing.bezier(...motion.emphasizedBezier);
const EMPHASIZED_DECEL = Easing.bezier(...motion.emphasizedDecelerateBezier);

const LAYOUT_PROPS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginHorizontal', 'marginVertical',
  'alignSelf', 'position', 'top', 'bottom', 'left', 'right',
]);

function splitStyle(style) {
  const flat = StyleSheet.flatten(style) || {};
  const layout = {};
  const visual = {};
  Object.entries(flat).forEach(([key, val]) => {
    if (LAYOUT_PROPS.has(key)) layout[key] = val;
    else visual[key] = val;
  });
  return { layout, visual };
}

export function Pressable({ onPress, onPressIn, onPressOut, onHoverIn, onHoverOut, style, disabled, children, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = (e) => {
    setPressed(true);
    // M3 emphasized press: snap down to 0.97 over motion.short on the standard curve.
    Animated.timing(scale, {
      toValue: 0.97,
      duration: motion.short,
      easing: EMPHASIZED,
      useNativeDriver: false,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e) => {
    setPressed(false);
    // M3 expressive release-back: overshoot to 1.04, then settle to 1.0.
    // Two-stage sequence so the snap reads as a tactile rebound rather than a
    // flat tween. Total duration matches motion.short for parity with press-in.
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.04,
        duration: 130,
        easing: EMPHASIZED,
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 70,
        easing: EMPHASIZED_DECEL,
        useNativeDriver: false,
      }),
    ]).start();
    onPressOut?.(e);
  };

  const handleHoverIn = (e) => {
    // Hover lift uses emphasizedDecelerate — element arriving toward the cursor.
    Animated.timing(translateY, {
      toValue: motion.hoverLiftPx,
      duration: 250,
      easing: EMPHASIZED_DECEL,
      useNativeDriver: false,
    }).start();
    onHoverIn?.(e);
  };

  const handleHoverOut = (e) => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 200,
      easing: EMPHASIZED,
      useNativeDriver: false,
    }).start();
    onHoverOut?.(e);
  };

  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  const { layout, visual } = splitStyle(resolvedStyle);

  return (
    <Animated.View style={[layout, { transform: [{ scale }, { translateY }] }]}>
      <RNPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        disabled={disabled}
        style={[visual, { width: '100%', height: '100%' }]}
        {...props}
      >
        {children}
      </RNPressable>
    </Animated.View>
  );
}

export default Pressable;
