import { Router } from 'express';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import {
  createSuccessResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';
import {
  getOrCreateWallet,
  getWalletBalances,
  getUsdBalance,
  getTotalPortfolioValue,
  getTransactions,
  getOrders,
  resetWallet,
} from '@data/walletStore';

import type { OrderStatus, WalletSummary } from '@/types';

export const walletRouter = Router();

const getUserId = (req: { query: { userId?: string } }): string =>
  req.query.userId ?? 'user-1';

walletRouter.get('/summary', async (req, res) => {
  const context = LogContext.create('wallet');

  await withLogContext(context, async () => {
    const userId = getUserId(req);

    logger.debug('Get summary', { userId });

    try {
      getOrCreateWallet(userId);

      const balances = await getWalletBalances(userId);
      const usdBalance = getUsdBalance(userId);
      const totalPortfolioValue = await getTotalPortfolioValue(userId);

      const totalPnl24h = balances.reduce((sum, b) => {
        const previousValue = b.balanceUsd / (1 + b.priceChange24h / 100);
        return sum + (b.balanceUsd - previousValue);
      }, 0);

      const assetsValue = balances.reduce((sum, b) => sum + b.balanceUsd, 0);
      const totalPnlPercent24h =
        assetsValue > 0 ? (totalPnl24h / (assetsValue - totalPnl24h)) * 100 : 0;

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
    } catch (error) {
      logger.error('Error getting summary', error);
      res.status(500).json({ error: 'Failed to get wallet summary' });
    }
  });
});

walletRouter.get('/balance', (req, res) => {
  const context = LogContext.create('wallet');

  withLogContext(context, () => {
    const userId = getUserId(req);

    logger.debug('Get USD balance', { userId });

    const usdBalance = getUsdBalance(userId);

    res.json(createSuccessResponse({ balance: usdBalance }));
  });
});

walletRouter.get('/balances', async (req, res) => {
  const context = LogContext.create('wallet');

  await withLogContext(context, async () => {
    const userId = getUserId(req);

    logger.debug('Get balances', { userId });

    try {
      const balances = await getWalletBalances(userId);
      res.json(createSuccessResponse(balances));
    } catch (error) {
      logger.error('Error getting balances', error);
      res.status(500).json({ error: 'Failed to get balances' });
    }
  });
});

walletRouter.get('/transactions', (req, res) => {
  const context = LogContext.create('wallet');

  withLogContext(context, () => {
    const userId = getUserId(req);

    logger.debug('Get transactions', { userId });

    const { page, limit } = parsePaginationParams(req.query);

    const allTransactions = getTransactions(userId, 100);

    const total = allTransactions.length;
    const paginatedTx = paginate(allTransactions, page, limit);

    res.json(createSuccessResponse(createPaginatedResponse(paginatedTx, { page, limit }, total)));
  });
});

walletRouter.get('/orders', (req, res) => {
  const context = LogContext.create('wallet');

  withLogContext(context, () => {
    const userId = getUserId(req);

    logger.debug('Get orders', { userId });

    const { page, limit } = parsePaginationParams(req.query);
    const status = req.query.status as OrderStatus | undefined;

    const allOrders = getOrders(userId, status);

    const total = allOrders.length;
    const paginatedOrders = paginate(allOrders, page, limit);

    res.json(
      createSuccessResponse(createPaginatedResponse(paginatedOrders, { page, limit }, total)),
    );
  });
});

walletRouter.get('/orders/pending', (req, res) => {
  const context = LogContext.create('wallet');

  withLogContext(context, () => {
    const userId = getUserId(req);

    logger.debug('Get pending orders', { userId });

    const pendingOrders = getOrders(userId, 'pending');

    res.json(createSuccessResponse(pendingOrders));
  });
});

walletRouter.post('/reset', (req, res) => {
  const context = LogContext.create('wallet');

  withLogContext(context, () => {
    const userId = getUserId(req);

    logger.info('Reset wallet', { userId });

    resetWallet(userId);
    res.json(createSuccessResponse({ message: 'Wallet reset successfully' }));
  });
});
