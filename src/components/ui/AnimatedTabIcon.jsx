import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import {
  DashboardIcon, DashboardIconFilled,
  LogIcon, LogIconFilled,
  MedsIcon, MedsIconFilled,
  CalcIcon, CalcIconFilled,
  ResourcesIcon, ResourcesIconFilled,
  AIIcon, AIIconFilled,
} from './TabIcons.jsx';

const ICONS = {
  Dashboard:    { Outline: DashboardIcon, Filled: DashboardIconFilled },
  LogInjection: { Outline: LogIcon,       Filled: LogIconFilled },
  Medications:  { Outline: MedsIcon,      Filled: MedsIconFilled },
  Calculator:   { Outline: CalcIcon,      Filled: CalcIconFilled },
  Resources:    { Outline: ResourcesIcon, Filled: ResourcesIconFilled },
  AIAssistant:  { Outline: AIIcon,        Filled: AIIconFilled },
};

const FLUID = Easing.bezier(0.32, 0.72, 0, 1);

export function AnimatedTabIcon({ name, active, pulse }) {
  const fade = useRef(new Animated.Value(active ? 1 : 0)).current;
  const bounce = useRef(new Animated.Value(1)).current;
  const pulseVal = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef(null);
  const firstRender = useRef(true);

  // Cross-fade + scale bounce on `active` change.
  useEffect(() => {
    Animated.timing(fade, {
      toValue: active ? 1 : 0,
      duration: 250,
      easing: FLUID,
      useNativeDriver: false,
    }).start();

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1.12, duration: 150, easing: FLUID, useNativeDriver: false }),
      Animated.timing(bounce, { toValue: 1.0,  duration: 150, easing: FLUID, useNativeDriver: false }),
    ]).start();
  }, [active, fade, bounce]);

  // Conditional ambient pulse (e.g. AI tab when unread interactions exist).
  useEffect(() => {
    if (pulse) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseVal, { toValue: 1.06, duration: 800, easing: FLUID, useNativeDriver: false }),
          Animated.timing(pulseVal, { toValue: 1.0,  duration: 800, easing: FLUID, useNativeDriver: false }),
        ])
      );
      pulseLoopRef.current = loop;
      loop.start();
      return () => {
        loop.stop();
        pulseVal.setValue(1);
        pulseLoopRef.current = null;
      };
    }
  }, [pulse, pulseVal]);

  const entry = ICONS[name];
  if (!entry) return null;
  const { Outline, Filled } = entry;

  return (
    <Animated.View
      style={{
        width: 24,
        height: 24,
        position: 'relative',
        transform: [{ scale: Animated.multiply(bounce, pulseVal) }],
      }}
    >
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, opacity: fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
        <Outline />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, opacity: fade }}>
        <Filled />
      </Animated.View>
      {/* Sized placeholder so the wrapper resolves to 24×24 regardless of children. */}
      <View style={{ width: 24, height: 24 }} />
    </Animated.View>
  );
}
