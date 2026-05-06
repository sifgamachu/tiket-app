import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  durationMs: number;
}

interface ToastContextValue {
  show: (message: string, opts?: { kind?: ToastKind; durationMs?: number }) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const show = useCallback((message: string, opts?: { kind?: ToastKind; durationMs?: number }) => {
    const id = idRef.current++;
    const toast: Toast = { id, kind: opts?.kind ?? 'info', message, durationMs: opts?.durationMs ?? 3500 };
    setToasts(t => [...t, toast]);
  }, []);

  const value: ToastContextValue = {
    show,
    success: useCallback((m: string) => show(m, { kind: 'success' }), [show]),
    error:   useCallback((m: string) => show(m, { kind: 'error' }), [show]),
    info:    useCallback((m: string) => show(m, { kind: 'info' }), [show]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-3 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none safe-top">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, toast.durationMs);
    return () => clearTimeout(id);
  }, [toast.durationMs, onDismiss]);

  const palette = {
    success: { bg: '#1A6B3A', icon: <CheckCircle2 size={16} /> },
    error:   { bg: '#DC2626', icon: <AlertCircle size={16} /> },
    info:    { bg: '#0E1411', icon: <Info size={16} /> },
  }[toast.kind];

  return (
    <div
      role="status"
      className="pointer-events-auto rounded-xl shadow-lg px-3 py-2.5 text-white flex items-center gap-2 max-w-md w-full animate-tk-flash-in"
      style={{ background: palette.bg }}
    >
      {palette.icon}
      <span className="text-xs font-semibold flex-1">{toast.message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
