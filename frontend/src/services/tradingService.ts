import { api } from './api';
import type { TradeParams, Order, OrderResponse, OrdersResponse, ApiResponse } from '@/types';

export const tradingService = {
  // Place a new order
  placeOrder: async (params: TradeParams): Promise<Order> => {
    const response = await api.post<OrderResponse>('/trading/order', params);
    return response.data.data;
  },

  // Get user's orders
  getOrders: async (): Promise<readonly Order[]> => {
    const response = await api.get<OrdersResponse>('/trading/orders');
    return response.data.data;
  },

  // Cancel an order
  cancelOrder: async (orderId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/trading/orders/${orderId}`);
  },
};

