import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Wallet, Copy, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

import styles from './BottomNav.module.scss';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/market', icon: BarChart3, label: 'Market' },
  { to: '/trade', icon: TrendingUp, label: 'Trade' },
  { to: '/copy-trade', icon: Copy, label: 'Copy' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
];

export const BottomNav = () => {
  return (
    <nav className={styles.bottomNav}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
        >
          <Icon size={20} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
