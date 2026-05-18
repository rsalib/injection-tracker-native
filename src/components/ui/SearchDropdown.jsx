import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TextInput } from 'react-native';
import { colors, shadow, blur } from '../../theme.js';

export function SearchDropdown({ value, onChange, onSelect, options, renderOption, placeholder, onSubmit }) {
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
      <TextInput id="field-searchdropdown-19" name="field-searchdropdown-19" nativeID="field-searchdropdown-19"
        style={{ width: '100%', backgroundColor: colors.surface, backdropFilter: blur.input, WebkitBackdropFilter: blur.input, border: `1px solid ${colors.borderSubtle}`, borderTop: `1px solid ${colors.borderHighlight}`, borderRadius: 100, paddingHorizontal: 18, paddingVertical: 14, color: colors.white, fontSize: 16, outlineStyle: 'none' }}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={text => { onChange(text); handleOpen(); }}
        onFocus={handleOpen}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onSubmitEditing={() => onSubmit && onSubmit(value)}
      />
      {open && options.length > 0 && rect && createPortal(
        <div style={{
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
          backgroundColor: colors.dropdownBg,
          color: colors.bg,
          borderRadius: 24,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: shadow.dropdownPanel,
          padding: 8,
          animation: 'dropdownPopIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: 'top center',
        }}>
          <style>{`@keyframes dropdownPopIn { 0% { opacity: 0; transform: scale(0.97) translateY(-4px); } 70% { opacity: 1; transform: scale(1.01) translateY(0); } 100% { transform: scale(1) translateY(0); } }`}</style>
          {options.map((o, i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); onSelect(o); setOpen(false); }}
              style={{ backgroundColor: colors.dropdownBg, padding: '14px 18px', borderBottom: `1px solid ${colors.dropdownDivider}`, fontFamily: 'Arial', fontSize: 16, fontWeight: '400', color: colors.bg, cursor: 'pointer' }}
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
