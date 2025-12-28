import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useEffect } from 'react';

import styles from './WalletPage.module.scss';

import { Card } from '@/components/ui/Card/Card';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore, selectTotalPortfolioValue } from '@/store/walletStore';
import { formatPrice, formatPercent, formatCompact } from '@/utils/format';

export const WalletPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { balance, assets, transactions, isLoading, fetchWallet, fetchTransactions } =
    useWalletStore();

  // Calculate total portfolio value
  const totalValue = selectTotalPortfolioValue(useWalletStore.getState());

  useEffect(() => {
    if (!isAuthenticated) return;

    void fetchWallet();
    void fetchTransactions();
  }, [isAuthenticated, fetchWallet, fetchTransactions]);

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

  if (isLoading && assets.length === 0) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.loading}>Loading wallet data...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Balance Overview */}
      <Card className={styles.balanceCard}>
        <span className={styles.balanceLabel}>Available Balance</span>
        <h1 className={styles.totalBalance}>{formatPrice(balance)}</h1>
        <span className={styles.portfolioValue}>Total Portfolio: {formatPrice(totalValue)}</span>
      </Card>

      {/* Assets */}
      <Card>
        <h2 className={styles.sectionTitle}>Assets</h2>
        {assets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No assets yet. Start trading to build your portfolio!</p>
          </div>
        ) : (
          <div className={styles.assetsList}>
            {assets.map((asset) => {
              const isPositive = asset.change24h >= 0;
              return (
                <div key={asset.symbol} className={styles.assetRow}>
                  <div className={styles.assetLeft}>
                    <img
                      src={asset.logoUrl}
                      alt={asset.symbol}
                      className={styles.assetLogo}
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${asset.symbol}`;
                      }}
                    />
                    <div className={styles.assetInfo}>
                      <span className={styles.assetSymbol}>{asset.symbol}</span>
                      <span className={styles.assetAmount}>
                        {formatCompact(asset.amount)} {asset.symbol}
                      </span>
                    </div>
                  </div>
                  <div className={styles.assetRight}>
                    <span className={styles.assetValue}>{formatPrice(asset.valueUsd)}</span>
                    <span
                      className={clsx(
                        styles.assetChange,
                        isPositive ? styles.positive : styles.negative,
                      )}
                    >
                      {formatPercent(asset.change24h)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className={styles.transactionsList}>
            {transactions.slice(0, 10).map((tx) => {
              const isIncoming = tx.type === 'receive';
              const Icon = isIncoming ? ArrowDownRight : ArrowUpRight;
              const iconColor = isIncoming ? 'var(--color-success)' : 'var(--color-danger)';

              return (
                <div key={tx.id} className={styles.txRow}>
                  <div className={styles.txLeft}>
                    <div className={styles.txIcon} style={{ color: iconColor }}>
                      <Icon size={20} />
                    </div>
                    <div className={styles.txInfo}>
                      <span className={styles.txType}>{isIncoming ? 'Bought' : 'Sold'}</span>
                      <span className={styles.txSymbol}>{tx.tokenSymbol}</span>
                    </div>
                  </div>
                  <div className={styles.txRight}>
                    <span
                      className={clsx(
                        styles.txAmount,
                        isIncoming ? styles.positive : styles.negative,
                      )}
                    >
                      {isIncoming ? '+' : '-'}
                      {formatCompact(tx.amount)} {tx.tokenSymbol}
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
        )}
      </Card>
    </div>
  );
};
