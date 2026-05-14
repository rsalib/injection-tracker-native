import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';

export function SearchDropdown({ value, onChange, onSelect, options, renderOption, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <View style={styles.wrapper} ref={ref}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor="#6b7280"
        value={value}
        onChangeText={text => { onChange(text); setOpen(true); }}
        onFocus={() => setOpen(true)}
        // Delay close so Pressable onPress fires first
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && options.length > 0 && (
        <View style={styles.dropdown}>
          {options.map((o, i) => (
            <Pressable
              key={i}
              onPress={() => { onSelect(o); setOpen(false); }}
              style={styles.optionWrapper}
            >
              {renderOption(o)}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default SearchDropdown;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: 'white',
    fontSize: 15,
    outlineStyle: 'none',
  },
  dropdown: {
    position: 'absolute',
    zIndex: 50,
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    marginTop: 8,
    maxHeight: 240,
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    padding: 8,
  },
  optionWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 2,
  },
});
