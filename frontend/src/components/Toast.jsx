import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({ show: () => {} });

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = useCallback((msg, timeout = 2500) => {
    setMessage(msg);
    setVisible(true);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setVisible(false), timeout);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && <div className="toast">{message}</div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}


