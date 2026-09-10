import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none'
        }}
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          let bg = '#1E293B';
          let border = '#334155';
          let icon = <Info size={18} color="#60A5FA" />;

          if (t.type === 'success') {
            bg = '#064E3B';
            border = '#059669';
            icon = <CheckCircle2 size={18} color="#34D399" />;
          } else if (t.type === 'error') {
            bg = '#7F1D1D';
            border = '#DC2626';
            icon = <XCircle size={18} color="#F87171" />;
          } else if (t.type === 'warning') {
            bg = '#78350F';
            border = '#D97706';
            icon = <AlertTriangle size={18} color="#FBBF24" />;
          }

          return (
            <div
              key={t.id}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                pointerEvents: 'auto',
                fontSize: '0.875rem',
                lineHeight: '1.4',
                animation: 'slideInRight 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {icon}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

