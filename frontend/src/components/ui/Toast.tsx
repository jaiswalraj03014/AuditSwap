import { createContext, useContext, useState, useCallback, type ReactNode, type FC } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  sub?: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, title: string, sub?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

const ICON: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: '·',
};

const STYLE: Record<ToastType, { border: string; icon: string }> = {
  success: {
    border: 'border-neutral-900/20 dark:border-white/20',
    icon: 'text-neutral-900 dark:text-white',
  },
  error: {
    border: 'border-red-400/30 dark:border-red-500/30',
    icon: 'text-red-500/80',
  },
  info: {
    border: 'border-neutral-300 dark:border-neutral-700',
    icon: 'text-neutral-500',
  },
};

const ToastItem: FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const s = STYLE[toast.type];
  return (
    <div
      className={`toast-slide-in bg-[#f4f3ef] dark:bg-[#151515] border ${s.border} rounded px-4 py-3 min-w-[220px] max-w-[300px] shadow-md flex items-start gap-3 cursor-pointer`}
      onClick={onDismiss}
    >
      <span className={`text-sm leading-none mt-0.5 flex-shrink-0 ${s.icon}`}>
        {ICON[toast.type]}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold tracking-wide">
          {toast.title}
        </div>
        {toast.sub && (
          <div className="text-[9px] text-neutral-500 mt-0.5 leading-relaxed">{toast.sub}</div>
        )}
      </div>
    </div>
  );
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, sub?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, sub }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
