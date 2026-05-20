import React, { forwardRef, useRef, useEffect } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

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

export const InputField = forwardRef(function InputField({ style, ...props }, ref) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof el.addEventListener !== 'function') return;

    const handler = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.5;

      const ripple = document.createElement('span');
      ripple.className = 'tap-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;
      el.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };

    el.addEventListener('pointerdown', handler);
    return () => el.removeEventListener('pointerdown', handler);
  }, []);

  const { layout, visual, flat } = splitStyle(style);

  return (
    <View
      ref={wrapperRef}
      className="input-ripple-wrap"
      style={[layout, {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: flat.borderRadius || 0,
      }]}
    >
      <TextInput ref={ref} {...props} style={visual} />
    </View>
  );
});

export default InputField;
