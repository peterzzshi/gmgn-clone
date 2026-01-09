import { api } from './api';

import type { Trader, TradersResponse, TraderResponse } from '@/types';

export const traderService = {
  getAllTraders: async (): Promise<readonly Trader[]> => {
    const response = await api.get<TradersResponse>('/copy-trade/traders');
    return response.data.data.items;
  },

  getTraderById: async (traderId: string): Promise<Trader> => {
    const response = await api.get<TraderResponse>(`/copy-trade/traders/${traderId}`);
    return response.data.data;
  },
};
