import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { create } from 'zustand';

import styles from './Toast.module.scss';

// Toast types
type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  readonly id: string;
  readonly type: ToastType;
  readonly message: string;
  readonly duration?: number;
}

// Toast store
interface ToastState {
  readonly toasts: readonly ToastItem[];
  readonly addToast: (type: ToastType, message: string, duration?: number) => void;
  readonly removeToast: (id: string) => void;
}

const generateId = (): string => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, message, duration = 4000) => {
    const id = generateId();
    const newToast: ToastItem = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Helper functions for convenience
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast('success', message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast('error', message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast('info', message, duration),
};

// Icon map
const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
} as const;

// Single Toast Item Component
const ToastItem = ({ toast: toastItem, onRemove }: { toast: ToastItem; onRemove: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = ICONS[toastItem.type];

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 200);
  }, [onRemove]);

  return (
    <div className={`${styles.toast} ${styles[toastItem.type]} ${isExiting ? styles.exiting : ''}`}>
      <Icon size={20} className={styles.icon} />
      <span className={styles.message}>{toastItem.message}</span>
      <button type="button" className={styles.closeBtn} onClick={handleRemove} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toastItem) => (
        <ToastItem
          key={toastItem.id}
          toast={toastItem}
          onRemove={() => removeToast(toastItem.id)}
        />
      ))}
    </div>
  );
};
