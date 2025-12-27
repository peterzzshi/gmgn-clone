import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { TradingChart } from '@/components/trading/TradingChart/TradingChart';
import { useMarketStore } from '@/store/marketStore';
import { useTradingStore } from '@/store/tradingStore';
import { formatPrice, formatPercent, formatCompact } from '@/utils/format';

import styles from './TradePage.module.scss';

import type { OrderSide, TimeFrame } from '@/types';

const TIME_FRAMES: readonly TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

export const TradePage = () => {
  const { tokenId = 'sol' } = useParams<{ tokenId?: string }>();
  const { tokens, selectedToken, selectToken, fetchTokens } = useMarketStore();
  const { placeOrder, isLoading: isPlacing } = useTradingStore();

  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [amount, setAmount] = useState('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');

  useEffect(() => {
    if (Array.isArray(tokens) && tokens.length === 0) {
      fetchTokens();
    }
  }, [tokens, fetchTokens]);

  useEffect(() => {
    if (tokenId) {
      selectToken(tokenId);
    }
  }, [tokenId, selectToken]);

  // Safely handle tokens array
  const safeTokens = Array.isArray(tokens) ? tokens : [];
  const token = selectedToken ?? safeTokens.find((t) => t.id === tokenId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !amount) return;

    await placeOrder({
      tokenId: token.id,
      side: orderSide,
      type: 'market',
      amount: parseFloat(amount),
    });

    setAmount('');
  };

  const calculateTotal = (): number => {
    if (!token || !amount) return 0;
    return parseFloat(amount) * token.market.price;
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading token data...</div>
      </div>
    );
  }

  const isPositive = token.market.priceChangePercent24h >= 0;

  return (
    <div className={styles.page}>
      {/* Token Header */}
      <div className={styles.tokenHeader}>
        <div className={styles.tokenInfo}>
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className={styles.tokenLogo}
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`;
            }}
          />
          <div>
            <h1 className={styles.tokenSymbol}>{token.symbol}</h1>
            <span className={styles.tokenName}>{token.name}</span>
          </div>
        </div>
        <div className={styles.priceInfo}>
          <span className={styles.price}>{formatPrice(token.market.price)}</span>
          <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
            {formatPercent(token.market.priceChangePercent24h)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <Card padding="none" className={styles.chartCard}>
        <div className={styles.timeFrames}>
          {TIME_FRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              className={`${styles.tfBtn} ${timeFrame === tf ? styles.active : ''}`}
              onClick={() => setTimeFrame(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className={styles.chartContainer}>
          <TradingChart tokenId={token.id} timeFrame={timeFrame} />
        </div>
      </Card>

      {/* Order Form */}
      <Card className={styles.orderCard}>
        <div className={styles.sideToggle}>
          <button
            type="button"
            className={`${styles.sideBtn} ${styles.buyBtn} ${orderSide === 'buy' ? styles.active : ''}`}
            onClick={() => setOrderSide('buy')}
          >
            Buy
          </button>
          <button
            type="button"
            className={`${styles.sideBtn} ${styles.sellBtn} ${orderSide === 'sell' ? styles.active : ''}`}
            onClick={() => setOrderSide('sell')}
          >
            Sell
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            rightIcon={<span className={styles.inputSuffix}>{token.symbol}</span>}
          />

          <div className={styles.quickAmounts}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                className={styles.quickBtn}
                onClick={() => setAmount((100 * pct / 100).toString())}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Price</span>
              <span>{formatPrice(token.market.price)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant={orderSide === 'buy' ? 'primary' : 'danger'}
            size="lg"
            fullWidth
            isLoading={isPlacing}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {orderSide === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
          </Button>
        </form>
      </Card>

      {/* Market Stats */}
      <Card>
        <h3 className={styles.statsTitle}>Market Stats</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Market Cap</span>
            <span className={styles.statValue}>{formatCompact(token.market.marketCap)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>24h Volume</span>
            <span className={styles.statValue}>{formatCompact(token.market.volume24h)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Liquidity</span>
            <span className={styles.statValue}>{formatCompact(token.market.liquidity)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Holders</span>
            <span className={styles.statValue}>{formatCompact(token.market.holders)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
