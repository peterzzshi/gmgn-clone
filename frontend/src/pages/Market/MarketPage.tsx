import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import { TokenRow } from '@/components/market/TokenRow/TokenRow';
import { useMarketStore } from '@/store/marketStore';

import styles from './MarketPage.module.scss';

type SortField = 'marketCap' | 'volume24h' | 'priceChangePercent24h';

const SORT_OPTIONS: readonly { value: SortField; label: string }[] = [
  { value: 'marketCap', label: 'Market Cap' },
  { value: 'volume24h', label: 'Volume' },
  { value: 'priceChangePercent24h', label: '24h Change' },
] as const;

export const MarketPage = () => {
  const { tokens, isLoading, fetchTokens } = useMarketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('marketCap');

  useEffect(() => {
    if (Array.isArray(tokens) && tokens.length === 0) {
      fetchTokens();
    }
  }, [tokens, fetchTokens]);

  // Safely handle tokens array
  const safeTokens = Array.isArray(tokens) ? tokens : [];

  // Filter and sort tokens (pure functions)
  const filterByQuery = (query: string) => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return safeTokens;
    return safeTokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(normalized) ||
        t.name.toLowerCase().includes(normalized),
    );
  };

  const sortTokens = (field: SortField) => (items: typeof safeTokens) => {
    return [...items].sort((a, b) => b.market[field] - a.market[field]);
  };

  const displayedTokens = sortTokens(sortBy)(filterByQuery(searchQuery));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Market</h1>
        <p className={styles.subtitle}>{safeTokens.length} tokens</p>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />

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
      </div>

      <Card padding="none">
        {isLoading ? (
          <div className={styles.loading}>Loading tokens...</div>
        ) : displayedTokens.length === 0 ? (
          <div className={styles.empty}>No tokens found</div>
        ) : (
          <div className={styles.tokenList}>
            {displayedTokens.map((token, index) => (
              <TokenRow
                key={token.id}
                token={token}
                rank={index + 1}
                showVolume
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
