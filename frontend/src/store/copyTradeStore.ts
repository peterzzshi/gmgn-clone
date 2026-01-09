import { create } from 'zustand';


import { copyTradeService } from '@/services/copyTradeService';
import { traderService } from '@/services/traderService';

import type { Trader, CopyTradeSettings, CopyPosition } from '@/types';

export interface FollowedTrader {
  readonly trader: Trader;
  readonly settings: CopyTradeSettings;
}

interface PositionsSummary {
  readonly total: number;
  readonly openCount: number;
  readonly totalPnl: number;
}

interface CopyTradeState {
  // State
  readonly followedTraders: readonly FollowedTrader[];
  readonly positions: readonly CopyPosition[];
  readonly positionsSummary: PositionsSummary | null;
  readonly selectedTrader: Trader | null;
  readonly isLoading: boolean;
  readonly error: string | null;

  // Actions
  readonly fetchTrader: (traderId: string) => Promise<void>;
  readonly followTrader: (traderId: string, settings?: Partial<CopyTradeSettings>) => Promise<void>;
  readonly unfollowTrader: (traderId: string) => Promise<void>;
  readonly updateSettings: (traderId: string, updates: Partial<CopyTradeSettings>) => Promise<void>;
  readonly fetchPositions: (status?: 'open' | 'closed') => Promise<void>;
  readonly clearSelectedTrader: () => void;
  readonly clearError: () => void;
}

export const useCopyTradeStore = create<CopyTradeState>(set => ({
  // Initial state
  followedTraders: [],
  positions: [],
  positionsSummary: null,
  selectedTrader: null,
  isLoading: false,
  error: null,

  fetchTrader: async traderId => {
    set({ isLoading: true, error: null });

    try {
      const trader = await traderService.getTraderById(traderId);
      set({
        selectedTrader: trader,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trader';
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  followTrader: async (traderId, settings) => {
    set({ isLoading: true, error: null });

    try {
      const result = await copyTradeService.followTrader(traderId, settings);

      const newFollowedTrader: FollowedTrader = {
        trader: result.trader,
        settings: result.settings,
      };

      set(state => ({
        followedTraders: [...state.followedTraders, newFollowedTrader],
        isLoading: false,
      }));

      console.log('[CopyTrade] Successfully followed trader:', traderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to follow trader';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  unfollowTrader: async traderId => {
    set({ isLoading: true, error: null });

    try {
      await copyTradeService.unfollowTrader(traderId);

      set(state => ({
        followedTraders: state.followedTraders.filter(ft => ft.trader.id !== traderId),
        isLoading: false,
      }));

      console.log('[CopyTrade] Successfully unfollowed trader:', traderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unfollow trader';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  updateSettings: async (traderId, updates) => {
    set({ isLoading: true, error: null });

    try {
      const updatedSettings = await copyTradeService.updateSettings(traderId, updates);

      set(state => ({
        followedTraders: state.followedTraders.map(ft =>
          ft.trader.id === traderId ? { ...ft, settings: updatedSettings } : ft,
        ),
        isLoading: false,
      }));

      console.log('[CopyTrade] Settings updated for trader:', traderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  fetchPositions: async status => {
    set({ isLoading: true, error: null });

    try {
      const result = await copyTradeService.getPositions(status);

      set({
        positions: result.positions,
        positionsSummary: result.summary,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch positions';
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  clearSelectedTrader: () => {
    set({ selectedTrader: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const selectIsFollowingTrader = (
  followedTraders: readonly FollowedTrader[],
  traderId: string,
): boolean => followedTraders.some(ft => ft.trader.id === traderId);

export const selectTraderSettings = (
  followedTraders: readonly FollowedTrader[],
  traderId: string,
): CopyTradeSettings | undefined =>
  followedTraders.find(ft => ft.trader.id === traderId)?.settings;

export const selectOpenPositionsCount = (state: CopyTradeState): number =>
  state.positionsSummary?.openCount ?? 0;

export const selectTotalPnl = (state: CopyTradeState): number =>
  state.positionsSummary?.totalPnl ?? 0;
