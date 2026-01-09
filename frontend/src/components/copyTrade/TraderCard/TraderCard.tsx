import clsx from 'clsx';
import { BadgeCheck, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button/Button';
import { formatPercent, formatCompact, formatDuration } from '@/utils/format';

import styles from './TraderCard.module.scss';

import type { Trader } from '@/types';


interface TraderCardProps {
  readonly trader: Trader;
  readonly onFollow?: (traderId: string) => void;
}

export const TraderCard = ({ trader }: TraderCardProps) => {
  const navigate = useNavigate();
  const isPnl7dPositive = trader.pnlPercent7d >= 0;
  const isPnl30dPositive = trader.pnlPercent30d >= 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/copy-trade/${trader.id}`);
  };

  const handleCopyTradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TraderCard] Copy Trade clicked for trader:', trader.id);
    navigate(`/copy-trade/${trader.id}?action=copy`);
  };

  return (
    <div
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === 'Enter' && !(e.target as HTMLElement).closest('button')) {
          navigate(`/copy-trade/${trader.id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <img
          src={trader.avatarUrl}
          alt={trader.displayName}
          className={styles.avatar}
          onError={e => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${trader.id}`;
          }}
        />
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{trader.displayName}</span>
            {trader.isVerified && <BadgeCheck size={16} className={styles.verified} />}
          </div>
          <span className={styles.address}>{trader.address}</span>
        </div>
      </div>

      <div className={styles.tags}>
        {trader.tags.slice(0, 3).map(tag => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>7d PnL</span>
          <span
            className={clsx(styles.statValue, isPnl7dPositive ? styles.positive : styles.negative)}
          >
            {formatPercent(trader.pnlPercent7d)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>30d PnL</span>
          <span
            className={clsx(styles.statValue, isPnl30dPositive ? styles.positive : styles.negative)}
          >
            {formatPercent(trader.pnlPercent30d)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Win Rate</span>
          <span className={styles.statValue}>{trader.winRate.toFixed(1)}%</span>
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <Users size={14} />
          <span>{formatCompact(trader.followers)}</span>
        </div>
        <div className={styles.metaItem}>
          <TrendingUp size={14} />
          <span>{trader.totalTrades} trades</span>
        </div>
        <div className={styles.metaItem}>
          <span>Avg: {formatDuration(trader.avgHoldTime)}</span>
        </div>
      </div>

      <Button variant="primary" size="sm" fullWidth onClick={handleCopyTradeClick}>
        Copy Trade
      </Button>
    </div>
  );
};
