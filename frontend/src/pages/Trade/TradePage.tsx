import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { TradingChart } from '@/components/trading/TradingChart/TradingChart';
import { toast } from '@/components/ui/Toast/Toast';
import { useMarketStore } from '@/store/marketStore';
import { useTradingStore } from '@/store/tradingStore';
import { formatPrice, formatPercent, formatCompact, formatCompactUSD } from '@/utils/format';

import styles from './TradePage.module.scss';

import type { OrderSide, TimeFrame } from '@/types';

const TIME_FRAMES: readonly TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

const QUICK_AMOUNTS = [25, 50, 75, 100] as const;

export const TradePage = () => {
  const { tokenId = 'sol' } = useParams<{ tokenId?: string }>();
  const { tokens, selectedToken, selectToken, fetchTokens } = useMarketStore();
  const { placeOrder, isLoading: isPlacing } = useTradingStore();

  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [amount, setAmount] = useState('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');

  useEffect(() => {
    if (Array.isArray(tokens) && tokens.length === 0) {
      void fetchTokens();
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

    try {
      await placeOrder({
        tokenId: token.id,
        side: orderSide,
        type: 'market',
        amount: parseFloat(amount),
      });
      setAmount('');
      toast.success(`${orderSide === 'buy' ? 'Bought' : 'Sold'} ${amount} ${token.symbol}`);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  const calculateTotal = (): number => {
    if (!token || !amount) return 0;
    return parseFloat(amount) * token.market.price;
  };

  const handleQuickAmount = (percentage: number) => {
    const mockBalance = 100;
    const quickAmount = (mockBalance * percentage) / 100;
    setAmount(quickAmount.toString());
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Card className={styles.loadingCard}>
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Loading token data...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isPositive = token.market.priceChangePercent24h >= 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Token Header - Full Width */}
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
            <div className={styles.tokenDetails}>
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

        {/* Main Grid: Chart + Order Form */}
        <div className={styles.mainGrid}>
          {/* Chart Section */}
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

          {/* Order Form Section */}
          <Card className={styles.orderCard}>
            <h3 className={styles.orderTitle}>Place Order</h3>

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
                {QUICK_AMOUNTS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => handleQuickAmount(pct)}
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
                  <span className={styles.summaryTotal}>{formatCompactUSD(calculateTotal())}</span>
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

              <p className={styles.disclaimer}>
                Market orders execute at the best available price. Slippage may occur.
              </p>
            </form>
          </Card>
        </div>

        {/* Market Stats - Full Width */}
        <Card className={styles.statsCard}>
          <h3 className={styles.statsTitle}>Market Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Market Cap</span>
              <span className={styles.statValue}>{formatCompactUSD(token.market.marketCap)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>24h Volume</span>
              <span className={styles.statValue}>{formatCompactUSD(token.market.volume24h)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Liquidity</span>
              <span className={styles.statValue}>{formatCompactUSD(token.market.liquidity)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Holders</span>
              <span className={styles.statValue}>{formatCompact(token.market.holders)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
