import styles from './Market.module.scss';

export const MarketPage = () => {
  return (
    <div className={styles.market}>
      <div className={styles.container}>
        <h1 className={styles.title}>Market</h1>
        <p className={styles.placeholder}>Market data coming soon...</p>
      </div>
    </div>
  );
};
