import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TextInput } from 'react-native';

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
        style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, paddingHorizontal: 18, paddingVertical: 14, color: 'white', fontSize: 16, outlineStyle: 'none' }}
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
          backgroundColor: '#f3f4f6',
          color: '#111827',
          borderRadius: 24,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          padding: 8,
          animation: 'dropdownPopIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: 'top center',
        }}>
          <style>{`@keyframes dropdownPopIn { 0% { opacity: 0; transform: scale(0.97) translateY(-4px); } 70% { opacity: 1; transform: scale(1.01) translateY(0); } 100% { transform: scale(1) translateY(0); } }`}</style>
          {options.map((o, i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); onSelect(o); setOpen(false); }}
              style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 2, backgroundColor: '#f3f4f6', cursor: 'pointer' }}
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
