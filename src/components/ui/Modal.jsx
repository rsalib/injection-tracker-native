import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, glass, shape, motion } from '../../theme.js';

const DESKTOP_QUERY = '(min-width: 768px)';
const DRAG_THRESHOLD_PCT = 0.30;
const DRAG_THRESHOLD_FLOOR_PX = 80;
const DESKTOP_DRAG_GUTTER_PX = 24;

export function Modal({ title, onClose, children }) {
  const dialogRef = React.useRef(null);
  const previouslyFocusedRef = React.useRef(null);

  const [isDesktop, setIsDesktop] = React.useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
  );
  const [entered, setEntered] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const dragStateRef = React.useRef(null); // { axis: 'y'|'x', start, pointerId } | null

  // Track viewport changes (e.g. iPad rotation, browser resize across 768px).
  React.useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Trigger the enter slide on the next frame so the off-screen initial
  // transform paints before the transition kicks in.
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const triggerClose = React.useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), motion.short);
  }, [closing, onClose]);

  // Focus trap, Escape key, focus restore — unchanged from prior implementation.
  // Routes Escape through triggerClose so the exit animation plays.
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
      if (e.key === 'Escape') { triggerClose(); return; }
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
  }, [triggerClose]);

  // ----- Drag handling -----------------------------------------------------
  // Mobile: any pointerdown on the sheet starts a drag along Y, unless the
  // inner content is scrolled past the top (let native scroll handle it).
  // Desktop: only pointerdown within the 24px left-edge gutter starts a
  // drag along X — preserves text-selection and inner scroll in the body.
  const handlePointerDown = (e) => {
    if (closing) return;
    if (dragStateRef.current) return;
    const sheet = dialogRef.current;
    if (!sheet) return;

    if (isDesktop) {
      const rect = sheet.getBoundingClientRect();
      if (e.clientX - rect.left > DESKTOP_DRAG_GUTTER_PX) return;
      dragStateRef.current = { axis: 'x', start: e.clientX, pointerId: e.pointerId };
    } else {
      if (sheet.scrollTop > 0) return;
      dragStateRef.current = { axis: 'y', start: e.clientY, pointerId: e.pointerId };
    }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e) => {
    const state = dragStateRef.current;
    if (!state) return;
    const coord = state.axis === 'y' ? e.clientY : e.clientX;
    const delta = Math.max(0, coord - state.start);
    setDragOffset(delta);
  };

  const handlePointerUp = (e) => {
    const state = dragStateRef.current;
    if (!state) return;
    try { e.currentTarget.releasePointerCapture(state.pointerId); } catch {}
    const sheet = dialogRef.current;
    const dim = state.axis === 'y'
      ? (sheet?.offsetHeight ?? window.innerHeight)
      : (sheet?.offsetWidth ?? window.innerWidth);
    const threshold = Math.max(DRAG_THRESHOLD_FLOOR_PX, dim * DRAG_THRESHOLD_PCT);
    dragStateRef.current = null;
    if (dragOffset > threshold) {
      // Leave dragOffset where it is; closing transition will animate the
      // rest of the way out from the dragged position.
      triggerClose();
    } else {
      setDragOffset(0);
    }
  };

  // ----- Visual state ------------------------------------------------------
  const isDragging = dragStateRef.current !== null;

  // Sheet transform: the off-screen start, the resting in-screen, the
  // dragged offset, and the closing exit are composed here.
  const sheetTransform = (() => {
    if (closing) {
      return isDesktop ? 'translateX(100%)' : 'translateY(100%)';
    }
    if (!entered) {
      return isDesktop ? 'translateX(100%)' : 'translateY(100%)';
    }
    if (dragOffset > 0) {
      return isDesktop ? `translateX(${dragOffset}px)` : `translateY(${dragOffset}px)`;
    }
    return 'translate(0, 0)';
  })();

  const sheetTransition = isDragging
    ? 'none'
    : closing
      ? `transform var(--motion-short, 200ms) var(--motion-emphasizedAccelerate, cubic-bezier(0.3, 0.0, 0.8, 0.15))`
      : `transform var(--motion-medium, 400ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))`;

  const overlayOpacity = entered && !closing ? 1 : 0;

  // ----- Layout: bottom-sheet vs side-sheet --------------------------------
  const sheetPositionStyle = isDesktop
    ? { top: 0, right: 0, bottom: 0, width: 'min(480px, 90vw)', maxWidth: 480 }
    : { left: 0, right: 0, bottom: 0, maxHeight: '90vh' };

  const sheetShape = isDesktop
    ? { borderTopLeftRadius: shape.xl, borderBottomLeftRadius: shape.xl, borderTopRightRadius: 0, borderBottomRightRadius: 0 }
    : { borderTopLeftRadius: shape.xl, borderTopRightRadius: shape.xl, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && triggerClose()}
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: colors.overlay,
        opacity: overlayOpacity,
        transition: `opacity var(--motion-medium, 400ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))`,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex="-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'fixed',
          ...sheetPositionStyle,
          ...sheetShape,
          ...glass.modal,
          padding: 24,
          paddingBottom: isDesktop ? 24 : 'max(24px, env(safe-area-inset-bottom))',
          overflowY: 'auto',
          outline: 'none',
          touchAction: isDesktop ? 'manipulation' : 'pan-y',
          transform: sheetTransform,
          transition: sheetTransition,
          willChange: 'transform',
        }}
      >
        {!isDesktop && (
          <View style={styles.dragHandleRow}>
            <View style={styles.dragHandle} />
          </View>
        )}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={triggerClose} accessibilityLabel="Close" style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        {children}
      </div>
    </div>
  );
}

export default Modal;

const styles = StyleSheet.create({
  dragHandleRow: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: -8,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outline,
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
