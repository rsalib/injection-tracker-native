import React, { forwardRef, useRef } from 'react';
import { Animated, TextInput, View, StyleSheet, Easing } from 'react-native';
import { colors } from '../../theme.js';

// Apple deliberate ease — matches dropdownUnfold and other Fluid motion in this app
const APPLE_EASE = Easing.bezier(0.32, 0.72, 0, 1);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const LAYOUT_PROPS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis',
  'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginHorizontal', 'marginVertical',
  'alignSelf', 'position', 'top', 'right', 'bottom', 'left',
]);

function splitStyle(style) {
  const flat = StyleSheet.flatten(style) || {};
  const layout = {};
  const visual = {};
  Object.entries(flat).forEach(([k, v]) => {
    if (LAYOUT_PROPS.has(k)) layout[k] = v;
    else visual[k] = v;
  });
  return { layout, visual, flat };
}

export const InputField = forwardRef(function InputField({ style, onFocus, onBlur, ...props }, ref) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e) => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 250,
      easing: APPLE_EASE,
      useNativeDriver: false,
    }).start();
    pulseAnim.setValue(0);
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 400,
      easing: APPLE_EASE,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 250,
      easing: APPLE_EASE,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const { layout, visual, flat } = splitStyle(style);
  const borderRadius = flat.borderRadius || 0;
  const hasBorder = (flat.borderWidth || 0) > 0;

  // Pulse ring: expands outward from input bounds, fades to transparent
  const ringScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  // Settled focused state: border color transitions to blue
  const animatedBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [flat.borderColor || 'transparent', colors.blue],
  });

  return (
    <View style={[layout, { position: 'relative' }]}>
      {hasBorder && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius,
            borderWidth: 2,
            borderColor: colors.blue,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
            zIndex: 1,
          }}
        />
      )}
      <AnimatedTextInput
        ref={ref}
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[visual, hasBorder && { borderColor: animatedBorderColor }]}
      />
    </View>
  );
});

export default InputField;
