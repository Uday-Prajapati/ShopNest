import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const { type = 'info', duration = 4000 } = options;
      const id = ++idCounter;
      setToasts((current) => [...current, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 top-16 sm:top-4 z-50 flex flex-col items-center px-4 space-y-2 pointer-events-none">
        {toasts.map((toast) => {
          const base =
            'pointer-events-auto max-w-md w-full rounded-md shadow-lg px-4 py-3 text-sm flex items-start gap-3 border';
          const byType = {
            success: 'bg-green-50 text-green-800 border-green-200',
            error: 'bg-red-50 text-red-800 border-red-200',
            info: 'bg-blue-50 text-blue-800 border-blue-200',
          }[toast.type || 'info'];
          return (
            <div key={toast.id} className={`${base} ${byType}`}>
              <div className="flex-1">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

