import { create } from 'zustand';
import { tradingService } from '@/services/tradingService';
import type { Order, TradeParams } from '@/types';

interface TradingState {
  orders: readonly Order[];
  isLoading: boolean;
  error: string | null;
  placeOrder: (params: TradeParams) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

export const useTradingStore = create<TradingState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  placeOrder: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const newOrder = await tradingService.placeOrder(params);

      set((state) => ({
        orders: [...state.orders, newOrder],
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place order';
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

