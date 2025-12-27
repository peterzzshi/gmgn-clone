import { Link } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';

import styles from './Header.module.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>GMGN</span>
          <span className={styles.logoDot}>.AI</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/market" className={styles.navLink}>
            Market
          </Link>
          <Link to="/trade" className={styles.navLink}>
            Trade
          </Link>
          <Link to="/copy-trade" className={styles.navLink}>
            Copy Trade
          </Link>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <Bell size={20} />
          </button>
          <Link to="/wallet" className={styles.iconBtn} aria-label="Wallet">
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};
