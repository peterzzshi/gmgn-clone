import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';


import { TokenRow } from '@/components/market/TokenRow/TokenRow';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { useMarketStore } from '@/store/marketStore';
import { useRealtimePriceStore } from '@/store/realtimePriceStore';

import styles from './MarketPage.module.scss';

type SortField = 'marketCap' | 'volume24h' | 'priceChangePercent24h';

const SORT_OPTIONS: readonly { value: SortField; label: string }[] = [
  { value: 'marketCap', label: 'Market Cap' },
  { value: 'volume24h', label: 'Volume' },
  { value: 'priceChangePercent24h', label: '24h Change' },
] as const;

export const MarketPage = () => {
  const { tokens, isLoading, fetchTokens, getTokensWithRealtimePrices } = useMarketStore();
  const { realtimePrices } = useRealtimePriceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('marketCap');

  useEffect(() => {
    if (Array.isArray(tokens) && tokens.length === 0) {
      void fetchTokens();
    }
  }, [tokens, fetchTokens]);

  // Get tokens merged with real-time prices
  const tokensWithRealtimePrices = getTokensWithRealtimePrices();

  const filterByQuery = (query: string) => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {return tokensWithRealtimePrices;}
    return tokensWithRealtimePrices.filter(
      t =>
        t.symbol.toLowerCase().includes(normalized) || t.name.toLowerCase().includes(normalized),
    );
  };

  const sortTokens = (field: SortField) => (items: typeof tokensWithRealtimePrices) => {
    return [...items].sort((a, b) => b.market[field] - a.market[field]);
  };

  const displayedTokens = sortTokens(sortBy)(filterByQuery(searchQuery));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Market</h1>
        <p className={styles.subtitle}>
          {tokensWithRealtimePrices.length} tokens
          {realtimePrices.size > 0 && (
            <span className={styles.liveIndicator}> • {realtimePrices.size} live</span>
          )}
        </p>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />

        <div className={styles.sortButtons}>
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.sortBtn ?? ''} ${sortBy === value ? styles.active ?? '' : ''}`}
              onClick={() => setSortBy(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        {isLoading && <div className={styles.loading}>Loading tokens...</div>}
        {!isLoading && displayedTokens.length === 0 && (
          <div className={styles.empty}>No tokens found</div>
        )}
        {!isLoading && displayedTokens.length > 0 && (
          <div className={styles.tokenList}>
            {displayedTokens.map((token, index) => (
              <TokenRow key={token.id} token={token} rank={index + 1} showVolume />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
