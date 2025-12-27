import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Wallet, Copy, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

import styles from './BottomNav.module.scss';

import type { LucideIcon } from 'lucide-react';

interface NavItem {
  readonly to: string;
  readonly icon: LucideIcon;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/market', icon: BarChart3, label: 'Market' },
  { to: '/trade', icon: TrendingUp, label: 'Trade' },
  { to: '/copy-trade', icon: Copy, label: 'Copy' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
] as const;

export const BottomNav = () => {
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
          end={to === '/'}
        >
          <Icon size={20} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
