import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  ShieldCheck,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { CopySettingsModal } from '@/components/copyTrade/CopySettingsModal/CopySettingsModal';
import { traderService } from '@/services/traderService';
import { useCopyTradeStore, selectIsFollowingTrader } from '@/store/copyTradeStore';
import { useAuthStore } from '@/store/authStore';
import {
  formatPercent,
  formatCompact,
  formatCompactUSD,
  formatDuration,
  formatAddress,
} from '@/utils/format';

import styles from './TraderDetailPage.module.scss';

import type { Trader } from '@/types';
import {toast} from "@/components/ui/Toast/Toast";

// Mock recent trades data (would come from API in production)
interface RecentTrade {
  readonly id: string;
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly side: 'buy' | 'sell';
  readonly amount: number;
  readonly price: number;
  readonly pnl: number;
  readonly pnlPercent: number;
  readonly timestamp: string;
}

const generateMockRecentTrades = (traderId: string): readonly RecentTrade[] => [
  {
    id: `${traderId}-trade-1`,
    tokenSymbol: 'WIF',
    tokenName: 'dogwifhat',
    side: 'buy',
    amount: 1250,
    price: 2.45,
    pnl: 312.5,
    pnlPercent: 10.2,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${traderId}-trade-2`,
    tokenSymbol: 'BONK',
    tokenName: 'Bonk',
    side: 'sell',
    amount: 15000000,
    price: 0.00002834,
    pnl: -42.5,
    pnlPercent: -2.8,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${traderId}-trade-3`,
    tokenSymbol: 'JUP',
    tokenName: 'Jupiter',
    side: 'buy',
    amount: 500,
    price: 0.92,
    pnl: 85.0,
    pnlPercent: 18.5,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${traderId}-trade-4`,
    tokenSymbol: 'POPCAT',
    tokenName: 'Popcat',
    side: 'buy',
    amount: 2000,
    price: 0.78,
    pnl: 156.0,
    pnlPercent: 10.0,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Pure function to format relative time
const getRelativeTime = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const TraderDetailPage = () => {
  const { traderId } = useParams<{ traderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [trader, setTrader] = useState<Trader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentTrades] = useState<readonly RecentTrade[]>(() =>
    traderId ? generateMockRecentTrades(traderId) : [],
  );

  const { followedTraders } = useCopyTradeStore();
  const isFollowing = traderId
    ? selectIsFollowingTrader(followedTraders, traderId)
    : false;

  useEffect(() => {
    if (!traderId) {
      setError('Trader ID is required');
      setIsLoading(false);
      return;
    }

    const fetchTrader = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await traderService.getTraderById(traderId);
        setTrader(data);
      } catch {
        setError('Failed to load trader details');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrader();
  }, [traderId]);

  const handleCopyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleBack = () => {
    navigate('/copy-trade');
  };

  const handleCopyAddress = async () => {
    if (trader?.address) {
      await navigator.clipboard.writeText(trader.address);
      toast.success('Address copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading trader details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Card className={styles.errorCard}>
            <p className={styles.errorText}>{error ?? 'Trader not found'}</p>
            <Button variant="outline" onClick={handleBack}>
              Back to Traders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isPnl7dPositive = trader.pnlPercent7d >= 0;
  const isPnl30dPositive = trader.pnlPercent30d >= 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back Button */}
        <button type="button" className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>Back to Traders</span>
        </button>

        {/* Profile Header */}
        <Card className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <img
                src={trader.avatarUrl}
                alt={trader.displayName}
                className={styles.avatar}
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${trader.id}`;
                }}
              />
              {trader.isVerified && (
                <div className={styles.verifiedBadge}>
                  <BadgeCheck size={16} />
                </div>
              )}
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{trader.displayName}</h1>
                {trader.isVerified && (
                  <span className={styles.verifiedLabel}>Verified</span>
                )}
              </div>

              <div className={styles.addressRow}>
                <span className={styles.address}>{formatAddress(trader.address, 6, 4)}</span>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={handleCopyAddress}
                  aria-label="Copy address"
                >
                  <Copy size={14} />
                </button>
                <a
                  href={`https://solscan.io/account/${trader.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.explorerLink}
                  aria-label="View on explorer"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {trader.bio && <p className={styles.bio}>{trader.bio}</p>}

              <div className={styles.tags}>
                {trader.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.ctaSection}>
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="lg"
                onClick={handleCopyClick}
                className={styles.ctaButton}
              >
                {isFollowing ? 'Manage Copy' : 'Copy This Trader'}
              </Button>
              <span className={styles.followersCount}>
                <Users size={16} />
                {formatCompact(trader.followers)} followers
              </span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>
              {isPnl7dPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>7D PnL</span>
              <span className={clsx(styles.statValue, isPnl7dPositive ? styles.positive : styles.negative)}>
                {formatPercent(trader.pnlPercent7d)}
              </span>
              <span className={clsx(styles.statSubValue, isPnl7dPositive ? styles.positive : styles.negative)}>
                {formatCompactUSD(trader.pnl7d)}
              </span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon}>
              {isPnl30dPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>30D PnL</span>
              <span className={clsx(styles.statValue, isPnl30dPositive ? styles.positive : styles.negative)}>
                {formatPercent(trader.pnlPercent30d)}
              </span>
              <span className={clsx(styles.statSubValue, isPnl30dPositive ? styles.positive : styles.negative)}>
                {formatCompactUSD(trader.pnl30d)}
              </span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon}>
              <Target size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Win Rate</span>
              <span className={styles.statValue}>{trader.winRate.toFixed(1)}%</span>
              <span className={styles.statSubValue}>
                {trader.totalTrades} total trades
              </span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Avg Hold Time</span>
              <span className={styles.statValue}>{formatDuration(trader.avgHoldTime)}</span>
              <span className={styles.statSubValue}>per position</span>
            </div>
          </Card>
        </div>

        {/* Risk Notice */}
        <Card className={styles.riskCard}>
          <div className={styles.riskIcon}>
            <ShieldCheck size={20} />
          </div>
          <div className={styles.riskContent}>
            <h4 className={styles.riskTitle}>Risk Notice</h4>
            <p className={styles.riskText}>
              Past performance does not guarantee future results. Copy trading involves risk of loss.
              Only invest what you can afford to lose. Always do your own research.
            </p>
          </div>
        </Card>

        {/* Recent Trades */}
        <Card className={styles.tradesCard}>
          <h3 className={styles.sectionTitle}>Recent Trades</h3>
          <div className={styles.tradesList}>
            {recentTrades.map((trade) => {
              const isPnlPositive = trade.pnl >= 0;
              return (
                <div key={trade.id} className={styles.tradeRow}>
                  <div className={styles.tradeLeft}>
                    <span className={clsx(styles.tradeSide, styles[trade.side])}>
                      {trade.side.toUpperCase()}
                    </span>
                    <div className={styles.tradeToken}>
                      <span className={styles.tokenSymbol}>{trade.tokenSymbol}</span>
                      <span className={styles.tokenName}>{trade.tokenName}</span>
                    </div>
                  </div>
                  <div className={styles.tradeCenter}>
                    <span className={styles.tradeAmount}>
                      {formatCompact(trade.amount)} @ ${trade.price < 0.01 ? trade.price.toFixed(8) : trade.price.toFixed(2)}
                    </span>
                    <span className={styles.tradeTime}>{getRelativeTime(trade.timestamp)}</span>
                  </div>
                  <div className={clsx(styles.tradeRight, isPnlPositive ? styles.positive : styles.negative)}>
                    <span className={styles.tradePnl}>
                      {isPnlPositive ? '+' : ''}{formatCompactUSD(trade.pnl)}
                    </span>
                    <span className={styles.tradePnlPercent}>
                      {formatPercent(trade.pnlPercent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Copy Settings Modal */}
      {trader && (
        <CopySettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trader={trader}
          isEditing={isFollowing}
        />
      )}
    </div>
  );
};
