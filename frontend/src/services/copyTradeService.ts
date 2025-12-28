import { api } from './api';

import type {
  Trader,
  CopyTradeSettings,
  CopyPosition,
  ApiResponse,
} from '@/types';

interface FollowTraderResponse {
  readonly settings: CopyTradeSettings;
  readonly trader: Trader;
}

interface PositionsResponse {
  readonly positions: readonly CopyPosition[];
  readonly summary: {
    readonly total: number;
    readonly openCount: number;
    readonly totalPnl: number;
  };
}

export const copyTradeService = {
  // Follow a trader (start copy trading)
  followTrader: async (
    traderId: string,
    settings?: Partial<Omit<CopyTradeSettings, 'traderId'>>,
  ): Promise<FollowTraderResponse> => {
    const response = await api.post<ApiResponse<FollowTraderResponse>>(
      `/copy-trade/follow/${traderId}`,
      settings,
    );
    return response.data.data;
  },

  // Unfollow a trader (stop copy trading)
  unfollowTrader: async (traderId: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/copy-trade/follow/${traderId}`);
  },

  // Update copy trade settings for a trader
  updateSettings: async (
    traderId: string,
    settings: Partial<CopyTradeSettings>,
  ): Promise<CopyTradeSettings> => {
    const response = await api.put<ApiResponse<CopyTradeSettings>>(
      `/copy-trade/settings/${traderId}`,
      settings,
    );
    return response.data.data;
  },

  // Get all copy positions for current user
  getPositions: async (status?: 'open' | 'closed'): Promise<PositionsResponse> => {
    const response = await api.get<ApiResponse<PositionsResponse>>(
      '/copy-trade/positions',
      { params: { status } },
    );
    return response.data.data;
  },

  // Get top traders
  getTopTraders: async (): Promise<readonly Trader[]> => {
    const response = await api.get<ApiResponse<readonly Trader[]>>('/copy-trade/top');
    return response.data.data;
  },
};
