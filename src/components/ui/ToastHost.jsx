import React, { useState, useEffect } from 'react';
import { toast, shadow, blur } from '../../theme.js';

const bgColor = (t) => t === 'error' ? toast.error.bg : t === 'success' ? toast.success.bg : toast.info.bg;
const borderColor = (t) => t === 'error' ? toast.error.border : t === 'success' ? toast.success.border : toast.info.border;
const textColor = (t) => t === 'error' ? toast.error.text : t === 'success' ? toast.success.text : toast.info.text;
const icon = (t) => t === 'error' ? '⚠️' : t === 'success' ? '✅' : 'ℹ️';

export function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.showToast = (message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200);
    };
    return () => { delete window.showToast; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    // Container: raw div for position:fixed + pointerEvents:none (DOM-specific, like <select>/<svg>/<a>)
    <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none', padding: '0 16px' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: bgColor(t.type),
            backdropFilter: blur.header,
            color: textColor(t.type),
            padding: '12px 20px',
            borderRadius: '100px',
            fontSize: 14,
            fontWeight: 700,
            border: `1px solid ${borderColor(t.type)}`,
            boxShadow: shadow.toast,
            maxWidth: 420,
            pointerEvents: 'auto',
            animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span style={{ marginRight: 8 }}>{icon(t.type)}</span>{t.message}
        </div>
      ))}
      <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default ToastHost;
