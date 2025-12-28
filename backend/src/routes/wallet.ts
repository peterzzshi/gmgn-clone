import { Router } from 'express';

import {
  getOrCreateWallet,
  getWalletBalances,
  getUsdBalance,
  getTotalPortfolioValue,
  getTransactions,
  getOrders,
  resetWallet,
} from '@data/walletStore';
import {
  createSuccessResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';

import type { OrderStatus, WalletSummary } from '@/types';

export const walletRouter = Router();

const getUserId = (req: { query: { userId?: string } }): string =>
  (req.query.userId as string) ?? 'user-1';

walletRouter.get('/summary', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Get summary for user:', userId);

  getOrCreateWallet(userId);

  const balances = getWalletBalances(userId);
  const usdBalance = getUsdBalance(userId);
  const totalPortfolioValue = getTotalPortfolioValue(userId);

  const totalPnl24h = balances.reduce((sum, b) => {
    const previousValue = b.balanceUsd / (1 + b.priceChange24h / 100);
    return sum + (b.balanceUsd - previousValue);
  }, 0);

  const assetsValue = balances.reduce((sum, b) => sum + b.balanceUsd, 0);
  const totalPnlPercent24h = assetsValue > 0
    ? (totalPnl24h / (assetsValue - totalPnl24h)) * 100
    : 0;

  const summary: WalletSummary = {
    totalBalanceUsd: totalPortfolioValue,
    totalPnl24h,
    totalPnlPercent24h,
    balances,
  };

  const responseData = {
    ...summary,
    availableUsd: usdBalance,
  };

  res.json(createSuccessResponse(responseData));
});

walletRouter.get('/balance', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Get USD balance for user:', userId);

  const usdBalance = getUsdBalance(userId);

  res.json(createSuccessResponse({ balance: usdBalance }));
});

walletRouter.get('/balances', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Get balances for user:', userId);

  const balances = getWalletBalances(userId);

  res.json(createSuccessResponse(balances));
});

walletRouter.get('/transactions', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Get transactions for user:', userId);

  const { page, limit } = parsePaginationParams(req.query);

  const allTransactions = getTransactions(userId, 100);

  const total = allTransactions.length;
  const paginatedTx = paginate(allTransactions, page, limit);

  res.json(
    createSuccessResponse(
      createPaginatedResponse(paginatedTx, { page, limit }, total),
    ),
  );
});

walletRouter.get('/orders', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Get orders for user:', userId);

  const { page, limit } = parsePaginationParams(req.query);
  const status = req.query.status as OrderStatus | undefined;

  const allOrders = getOrders(userId, status);

  const total = allOrders.length;
  const paginatedOrders = paginate(allOrders, page, limit);

  res.json(
    createSuccessResponse(
      createPaginatedResponse(paginatedOrders, { page, limit }, total),
    ),
  );
});

walletRouter.get('/orders/pending', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Get pending orders for user:', userId);

  const pendingOrders = getOrders(userId, 'pending');

  res.json(createSuccessResponse(pendingOrders));
});

walletRouter.post('/reset', (req, res) => {
  const userId = getUserId(req);
  console.log('[Wallet] Reset wallet for user:', userId);

  resetWallet(userId);
  res.json(createSuccessResponse({ message: 'Wallet reset successfully' }));
});
