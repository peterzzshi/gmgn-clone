import { AxiosError } from 'axios';

import { api } from './api';

import type { TradeParams, Order, OrderResponse, OrdersResponse, ApiResponse } from '@/types';

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class TradingError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
    this.name = 'TradingError';
  }
}

export const tradingService = {
  // Place a new order
  placeOrder: async (params: TradeParams): Promise<Order> => {
    try {
      const response = await api.post<OrderResponse>('/trading/order', params);
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        if (apiError.error) {
          throw new TradingError(
            apiError.error.code,
            apiError.error.message,
            apiError.error.details,
          );
        }
      }
      throw error;
    }
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
