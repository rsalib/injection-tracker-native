import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TextInput, StyleSheet } from 'react-native';

export function SearchDropdown({ value, onChange, onSelect, options, renderOption, placeholder }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleOpen = () => {
    if (wrapperRef.current) setRect(wrapperRef.current.getBoundingClientRect());
    setOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor="#6b7280"
        value={value}
        onChangeText={text => { onChange(text); handleOpen(); }}
        onFocus={handleOpen}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && options.length > 0 && rect && createPortal(
        <div style={{
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
          backgroundColor: 'rgba(17,24,39,0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          padding: 8,
        }}>
          {options.map((o, i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); onSelect(o); setOpen(false); }}
              style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 2, backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              {renderOption(o)}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default SearchDropdown;

const styles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: 'white',
    fontSize: 16,
    outlineStyle: 'none',
  },
});
