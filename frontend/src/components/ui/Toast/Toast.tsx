import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useState, useCallback } from 'react';

import styles from './Toast.module.scss';
import { useToastStore } from './toastStore';

import type { ToastItem, ToastType } from './toastStore';

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
    <div className={`${styles.toast ?? ''} ${styles[toastItem.type] ?? ''} ${isExiting ? styles.exiting ?? '' : ''}`}>
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

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {toasts.map(toastItem => (
        <ToastItem
          key={toastItem.id}
          toast={toastItem}
          onRemove={() => removeToast(toastItem.id)}
        />
      ))}
    </div>
  );
};

export type { ToastType, ToastItem };
