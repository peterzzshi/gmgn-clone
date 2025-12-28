import { create } from 'zustand';

import { tokenService } from '@/services/tokenService';
import type { TokenWithMarket } from '@/types';

interface MarketState {
  tokens: readonly TokenWithMarket[];
  selectedToken: TokenWithMarket | null;
  isLoading: boolean;
  error: string | null;
  fetchTokens: () => Promise<void>;
  selectToken: (tokenId: string) => void;
  refreshToken: (tokenId: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  tokens: [],
  selectedToken: null,
  isLoading: false,
  error: null,

  fetchTokens: async () => {
    set({ isLoading: true, error: null });

    try {
      const tokens = await tokenService.getAllTokens();
      set({
        tokens,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tokens';
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  selectToken: (tokenId) => {
    const { tokens } = get();
    // Safely handle tokens array
    const safeTokens = Array.isArray(tokens) ? tokens : [];
    const token = safeTokens.find((t) => t.id === tokenId);
    set({ selectedToken: token ?? null });
  },

  refreshToken: async (tokenId) => {
    try {
      const updatedToken = await tokenService.getTokenById(tokenId);

      set((state) => ({
        tokens: state.tokens.map((t) =>
          t.id === tokenId ? updatedToken : t
        ),
        selectedToken: state.selectedToken?.id === tokenId
          ? updatedToken
          : state.selectedToken,
      }));
    } catch {
      // Silent failure for token refresh
    }
  },
}));

