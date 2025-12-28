import { useState, useEffect, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import { TraderCard } from '@/components/copyTrade/TraderCard/TraderCard';
import { traderService } from '@/services/traderService';
import type { Trader } from '@/types';

import styles from './CopyTradePage.module.scss';

type SortOption = 'pnl7d' | 'pnl30d' | 'followers' | 'winRate';

const SORT_OPTIONS: readonly { value: SortOption; label: string }[] = [
  { value: 'pnl7d', label: '7d PnL' },
  { value: 'pnl30d', label: '30d PnL' },
  { value: 'followers', label: 'Followers' },
  { value: 'winRate', label: 'Win Rate' },
] as const;

// Sort traders by field
const sortTraders = (traders: readonly Trader[], sortBy: SortOption): Trader[] => {
  const fieldMap: Record<SortOption, keyof Trader> = {
    pnl7d: 'pnlPercent7d',
    pnl30d: 'pnlPercent30d',
    followers: 'followers',
    winRate: 'winRate',
  };

  const field = fieldMap[sortBy];
  return [...traders].sort((a, b) => (b[field] as number) - (a[field] as number));
};

export const CopyTradePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pnl7d');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [traders, setTraders] = useState<readonly Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setIsLoading(true);
        const data = await traderService.getAllTraders();
        setTraders(data);
      } catch (error) {
        console.error('Failed to fetch traders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTraders();
  }, []);

  // Apply filters and sorting using useMemo
  const filteredTraders = useMemo(() => {
    // Safely handle traders array
    const safeTraders = Array.isArray(traders) ? traders : [];
    let result = [...safeTraders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (trader) =>
          trader.displayName.toLowerCase().includes(query) ||
          trader.address.toLowerCase().includes(query)
      );
    }

    // Verified filter
    if (verifiedOnly) {
      result = result.filter((trader) => trader.isVerified);
    }

    // Sort
    return sortTraders(result, sortBy);
  }, [traders, searchQuery, verifiedOnly, sortBy]);


  const handleFollow = (traderId: string) => {
    console.log('[CopyTrade] Follow trader:', traderId);
    // TODO: Implement follow functionality
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Copy Trade</h1>
        </div>
        <Card>
          <div className={styles.loading}>Loading traders...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Copy Trade</h1>
        <p className={styles.subtitle}>Follow top traders and copy their trades automatically</p>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Search traders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />

        <div className={styles.filterRow}>
          <div className={styles.sortButtons}>
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.sortBtn} ${sortBy === value ? styles.active : ''}`}
                onClick={() => setSortBy(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.filterBtn} ${verifiedOnly ? styles.active : ''}`}
            onClick={() => setVerifiedOnly(!verifiedOnly)}
          >
            <Filter size={16} />
            Verified
          </button>
        </div>
      </div>

      <div className={styles.traderCount}>
        {filteredTraders.length} traders
      </div>

      {filteredTraders.length === 0 ? (
        <Card>
          <div className={styles.empty}>No traders found</div>
        </Card>
      ) : (
        <div className={styles.traderGrid}>
          {filteredTraders.map((trader) => (
            <TraderCard
              key={trader.id}
              trader={trader}
              onFollow={handleFollow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
