import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable as RNPressable, StyleSheet } from 'react-native';
import { motion, shape } from '../../theme.js';

// M3 emphasized motion curves — see theme.js motion docblock.
const EMPHASIZED = Easing.bezier(...motion.emphasizedBezier);
const EMPHASIZED_DECEL = Easing.bezier(...motion.emphasizedDecelerateBezier);

// Animated inner pressable so borderRadius can morph during press.
const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

// M3 expressive press-morph — sub-project 18 (v90), Tier 2 Step 2.2.
// On press: borderRadius reduces by PRESS_RADIUS_DELTA, clamped at MIN.
// Delta of 8 maps the plan's reference example (shape.lg 16 → shape.sm 8).
// For pills (radius ≥ ~half-height, e.g. 100), the 8px reduction stays
// well above the half-height threshold so the visual stays a pill — pill
// buttons don't morph, matching M3 spec. For cards (24 → 16) and FABs
// (28 → 20) the morph reads as a subtle tactile squish.
const PRESS_RADIUS_DELTA = 8;
const MIN_PRESSED_RADIUS = shape.xs; // 4

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

export const Pressable = React.forwardRef(function Pressable({ onPress, onPressIn, onPressOut, onHoverIn, onHoverOut, style, disabled, children, ...props }, ref) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);

  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  const { layout, visual } = splitStyle(resolvedStyle);

  // Press-morph borderRadius — sub-project 18 (v90), Tier 2 Step 2.2.
  // Read once from visual; consumer doesn't pass borderRadius → 0 → no morph.
  const initialBorderRadius = typeof visual.borderRadius === 'number' ? visual.borderRadius : 0;
  const pressedBorderRadius = initialBorderRadius > 0
    ? Math.max(initialBorderRadius - PRESS_RADIUS_DELTA, MIN_PRESSED_RADIUS)
    : 0;
  const borderRadiusAnim = useRef(new Animated.Value(initialBorderRadius)).current;
  // Strip borderRadius out of visual — animated value applies it on the inner
  // AnimatedPressable instead, so the two don't double-set.
  const { borderRadius: _br, ...visualNoRadius } = visual;

  const handlePressIn = (e) => {
    setPressed(true);
    // M3 emphasized press: snap down to 0.97 over motion.short on the standard curve.
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: motion.short,
        easing: EMPHASIZED,
        useNativeDriver: false,
      }),
      Animated.timing(borderRadiusAnim, {
        toValue: pressedBorderRadius,
        duration: motion.short,
        easing: EMPHASIZED,
        useNativeDriver: false,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e) => {
    setPressed(false);
    // M3 expressive release-back: overshoot to 1.04, then settle to 1.0.
    // Two-stage sequence so the snap reads as a tactile rebound rather than a
    // flat tween. Total duration matches motion.short for parity with press-in.
    // borderRadius morphs back in parallel — single 200ms tween, no overshoot
    // (shape doesn't rebound, only scale does).
    Animated.parallel([
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
      ]),
      Animated.timing(borderRadiusAnim, {
        toValue: initialBorderRadius,
        duration: motion.short,
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

  return (
    <Animated.View ref={ref} style={[layout, { transform: [{ scale }, { translateY }] }]}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        disabled={disabled}
        style={[visualNoRadius, { borderRadius: borderRadiusAnim, width: '100%', height: '100%' }]}
        {...props}
      >
        {children}
      </AnimatedPressable>
    </Animated.View>
  );
});

export default Pressable;
