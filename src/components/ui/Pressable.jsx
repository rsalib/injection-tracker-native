import React, { useRef, useState } from 'react';
import { Animated, Pressable as RNPressable, StyleSheet } from 'react-native';

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

export function Pressable({ onPress, onPressIn, onPressOut, style, disabled, children, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = (e) => {
    setPressed(true);
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: false, speed: 50, bounciness: 4 }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e) => {
    setPressed(false);
    Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 50, bounciness: 4 }).start();
    onPressOut?.(e);
  };

  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  const { layout, visual } = splitStyle(resolvedStyle);

  return (
    <Animated.View style={[layout, { transform: [{ scale }] }]}>
      <RNPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
