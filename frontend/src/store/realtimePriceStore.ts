import { create } from 'zustand';

import { subscribeToPriceStream } from '@/services/pythPriceService';

import type { PythPriceData } from '@/services/pythPriceService';
import type { TokenWithMarket } from '@/types';

interface RealtimePriceUpdate {
  readonly tokenId: string;
  readonly price: number;
  readonly confidence: number;
  readonly timestamp: number;
  readonly publishTime: number;
}

interface RealtimePriceStore {
  realtimePrices: ReadonlyMap<string, RealtimePriceUpdate>;
  isSubscribed: boolean;
  unsubscribe: (() => void) | null;
  updateFromPyth: (pythData: Record<string, PythPriceData>) => void;
  getPrice: (tokenId: string) => number | null;
  getPriceUpdate: (tokenId: string) => RealtimePriceUpdate | null;
  mergeRealtimePrice: (token: TokenWithMarket) => TokenWithMarket;
  startSubscription: () => void;
  stopSubscription: () => void;
  clearPrices: () => void;
}

const createPriceUpdate = (
  tokenId: string,
  data: PythPriceData,
): RealtimePriceUpdate => ({
  tokenId,
  price: data.price,
  confidence: data.confidence,
  timestamp: data.timestamp,
  publishTime: data.publishTime,
});

const pythDataToUpdates = (
  pythData: Record<string, PythPriceData>,
): ReadonlyMap<string, RealtimePriceUpdate> =>
  new Map(
    Object.entries(pythData).map(([symbol, data]) => [
      symbol.toLowerCase(),
      createPriceUpdate(symbol.toLowerCase(), data),
    ]),
  );

const calculatePriceChange = (
  oldPrice: number,
  newPrice: number,
): { priceChange24h: number; priceChangePercent24h: number } => {
  const priceChange24h = newPrice - oldPrice;
  const priceChangePercent24h = oldPrice > 0 ? (priceChange24h / oldPrice) * 100 : 0;
  return { priceChange24h, priceChangePercent24h };
};

export const useRealtimePriceStore = create<RealtimePriceStore>((set, get) => ({
  realtimePrices: new Map(),
  isSubscribed: false,
  unsubscribe: null,

  updateFromPyth: pythData =>
    set(state => ({
      realtimePrices: new Map([...state.realtimePrices, ...pythDataToUpdates(pythData)]),
    })),

  getPrice: tokenId => get().realtimePrices.get(tokenId)?.price ?? null,

  getPriceUpdate: tokenId => get().realtimePrices.get(tokenId) ?? null,

  mergeRealtimePrice: token => {
    const realtimeUpdate = get().getPriceUpdate(token.id);

    if (!realtimeUpdate) {
      return token;
    }

    const { priceChange24h, priceChangePercent24h } = calculatePriceChange(
      token.market.price,
      realtimeUpdate.price,
    );

    return {
      ...token,
      market: {
        ...token.market,
        price: realtimeUpdate.price,
        priceChange24h,
        priceChangePercent24h,
        updatedAt: new Date(realtimeUpdate.publishTime).toISOString(),
      },
    };
  },

  startSubscription: () => {
    if (get().isSubscribed) {
      return;
    }

    console.info('[RealtimePrice] Starting SSE streaming...');

    const unsubscribe = subscribeToPriceStream(
      pythData => get().updateFromPyth(pythData),
      error => console.error('[RealtimePrice] Stream error:', error),
    );

    set({ isSubscribed: true, unsubscribe });
  },

  stopSubscription: () => {
    const { unsubscribe } = get();

    if (unsubscribe) {
      unsubscribe();
      set({ isSubscribed: false, unsubscribe: null });
    }
  },

  clearPrices: () => set({ realtimePrices: new Map() }),
}));
