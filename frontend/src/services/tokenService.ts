import { api } from './api';

import type {
  TokenWithMarket,
  OHLCVData,
  TimeFrame,
  TokensResponse,
  TokenResponse,
  ChartDataResponse,
} from '@/types';

export const tokenService = {
  getAllTokens: async (): Promise<readonly TokenWithMarket[]> => {
    const response = await api.get<TokensResponse>('/market/tokens');
    return response.data.data.items;
  },

  getTokenById: async (tokenId: string): Promise<TokenWithMarket> => {
    const response = await api.get<TokenResponse>(`/market/tokens/${tokenId}`);
    return response.data.data;
  },

  getTrendingTokens: async (limit = 10): Promise<readonly TokenWithMarket[]> => {
    const response = await api.get<TokensResponse>('/market/trending', { params: { limit } });
    return response.data.data.items;
  },

  getChartData: async (
    tokenId: string,
    timeFrame: TimeFrame,
    count = 100,
  ): Promise<readonly OHLCVData[]> => {
    const response = await api.get<ChartDataResponse>(`/market/tokens/${tokenId}/chart`, {
      params: { timeFrame, count },
    });
    return response.data.data;
  },
};
