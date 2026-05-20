import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { colors, shadow, blur, input } from '../../theme.js';
import { InputField } from './InputField.jsx';

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
      <InputField id="field-searchdropdown-19" name="field-searchdropdown-19" nativeID="field-searchdropdown-19"
        style={{ width: '100%', ...input.field, backdropFilter: blur.input, WebkitBackdropFilter: blur.input }}
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
          animation: 'dropdownUnfold 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
          transformOrigin: 'top center',
          transform: 'scale(0.85)',
          opacity: 0,
        }}>
          <style>{`@keyframes dropdownUnfold { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }`}</style>
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
