import { Router } from 'express';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import {
  getAllTokensWithMarket,
  getTokenById,
  getTokenWithMarket,
  sortTokensBy,
  filterTokensByQuery,
} from '@/services/marketData';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';
import { generateTokenChartData } from '@data/chart';

import type { TimeFrame } from '@/types';

export const marketRouter = Router();

marketRouter.get('/tokens', async (req, res) => {
  const context = LogContext.create('market');

  await withLogContext(context, async () => {
    logger.debug('Get tokens');

    const { page, limit } = parsePaginationParams(req.query);
    const sortBy = (req.query.sortBy as string) ?? 'marketCap';
    const sortOrder = (req.query.order as 'asc' | 'desc') ?? 'desc';
    const search = (req.query.search as string) ?? '';

    try {
      let tokens = await getAllTokensWithMarket();

      if (search) {
        tokens = filterTokensByQuery(tokens, search);
      }

      const validSortFields = ['marketCap', 'volume24h', 'priceChangePercent24h'] as const;
      if (validSortFields.includes(sortBy as (typeof validSortFields)[number])) {
        tokens = sortTokensBy(
          tokens,
          sortBy as 'marketCap' | 'volume24h' | 'priceChangePercent24h',
          sortOrder,
        );
      }

      const total = tokens.length;
      const paginatedTokens = paginate(tokens, page, limit);

      res.json(
        createSuccessResponse(createPaginatedResponse(paginatedTokens, { page, limit }, total)),
      );
    } catch (error) {
      logger.error('Error fetching tokens', error);
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to fetch tokens'));
    }
  });
});

marketRouter.get('/tokens/:tokenId', async (req, res) => {
  const context = LogContext.create('market');

  await withLogContext(context, async () => {
    const { tokenId } = req.params;

    logger.debug('Get token', { tokenId });

    try {
      const token = getTokenById(tokenId);
      if (!token) {
        res.status(404).json(createErrorResponse('NOT_FOUND', `Token '${tokenId}' not found`));
        return;
      }

      const tokenWithMarket = await getTokenWithMarket(tokenId);
      if (!tokenWithMarket) {
        res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to get market data'));
        return;
      }

      res.json(createSuccessResponse(tokenWithMarket));
    } catch (error) {
      logger.error('Error fetching token', error);
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to fetch token'));
    }
  });
});

marketRouter.get('/tokens/:tokenId/chart', (req, res) => {
  const context = LogContext.create('market');

  withLogContext(context, () => {
    const { tokenId } = req.params;
    const timeFrame = (req.query.timeFrame as TimeFrame) ?? '1h';
    const count = Math.min(500, Math.max(10, Number(req.query.count) || 100));

    logger.debug('Get chart', { tokenId, timeFrame, count });

    const token = getTokenById(tokenId);
    if (!token) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Token '${tokenId}' not found`));
      return;
    }

    const validTimeFrames: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
    if (!validTimeFrames.includes(timeFrame)) {
      res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid time frame', {
          validValues: validTimeFrames,
        }),
      );
      return;
    }

    const chartData = generateTokenChartData(tokenId, timeFrame, count);

    res.json(createSuccessResponse(chartData));
  });
});

marketRouter.get('/trending', async (_req, res) => {
  const context = LogContext.create('market');

  await withLogContext(context, async () => {
    logger.debug('Get trending');

    try {
      const tokens = await getAllTokensWithMarket();
      const trending = sortTokensBy(tokens, 'priceChangePercent24h', 'desc').slice(0, 5);
      res.json(createSuccessResponse(trending));
    } catch (error) {
      logger.error('Error fetching trending', error);
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to fetch trending'));
    }
  });
});

marketRouter.get('/gainers', async (_req, res) => {
  const context = LogContext.create('market');

  await withLogContext(context, async () => {
    logger.debug('Get gainers');

    try {
      const tokens = await getAllTokensWithMarket();
      const gainers = sortTokensBy(tokens, 'priceChangePercent24h', 'desc')
        .filter((t) => t.market.priceChangePercent24h > 0)
        .slice(0, 10);
      res.json(createSuccessResponse(gainers));
    } catch (error) {
      logger.error('Error fetching gainers', error);
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to fetch gainers'));
    }
  });
});

marketRouter.get('/losers', async (_req, res) => {
  const context = LogContext.create('market');

  await withLogContext(context, async () => {
    logger.debug('Get losers');

    try {
      const tokens = await getAllTokensWithMarket();
      const losers = sortTokensBy(tokens, 'priceChangePercent24h', 'asc')
        .filter((t) => t.market.priceChangePercent24h < 0)
        .slice(0, 10);
      res.json(createSuccessResponse(losers));
    } catch (error) {
      logger.error('Error fetching losers', error);
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to fetch losers'));
    }
  });
});
