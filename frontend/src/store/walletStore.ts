import { create } from 'zustand';
import { walletService } from '@/services/walletService';
import type { WalletAsset, Transaction } from '@/types';

interface WalletState {
  readonly balance: number;
  readonly assets: readonly WalletAsset[];
  readonly transactions: readonly Transaction[];
  readonly isLoading: boolean;
  readonly error: string | null;

  readonly fetchWallet: () => Promise<void>;
  readonly fetchTransactions: () => Promise<void>;
  readonly updateBalanceAfterTrade: (
    side: 'buy' | 'sell',
    tokenSymbol: string,
    amount: number,
    totalUsd: number,
  ) => void;
  readonly addTransaction: (transaction: Transaction) => void;
  readonly getTokenBalance: (symbol: string) => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  assets: [],
  transactions: [],
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await walletService.getWalletSummary();

      const assets: WalletAsset[] = data.balances.map((balance) => ({
        symbol: balance.symbol,
        name: balance.name,
        amount: balance.balance,
        valueUsd: balance.balanceUsd,
        priceUsd: balance.price,
        change24h: balance.priceChange24h,
        logoUrl: balance.logoUrl,
      }));

      const totalTokenValueUsd = assets.reduce((sum, asset) => sum + asset.valueUsd, 0);
      const usdBalance = Math.max(0, data.totalBalanceUsd - totalTokenValueUsd);

      set({
        balance: usdBalance,
        assets,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch wallet';
      set({ isLoading: false, error: message });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });

    try {
      const transactions = await walletService.getTransactions();

      set({
        transactions,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
      set({ isLoading: false, error: message });
    }
  },

  updateBalanceAfterTrade: (side, tokenSymbol, amount, totalUsd) => {
    const state = get();

    if (side === 'buy') {
      const newBalance = Math.max(0, state.balance - totalUsd);

      const existingAssetIndex = state.assets.findIndex(
        (a) => a.symbol.toUpperCase() === tokenSymbol.toUpperCase(),
      );

      let newAssets: readonly WalletAsset[];

      if (existingAssetIndex >= 0) {
        newAssets = state.assets.map((asset, index) =>
          index === existingAssetIndex
            ? {
                ...asset,
                amount: asset.amount + amount,
                valueUsd: asset.valueUsd + totalUsd,
              }
            : asset,
        );
      } else {
        const newAsset: WalletAsset = {
          symbol: tokenSymbol.toUpperCase(),
          name: tokenSymbol,
          amount,
          valueUsd: totalUsd,
          priceUsd: totalUsd / amount,
          change24h: 0,
          logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(tokenSymbol)}`,
        };
        newAssets = [...state.assets, newAsset];
      }

      set({
        balance: newBalance,
        assets: newAssets,
      });
    } else {
      const newBalance = state.balance + totalUsd;

      const newAssets = state.assets
        .map((asset) => {
          if (asset.symbol.toUpperCase() === tokenSymbol.toUpperCase()) {
            const newAmount = asset.amount - amount;
            if (newAmount <= 0) {
              return null;
            }
            return {
              ...asset,
              amount: newAmount,
              valueUsd: asset.valueUsd - totalUsd,
            };
          }
          return asset;
        })
        .filter((asset): asset is WalletAsset => asset !== null);

      set({
        balance: newBalance,
        assets: newAssets,
      });
    }

    console.log('[Wallet] Balance updated after trade:', {
      side,
      tokenSymbol,
      amount,
      totalUsd,
      newBalance: get().balance,
    });
  },

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
  },

  getTokenBalance: (symbol: string) => {
    const asset = selectAssetBySymbol(get(), symbol);
    return asset?.amount ?? 0;
  },
}));

// Selectors
export const selectTotalPortfolioValue = (state: WalletState): number => {
  const assetsValue = state.assets.reduce((sum, asset) => sum + asset.valueUsd, 0);
  return state.balance + assetsValue;
};

export const selectAssetBySymbol = (
  state: WalletState,
  symbol: string,
): WalletAsset | undefined =>
  state.assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
