import { api } from './api';
import type {
  WalletSummary,
  Transaction,
  WalletSummaryResponse,
  TransactionsResponse
} from '@/types';

export const walletService = {
  // Get wallet summary with balances
  getWalletSummary: async (): Promise<WalletSummary> => {
    const response = await api.get<WalletSummaryResponse>('/wallet/summary');
    return response.data.data;
  },

  // Get transaction history
  getTransactions: async (limit: number = 20): Promise<readonly Transaction[]> => {
    const response = await api.get<TransactionsResponse>('/wallet/transactions', {
      params: { limit }
    });
    return response.data.data;
  },
};

