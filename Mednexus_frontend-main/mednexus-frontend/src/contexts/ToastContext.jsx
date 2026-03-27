import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        globalThis.setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(
    () => ({
      toast: show,
      success: (message, duration) => show(message, 'success', duration),
      error: (message, duration) => show(message, 'error', duration),
      info: (message, duration) => show(message, 'info', duration),
    }),
    [show]
  );

  const icon = (type) => {
    const cls = 'w-5 h-5 shrink-0';
    switch (type) {
      case 'success':
        return <CheckCircle2 className={`${cls} text-emerald-500`} aria-hidden />;
      case 'error':
        return <AlertCircle className={`${cls} text-red-500`} aria-hidden />;
      default:
        return <Info className={`${cls} text-sky-500`} aria-hidden />;
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-lg backdrop-blur-md dark:border-slate-600/80 dark:bg-slate-900/95 dark:text-slate-100"
              role="status"
            >
              {icon(t.type)}
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
