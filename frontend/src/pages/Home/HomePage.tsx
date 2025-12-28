import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Copy, BarChart3, Wallet } from 'lucide-react';

import { Card } from '@/components/ui/Card/Card';
import { TokenRow } from '@/components/market/TokenRow/TokenRow';
import { useMarketStore } from '@/store/marketStore';

import styles from './HomePage.module.scss';

import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  readonly to: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly color: string;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  { to: '/trade', icon: TrendingUp, label: 'Trade', color: '#00d4aa' },
  { to: '/copy-trade', icon: Copy, label: 'Copy Trade', color: '#ffa502' },
  { to: '/market', icon: BarChart3, label: 'Market', color: '#3b82f6' },
  { to: '/wallet', icon: Wallet, label: 'Wallet', color: '#8b5cf6' },
] as const;

export const HomePage = () => {
  const { tokens, isLoading, fetchTokens } = useMarketStore();

  useEffect(() => {
    if (tokens.length === 0 && !isLoading) {
      void fetchTokens();
    }
  }, [tokens.length, isLoading, fetchTokens]);

  // Safely handle tokens - ensure it's always an array
  const safeTokens = Array.isArray(tokens) ? tokens : [];

  const trendingTokens = [...safeTokens]
    .sort((a, b) => b.market.priceChangePercent24h - a.market.priceChangePercent24h)
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Trade Smarter with <span className={styles.highlight}>GMGN.AI</span>
        </h1>
        <p className={styles.subtitle}>
          Your gateway to DeFi trading on Solana
        </p>
      </section>

      <section className={styles.quickActions}>
        {QUICK_ACTIONS.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ backgroundColor: `${color}20` }}>
              <Icon size={24} style={{ color }} />
            </div>
            <span className={styles.actionLabel}>{label}</span>
          </Link>
        ))}
      </section>

      <section className={styles.section}>
        <Card>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 Trending</h2>
            <Link to="/market" className={styles.viewAll}>View All</Link>
          </div>
          <div className={styles.tokenList}>
            {isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              trendingTokens.map((token, index) => (
                <TokenRow key={token.id} token={token} rank={index + 1} />
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};
