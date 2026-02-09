import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            {toast.type === 'success' && <span>{'\u2713'}</span>}
            {toast.type === 'error' && <span>{'\u2715'}</span>}
            {toast.type === 'warning' && <span>{'\u26A0\uFE0F'}</span>}
            {toast.type === 'info' && <span>{'\u2139'}</span>}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
