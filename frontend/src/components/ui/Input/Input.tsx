import clsx from 'clsx';

import styles from './Input.module.scss';

import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
}

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx(styles.wrapper, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={clsx(styles.inputWrapper, error && styles.hasError)}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <input
          id={inputId}
          className={styles.input}
          {...props}
        />
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
