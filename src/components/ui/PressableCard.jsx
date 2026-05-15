import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

export default function PressableCard({ onPress, style, pressableStyle, children, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, {
    toValue: 0.97,
    useNativeDriver: false,
    speed: 50,
    bounciness: 4,
  }).start();

  const onPressOut = () => Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: false,
    speed: 50,
    bounciness: 4,
  }).start();

  return (
    <Animated.View style={[{ width: '100%', alignSelf: 'stretch' }, style, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={[{ width: '100%', flex: 1 }, pressableStyle]} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
