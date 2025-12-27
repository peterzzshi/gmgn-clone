import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import { formatPrice, formatPercent, formatCompact } from '@/utils/format';

import styles from './TokenRow.module.scss';

import type { TokenWithMarket } from '@/types';

interface TokenRowProps {
  readonly token: TokenWithMarket;
  readonly rank?: number;
  readonly showVolume?: boolean;
}

export const TokenRow = ({ token, rank, showVolume = false }: TokenRowProps) => {
  const navigate = useNavigate();
  const { market } = token;
  const isPositive = market.priceChangePercent24h >= 0;

  const handleClick = () => {
    navigate(`/trade/${token.id}`);
  };

  return (
    <div
      className={styles.row}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
    >
      <div className={styles.left}>
        {rank !== undefined && <span className={styles.rank}>{rank}</span>}
        <img
          src={token.logoUrl}
          alt={token.symbol}
          className={styles.logo}
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`;
          }}
        />
        <div className={styles.info}>
          <span className={styles.symbol}>{token.symbol}</span>
          <span className={styles.name}>{token.name}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.priceInfo}>
          <span className={styles.price}>{formatPrice(market.price)}</span>
          <span className={clsx(styles.change, isPositive ? styles.positive : styles.negative)}>
            {formatPercent(market.priceChangePercent24h)}
          </span>
        </div>
        {showVolume && (
          <span className={styles.volume}>Vol: {formatCompact(market.volume24h)}</span>
        )}
      </div>
    </div>
  );
};
