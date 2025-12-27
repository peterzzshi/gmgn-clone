import { api } from './api';
import type {
  TokenWithMarket,
  OHLCVData,
  TimeFrame,
  TokensResponse,
  TokenResponse,
  ChartDataResponse
} from '@/types';

export const tokenService = {
  // Get all tokens with market data
  getAllTokens: async (): Promise<readonly TokenWithMarket[]> => {
    const response = await api.get<TokensResponse>('/market/tokens');
    // Backend returns paginated response
    return response.data.data.items;
  },

  // Get single token by ID
  getTokenById: async (tokenId: string): Promise<TokenWithMarket> => {
    const response = await api.get<TokenResponse>(`/market/tokens/${tokenId}`);
    return response.data.data;
  },

  // Get trending tokens
  getTrendingTokens: async (limit: number = 10): Promise<readonly TokenWithMarket[]> => {
    const response = await api.get<TokensResponse>('/market/trending', { params: { limit } });
    return response.data.data.items || response.data.data;
  },

  // Get chart data
  getChartData: async (
    tokenId: string,
    timeFrame: TimeFrame,
    count: number = 100
  ): Promise<readonly OHLCVData[]> => {
    const response = await api.get<ChartDataResponse>(`/market/tokens/${tokenId}/chart`, {
      params: { timeFrame, count },
    });
    return response.data.data;
  },
};

