import { api } from './api';
import type { Trader, TradersResponse, TraderResponse } from '@/types';

export const traderService = {
  // Get all traders
  getAllTraders: async (): Promise<readonly Trader[]> => {
    const response = await api.get<TradersResponse>('/copy-trade/traders');
    // Handle both paginated and non-paginated responses
    return response.data.data.items || response.data.data;
  },

  // Get trader by ID
  getTraderById: async (traderId: string): Promise<Trader> => {
    const response = await api.get<TraderResponse>(`/copy-trade/traders/${traderId}`);
    return response.data.data;
  },
};

