import clsx from 'clsx';

import styles from './Card.module.scss';

import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  readonly hoverable?: boolean;
}

export const Card = ({
  children,
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={clsx(
        styles.card,
        styles[`padding-${padding}`],
        hoverable && styles.hoverable,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action }: CardHeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};
