import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import clsx from 'clsx';

import { Card } from '@/components/ui/Card/Card';
import { formatPrice, formatPercent, formatCompact } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { walletService } from '@/services/walletService';
import type { WalletSummary, Transaction } from '@/types';

import styles from './WalletPage.module.scss';

export const WalletPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<readonly Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        const [summary, transactions] = await Promise.all([
          walletService.getWalletSummary(),
          walletService.getTransactions(5),
        ]);
        setWalletSummary(summary);
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchWalletData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.notConnected}>
            <h2>Connect Wallet</h2>
            <p>Please log in to view your wallet</p>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading || !walletSummary) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.loading}>Loading wallet data...</div>
        </Card>
      </div>
    );
  }

  const isPositivePnl = walletSummary.totalPnlPercent24h >= 0;

  return (
    <div className={styles.page}>
      {/* Balance Overview */}
      <Card className={styles.balanceCard}>
        <span className={styles.balanceLabel}>Total Balance</span>
        <h1 className={styles.totalBalance}>
          {formatPrice(walletSummary.totalBalanceUsd)}
        </h1>
        <span className={clsx(styles.pnl, isPositivePnl ? styles.positive : styles.negative)}>
          {isPositivePnl ? '+' : ''}{formatPrice(walletSummary.totalPnl24h)} ({formatPercent(walletSummary.totalPnlPercent24h)})
        </span>
      </Card>

      {/* Assets */}
      <Card>
        <h2 className={styles.sectionTitle}>Assets</h2>
        <div className={styles.assetsList}>
          {walletSummary.balances.map((balance) => {
            const isPositive = balance.priceChange24h >= 0;
            return (
              <div key={balance.tokenId} className={styles.assetRow}>
                <div className={styles.assetLeft}>
                  <img
                    src={balance.logoUrl}
                    alt={balance.symbol}
                    className={styles.assetLogo}
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${balance.symbol}`;
                    }}
                  />
                  <div className={styles.assetInfo}>
                    <span className={styles.assetSymbol}>{balance.symbol}</span>
                    <span className={styles.assetAmount}>
                      {formatCompact(balance.balance)} {balance.symbol}
                    </span>
                  </div>
                </div>
                <div className={styles.assetRight}>
                  <span className={styles.assetValue}>{formatPrice(balance.balanceUsd)}</span>
                  <span className={clsx(styles.assetChange, isPositive ? styles.positive : styles.negative)}>
                    {formatPercent(balance.priceChange24h)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        <div className={styles.transactionsList}>
          {recentTransactions.map((tx) => {
            const isIncoming = tx.amount > 0;
            const Icon = isIncoming ? ArrowDownRight : ArrowUpRight;
            const iconColor = isIncoming ? 'var(--color-success)' : 'var(--color-danger)';

            return (
              <div key={tx.id} className={styles.txRow}>
                <div className={styles.txLeft}>
                  <div className={styles.txIcon} style={{ color: iconColor }}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.txInfo}>
                    <span className={styles.txType}>{tx.type}</span>
                    <span className={styles.txSymbol}>{tx.symbol}</span>
                  </div>
                </div>
                <div className={styles.txRight}>
                  <span className={clsx(styles.txAmount, isIncoming ? styles.positive : styles.negative)}>
                    {isIncoming ? '+' : ''}{formatCompact(tx.amount)} {tx.symbol}
                  </span>
                  <span className={styles.txStatus}>
                    {tx.status === 'pending' && <Clock size={12} />}
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
