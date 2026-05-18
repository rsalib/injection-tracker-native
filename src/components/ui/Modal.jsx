import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, glass, blur } from '../../theme.js';

export function Modal({ title, onClose, children }) {
  const dialogRef = React.useRef(null);
  const previouslyFocusedRef = React.useRef(null);

  // Escape key close, focus trap (Tab cycling), focus restore on unmount — DOM APIs, work in RN-for-Web
  React.useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;

    const focusFirst = () => {
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const target = focusable[0] || root;
      try { target.focus(); } catch {}
    };
    focusFirst();

    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      try { previouslyFocusedRef.current?.focus?.(); } catch {}
    };
  }, [onClose]);

  return (
    // Overlay: raw div for position:fixed + click-outside (DOM-specific, like <select>/<svg>/<a>)
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: blur.input, WebkitBackdropFilter: blur.input,
        background: colors.overlay,
      }}
    >
      {/* Raw div retains ref for querySelectorAll focus trap; card itself is RN View */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex="-1"
        style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', outline: 'none', touchAction: 'manipulation' }}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} accessibilityLabel="Close" style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </div>
      <style>{`@keyframes modalPopIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default Modal;

const styles = StyleSheet.create({
  card: {
    ...glass.modal,
    padding: 24,
    animationKeyframes: 'modalPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
