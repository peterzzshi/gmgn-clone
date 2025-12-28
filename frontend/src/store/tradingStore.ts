import { create } from 'zustand';
import { tradingService, TradingError } from '@/services/tradingService';
import { useWalletStore } from '@/store/walletStore';
import { useMarketStore } from '@/store/marketStore';
import type { Order, TradeParams, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';


interface TradingState {
  readonly orders: readonly Order[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly placeOrder: (params: TradeParams) => Promise<void>;
  readonly cancelOrder: (orderId: string) => Promise<void>;
  readonly fetchOrders: () => Promise<void>;
}

const createTransactionFromOrder = (order: Order, side: 'buy' | 'sell'): Transaction => ({
  id: `tx-${order.id}`,
  type: side === 'buy' ? 'receive' : 'send',
  tokenSymbol: order.tokenId.toUpperCase(),
  tokenName: order.tokenId,
  amount: order.amount,
  valueUsd: order.filledAmount * order.filledPrice,
  createdAt: order.createdAt,
  status: 'confirmed',
  txHash: `0x${uuidv4().replace(/-/g, '').slice(0, 64)}`,
});

export const useTradingStore = create<TradingState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  placeOrder: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const newOrder = await tradingService.placeOrder(params);

      // Get token price from market store
      const marketState = useMarketStore.getState();
      const token = marketState.tokens.find((t) => t.id === params.tokenId);
      const price = token?.market.price ?? newOrder.filledPrice;
      const totalUsd = params.amount * price;

      // Update wallet balance (frontend state sync)
      const walletStore = useWalletStore.getState();
      walletStore.updateBalanceAfterTrade(
        params.side,
        params.tokenId,
        params.amount,
        totalUsd,
      );

      // Add transaction to wallet
      const transaction = createTransactionFromOrder(newOrder, params.side);
      walletStore.addTransaction(transaction);

      set((state) => ({
        orders: [...state.orders, newOrder],
        isLoading: false,
      }));

      console.log('[Trading] Order placed and wallet updated:', {
        orderId: newOrder.id,
        side: params.side,
        amount: params.amount,
        totalUsd,
      });
    } catch (error) {
      let message = 'Failed to place order';

      if (error instanceof TradingError) {
        message = error.message;
        console.log('[Trading] Trading error:', error.code, error.message);
      } else if (error instanceof Error) {
        message = error.message;
      }

      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    set({ isLoading: true, error: null });

    try {
      await tradingService.cancelOrder(orderId);

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'cancelled' as const,
                updatedAt: new Date().toISOString(),
              }
            : order
        ),
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel order';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const orders = await tradingService.getOrders();

      set({
        orders,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({
        isLoading: false,
        error: message,
      });
    }
  },
}));

