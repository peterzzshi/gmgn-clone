import { useEffect } from 'react';

import { useRealtimePriceStore } from '@/store/realtimePriceStore';

/**
 * Hook to automatically manage Pyth price subscriptions
 * Call this at the app level to start real-time price updates
 */
export const usePythPriceSubscription = () => {
  const { startSubscription, stopSubscription, isSubscribed } = useRealtimePriceStore();

  useEffect(() => {
    startSubscription();

    return () => {
      stopSubscription();
    };
  }, [startSubscription, stopSubscription]);

  return { isSubscribed };
};

/**
 * Hook to get real-time price for a specific token
 */
export const usePythPrice = (tokenId: string) => {
  const { getPrice, getPriceUpdate } = useRealtimePriceStore();

  const price = getPrice(tokenId);
  const priceUpdate = getPriceUpdate(tokenId);

  return {
    price,
    confidence: priceUpdate?.confidence ?? 0,
    timestamp: priceUpdate?.timestamp ?? 0,
    publishTime: priceUpdate?.publishTime ?? 0,
    isAvailable: price !== null,
  };
};

/**
 * Hook to get all real-time prices
 */
export const useAllPythPrices = () => {
  const { realtimePrices } = useRealtimePriceStore();

  return {
    prices: realtimePrices,
    count: realtimePrices.size,
  };
};
