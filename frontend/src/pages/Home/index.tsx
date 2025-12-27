import styles from './Home.module.scss';

export const HomePage = () => {
  return (
    <div className={styles.home}>
      <div className={styles.container}>
        <h1 className={styles.title}>GMGN Clone</h1>
        <p className={styles.subtitle}>Cryptocurrency Trading Platform</p>

        <div className={styles.quickActions}>
          <a href="/trade" className={styles.actionCard}>
            <span className={styles.actionIcon}>📈</span>
            <span className={styles.actionLabel}>Trade</span>
          </a>
          <a href="/copy-trade" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>Copy Trade</span>
          </a>
          <a href="/market" className={styles.actionCard}>
            <span className={styles.actionIcon}>🔥</span>
            <span className={styles.actionLabel}>Market</span>
          </a>
          <a href="/wallet" className={styles.actionCard}>
            <span className={styles.actionIcon}>💼</span>
            <span className={styles.actionLabel}>Wallet</span>
          </a>
        </div>
      </div>
    </div>
  );
};
