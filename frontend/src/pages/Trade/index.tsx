import { useParams } from 'react-router-dom';

import styles from './Trade.module.scss';

export const TradePage = () => {
  const { tokenId } = useParams<{ tokenId?: string }>();

  return (
    <div className={styles.trade}>
      <div className={styles.container}>
        <h1 className={styles.title}>Trade</h1>
        {tokenId && <p className={styles.tokenInfo}>Trading: {tokenId}</p>}
        <p className={styles.placeholder}>Trading interface coming soon...</p>
      </div>
    </div>
  );
};
