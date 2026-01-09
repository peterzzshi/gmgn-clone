import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';



import { TradingChart } from '@/components/trading/TradingChart/TradingChart';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { toast } from '@/components/ui/Toast/toastStore';
import { useAuthStore } from '@/store/authStore';
import { useMarketStore } from '@/store/marketStore';
import { useTradingStore } from '@/store/tradingStore';
import { useWalletStore } from '@/store/walletStore';
import { formatPrice, formatPercent, formatCompact, formatCompactUSD } from '@/utils/format';

import styles from './TradePage.module.scss';

import type { OrderSide, TimeFrame } from '@/types';

const TIME_FRAMES: readonly TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

const QUICK_AMOUNTS = [25, 50, 75, 100] as const;

export const TradePage = () => {
  const { tokenId = 'sol' } = useParams<{ tokenId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    tokens,
    selectedToken,
    selectToken,
    fetchTokens,
    getSelectedTokenWithRealtimePrice,
  } = useMarketStore();
  const { placeOrder, isLoading: isPlacing } = useTradingStore();
  const { isAuthenticated } = useAuthStore();
  const { balance, fetchWallet, getTokenBalance } = useWalletStore();


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

  // Fetch wallet balance if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void fetchWallet();
    }
  }, [isAuthenticated, fetchWallet]);

  const baseToken = selectedToken ?? tokens.find(t => t.id === tokenId);
  const token = baseToken ? (getSelectedTokenWithRealtimePrice() ?? baseToken) : undefined;

  const tokenBalance = useMemo(() => {
    if (!token) {return 0;}
    return getTokenBalance(token.symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.symbol]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please log in to place orders');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!token || !amount) {
      return;
    }

    const currentToken = token;
    const total = parseFloat(amount) * currentToken.market.price;

    if (orderSide === 'buy' && total > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (orderSide === 'sell' && parseFloat(amount) > tokenBalance) {
      toast.error(`Insufficient ${currentToken.symbol} balance`);
      return;
    }

    try {
      await placeOrder({
        tokenId: currentToken.id,
        side: orderSide,
        type: 'market',
        amount: parseFloat(amount),
      });
      setAmount('');
      toast.success(`${orderSide === 'buy' ? 'Bought' : 'Sold'} ${amount} ${currentToken.symbol}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place order';
      toast.error(message);
    }
  };

  const calculateTotal = (): number => {
    if (!token || !amount) {return 0;}
    return parseFloat(amount) * token.market.price;
  };

  const handleQuickAmount = (percentage: number) => {
    if (!token) {return;}

    if (orderSide === 'buy') {
      const maxAmount = balance / token.market.price;
      const quickAmount = (maxAmount * percentage) / 100;
      setAmount(quickAmount.toFixed(4));
    } else {
      const quickAmount = (tokenBalance * percentage) / 100;
      setAmount(quickAmount.toString());
    }
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

  const currentToken = token;
  const isPositive = currentToken.market.priceChangePercent24h >= 0;
  const total = calculateTotal();
  const insufficientBalance =
    isAuthenticated &&
    ((orderSide === 'buy' && total > balance) ||
      (orderSide === 'sell' && parseFloat(amount || '0') > tokenBalance));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Token Header */}
        <div className={styles.tokenHeader}>
          <div className={styles.tokenInfo}>
            <img
              src={currentToken.logoUrl}
              alt={currentToken.symbol}
              className={styles.tokenLogo}
              onError={e => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${currentToken.symbol}`;
              }}
            />
            <div className={styles.tokenDetails}>
              <h1 className={styles.tokenSymbol}>{currentToken.symbol}</h1>
              <span className={styles.tokenName}>{currentToken.name}</span>
            </div>
          </div>
          <div className={styles.priceInfo}>
            <span className={styles.price}>{formatPrice(currentToken.market.price)}</span>
            <span className={`${styles.change ?? ''} ${isPositive ? styles.positive ?? '' : styles.negative ?? ''}`}>
              {formatPercent(currentToken.market.priceChangePercent24h)}
            </span>
          </div>
        </div>

        {/* Main Grid: Chart + Order Form */}
        <div className={styles.mainGrid}>
          {/* Chart Section */}
          <Card padding="none" className={styles.chartCard}>
            <div className={styles.timeFrames}>
              {TIME_FRAMES.map(tf => (
                <button
                  key={tf}
                  type="button"
                  className={`${styles.tfBtn ?? ''} ${timeFrame === tf ? styles.active ?? '' : ''}`}
                  onClick={() => setTimeFrame(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className={styles.chartContainer}>
              <TradingChart tokenId={currentToken.id} timeFrame={timeFrame} />
            </div>
          </Card>

          {/* Order Form Section */}
          <Card className={styles.orderCard}>
            <h3 className={styles.orderTitle}>Place Order</h3>

            <div className={styles.sideToggle}>
              <button
                type="button"
                className={`${styles.sideBtn ?? ''} ${styles.buyBtn ?? ''} ${orderSide === 'buy' ? styles.active ?? '' : ''}`}
                onClick={() => setOrderSide('buy')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`${styles.sideBtn ?? ''} ${styles.sellBtn ?? ''} ${orderSide === 'sell' ? styles.active ?? '' : ''}`}
                onClick={() => setOrderSide('sell')}
              >
                Sell
              </button>
            </div>

            <form onSubmit={e => { void handleSubmit(e); }} className={styles.form}>
              {isAuthenticated && (
                <div className={styles.balanceInfo}>
                  <span>Available:</span>
                  <span>
                    {orderSide === 'buy'
                      ? formatCompactUSD(balance)
                      : `${tokenBalance.toFixed(4)} ${currentToken.symbol}`}
                  </span>
                </div>
              )}

              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                rightIcon={<span className={styles.inputSuffix}>{currentToken.symbol}</span>}
                {...(insufficientBalance && { error: 'Insufficient balance' })}
              />

              <div className={styles.quickAmountsSection}>
                <span className={styles.quickLabel}>Quick Select (% of available):</span>
                <div className={styles.quickAmounts}>
                  {QUICK_AMOUNTS.map(pct => (
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
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Price</span>
                  <span>{formatPrice(currentToken.market.price)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total</span>
                  <span className={styles.summaryTotal}>{formatCompactUSD(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant={orderSide === 'buy' ? 'primary' : 'danger'}
                size="lg"
                fullWidth
                isLoading={isPlacing}
                disabled={!amount || parseFloat(amount) <= 0 || insufficientBalance}
              >
                {isAuthenticated
                  ? `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${currentToken.symbol}`
                  : 'Log in to Trade'}
              </Button>

              <p className={styles.disclaimer}>
                Market orders execute at the best available price. Slippage may occur.
              </p>
            </form>
          </Card>
        </div>

        {/* Market Stats */}
        <Card className={styles.statsCard}>
          <h3 className={styles.statsTitle}>Market Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Market Cap</span>
              <span className={styles.statValue}>{formatCompactUSD(currentToken.market.marketCap)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>24h Volume</span>
              <span className={styles.statValue}>{formatCompactUSD(currentToken.market.volume24h)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Liquidity</span>
              <span className={styles.statValue}>{formatCompactUSD(currentToken.market.liquidity)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Holders</span>
              <span className={styles.statValue}>{formatCompact(currentToken.market.holders)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
