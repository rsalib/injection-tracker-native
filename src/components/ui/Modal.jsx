import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, glass, shape, motion } from '../../theme.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

const DESKTOP_QUERY = '(min-width: 768px)';
const DRAG_THRESHOLD_PCT = 0.30;
const DRAG_THRESHOLD_FLOOR_PX = 80;
const DESKTOP_DRAG_GUTTER_PX = 24;
// Pixel travel before we commit to a dismiss-direction drag vs. let the native
// scroll handle the gesture. v99: defers setPointerCapture until direction is
// confirmed so a swipe-up at scrollTop===0 still scrolls the content natively.
const DRAG_DIRECTION_THRESHOLD_PX = 10;

// Compute the FLIP "from" transform that warps the sheet's resting rect
// exactly onto the origin element's current rect. transformOrigin: 'top left'
// is the contract — sheet's top-left aligns with card's top-left, then scale
// shrinks down to the card's footprint dimensions. Sub-project 27.
function computeFlipTransform(sheetEl, originEl) {
  if (!sheetEl || !originEl) return null;
  const rect = sheetEl.getBoundingClientRect();
  const orig = originEl.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  if (orig.width === 0 || orig.height === 0) return null;
  const scaleX = orig.width / rect.width;
  const scaleY = orig.height / rect.height;
  const tx = orig.left - rect.left;
  const ty = orig.top - rect.top;
  return `translate3d(${tx}px, ${ty}px, 0) scale(${scaleX}, ${scaleY})`;
}

export function Modal({ title, onClose, children, originElement }) {
  const dialogRef = React.useRef(null);
  const previouslyFocusedRef = React.useRef(null);
  const useFlip = !!originElement;

  // Sheet split breakpoint (768px) — independent from the 1024px desktop shell
  // breakpoint. Tracks live viewport changes (iPad rotation, window resize).
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [entered, setEntered] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  // FLIP "from" transform (card-footprint warp). Null until measured.
  const [flipFromTransform, setFlipFromTransform] = React.useState(null);
  // FLIP "to" transform on exit — re-measured at triggerClose time so the
  // exit lands on the card's CURRENT viewport position (handles background
  // scroll / resize during modal lifetime).
  const [closeToTransform, setCloseToTransform] = React.useState(null);
  const dragStateRef = React.useRef(null); // { axis: 'y'|'x', start, pointerId } | null

  // FLIP measurement — sub-project 27.
  // Runs synchronously after the first commit, BEFORE paint, in the very
  // first render where the sheet is laid out at its resting position with
  // visibility hidden (no transform applied yet). We measure both the
  // sheet's rest rect and the origin card's live rect, compute the FLIP
  // transform, and set it as the "from" state. The next render applies it
  // and the sheet appears at the card footprint for the first visible frame.
  // useLayoutEffect (vs useEffect) is critical: it lets us set state and
  // re-render BEFORE the browser commits a paint, so the user never sees
  // the bare-resting-position frame.
  React.useLayoutEffect(() => {
    if (!useFlip) return;
    const tr = computeFlipTransform(dialogRef.current, originElement);
    if (tr) setFlipFromTransform(tr);
  }, [useFlip, originElement]);

  // Trigger the enter morph AFTER the "from" frame has painted.
  // Single-rAF is insufficient: modern browser engines often batch the
  // mount render and the next state-flip into one paint cycle, skipping
  // the transition entirely and popping the sheet onscreen. Double-rAF
  // guarantees the "from" frame paints first, then the entered=true frame
  // triggers the transition. v101.
  // In FLIP mode we additionally wait for flipFromTransform to be set —
  // otherwise the enter would fire before measurement and the sheet would
  // slide from the bottom edge instead of growing from the card.
  React.useEffect(() => {
    if (useFlip && flipFromTransform === null) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
    };
  }, [useFlip, flipFromTransform]);

  const triggerClose = React.useCallback(() => {
    if (closing) return;
    // FLIP exit: re-measure originElement at this exact moment (NOT a
    // snapshot from mount time). Handles the case where the user scrolled
    // the background while the modal was open — the card has moved in
    // viewport coordinates, and our exit transform must land on its
    // CURRENT position. If origin is detached (rare — user nav'd away),
    // computeFlipTransform returns null and we fall back to the slide.
    if (useFlip) {
      const tr = computeFlipTransform(dialogRef.current, originElement);
      if (tr) setCloseToTransform(tr);
    }
    setClosing(true);
    setTimeout(() => onClose(), motion.short);
  }, [closing, onClose, useFlip, originElement]);

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
  // Two-phase: pointerdown records start coords + tentative axis WITHOUT
  // capturing the pointer; pointermove waits for ~10px of travel before
  // committing. If the travel direction is the dismiss direction (down for
  // bottom-sheet, right for side-sheet), capture the pointer and animate.
  // If the travel is in the opposite direction (e.g. swipe-up at scrollTop===0
  // to scroll the modal content), discard the tentative state and let the
  // native scroll container handle it. Mobile: tentative drag starts only at
  // scrollTop===0 (otherwise native scroll wins immediately). Desktop:
  // tentative drag starts only within the 24px left-edge gutter (preserves
  // text selection / inner scroll across the rest of the sheet body).
  const handlePointerDown = (e) => {
    if (closing) return;
    if (dragStateRef.current) return;
    const sheet = dialogRef.current;
    if (!sheet) return;

    if (isDesktop) {
      const rect = sheet.getBoundingClientRect();
      if (e.clientX - rect.left > DESKTOP_DRAG_GUTTER_PX) return;
      dragStateRef.current = { axis: 'x', start: e.clientX, pointerId: e.pointerId, captured: false };
    } else {
      if (sheet.scrollTop > 0) return;
      dragStateRef.current = { axis: 'y', start: e.clientY, pointerId: e.pointerId, captured: false };
    }
    // No setPointerCapture here — deferred to pointermove direction commit.
  };

  const handlePointerMove = (e) => {
    const state = dragStateRef.current;
    if (!state) return;
    const coord = state.axis === 'y' ? e.clientY : e.clientX;
    const delta = coord - state.start;

    if (!state.captured) {
      // Direction-commit phase: wait until the user has moved ~10px to decide
      // whether this is a dismiss drag or a native-scroll gesture.
      if (delta >= DRAG_DIRECTION_THRESHOLD_PX) {
        // Dismiss direction — commit to the drag.
        state.captured = true;
        try { e.currentTarget.setPointerCapture(state.pointerId); } catch {}
      } else if (delta <= -DRAG_DIRECTION_THRESHOLD_PX) {
        // Opposite direction — abandon this gesture so native scroll wins.
        dragStateRef.current = null;
        return;
      } else {
        // Still under threshold — keep watching.
        return;
      }
    }
    setDragOffset(Math.max(0, delta));
  };

  const handlePointerUp = (e) => {
    const state = dragStateRef.current;
    if (!state) return;
    if (state.captured) {
      try { e.currentTarget.releasePointerCapture(state.pointerId); } catch {}
    }
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
  // Only suppress the transition once the drag has committed to dismiss
  // direction (post-capture). Pre-commit, dragOffset stays at 0 so the
  // transition value is moot.
  const isDragging = dragStateRef.current?.captured === true;

  // Sheet transform: composes the from/to/drag/exit states for both the
  // slide path (originElement absent) and the FLIP path (sub-project 27).
  const sheetTransform = (() => {
    if (closing) {
      // FLIP exit: morph back to the freshly-measured card rect.
      if (useFlip && closeToTransform) return closeToTransform;
      return isDesktop ? 'translateX(100%)' : 'translateY(100%)';
    }
    if (!entered) {
      // Pre-entered "from" state.
      if (useFlip) {
        // FLIP "from": warp to the card footprint. Until measurement
        // completes, we render with visibility hidden (see sheetVisibility
        // below) so there's no flash of bare-resting-position content.
        return flipFromTransform || 'none';
      }
      return isDesktop ? 'translateX(100%)' : 'translateY(100%)';
    }
    if (dragOffset > 0) {
      return isDesktop ? `translateX(${dragOffset}px)` : `translateY(${dragOffset}px)`;
    }
    return 'translate(0, 0)';
  })();

  // FLIP mode hides the sheet during the brief window between mount and
  // the useLayoutEffect measurement completing. visibility:hidden preserves
  // layout (so getBoundingClientRect returns the resting rect) but no paint
  // reaches the user.
  const sheetVisibility = useFlip && flipFromTransform === null ? 'hidden' : 'visible';

  // Children container opacity: in FLIP mode, the sheet shape morphs from
  // the small card footprint to the full resting rect — during that grow,
  // any form fields rendered at full size would visually squish (transform
  // scale shrinks geometry). Fade children in over motion.short so they
  // become readable only as the sheet approaches its rest size. The outer
  // sheet stays opaque throughout so the morph reads as one continuous
  // shape. In slide mode (no originElement), children stay opaque — the
  // sheet just slides in fully composed.
  const childrenOpacity = useFlip ? (entered && !closing ? 1 : 0) : 1;
  const childrenTransition = useFlip
    ? `opacity var(--motion-short, 200ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))`
    : 'none';

  const sheetTransition = isDragging
    ? 'none'
    : closing
      ? `transform var(--motion-short, 200ms) var(--motion-emphasizedAccelerate, cubic-bezier(0.3, 0.0, 0.8, 0.15))`
      : `transform var(--motion-medium, 400ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))`;

  const overlayOpacity = entered && !closing ? 1 : 0;
  // v99: overlay fade-out timing matches the sheet exit so the dim doesn't
  // snap off mid-fade when the modal unmounts at `motion.short`.
  const overlayTransition = closing
    ? `opacity var(--motion-short, 200ms) var(--motion-emphasizedAccelerate, cubic-bezier(0.3, 0.0, 0.8, 0.15))`
    : `opacity var(--motion-medium, 400ms) var(--motion-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0))`;

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
        transition: overlayTransition,
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
          // v101: glass.modal spread MUST come before sheetShape so its
          // `borderRadius: 32` shorthand doesn't override the longhand
          // per-corner radii (`borderTopLeftRadius` etc.) — otherwise the
          // bottom-sheet's bottom corners and the side-sheet's right corners
          // re-round and reveal visible gaps against the screen edges.
          ...glass.modal,
          position: 'fixed',
          ...sheetPositionStyle,
          ...sheetShape,
          padding: 24,
          paddingBottom: isDesktop ? 24 : 'max(24px, env(safe-area-inset-bottom))',
          overflowY: 'auto',
          outline: 'none',
          touchAction: isDesktop ? 'manipulation' : 'pan-y',
          transform: sheetTransform,
          // FLIP math contract — sub-project 27: standardize to top-left so
          // translate3d(tx,ty,0) + scale(sx,sy) lands the sheet's top-left
          // corner exactly on the card's top-left corner. Slide path doesn't
          // care about origin (translate by 100% is origin-agnostic) but
          // pinning it doesn't break the slide either.
          transformOrigin: 'top left',
          transition: sheetTransition,
          visibility: sheetVisibility,
          // Disable interactions on the exiting sheet so taps don't land
          // on form fields or the ✕ during the close animation.
          pointerEvents: closing ? 'none' : 'auto',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            opacity: childrenOpacity,
            transition: childrenTransition,
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
