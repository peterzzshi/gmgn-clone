import { Router } from 'express';

import type { TimeFrame } from '@/types';
import {
  getAllTokensWithMarket,
  getTokenById,
  combineTokenWithMarket,
  sortTokensBy,
  filterTokensByQuery,
} from '@data/tokens';
import { generateTokenChartData } from '@data/chart';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';

export const marketRouter = Router();

marketRouter.get('/tokens', (req, res) => {
  console.log('[Market] Get tokens');

  const { page, limit } = parsePaginationParams(req.query);
  const sortBy = (req.query.sortBy as string) ?? 'marketCap';
  const sortOrder = (req.query.order as 'asc' | 'desc') ?? 'desc';
  const search = (req.query.search as string) ?? '';

  // Get all tokens
  let tokens = getAllTokensWithMarket();

  // Apply search filter
  if (search) {
    tokens = filterTokensByQuery(tokens, search);
  }

  // Apply sorting
  const validSortFields = ['marketCap', 'volume24h', 'priceChangePercent24h'] as const;
  if (validSortFields.includes(sortBy as typeof validSortFields[number])) {
    tokens = sortTokensBy(
      tokens,
      sortBy as 'marketCap' | 'volume24h' | 'priceChangePercent24h',
      sortOrder,
    );
  }

  // Apply pagination
  const total = tokens.length;
  const paginatedTokens = paginate(tokens, page, limit);

  res.json(
    createSuccessResponse(
      createPaginatedResponse(paginatedTokens, { page, limit }, total),
    ),
  );
});

marketRouter.get('/tokens/:tokenId', (req, res) => {
  const { tokenId } = req.params;

  console.log('[Market] Get token:', tokenId);

  const token = getTokenById(tokenId);
  if (!token) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Token '${tokenId}' not found`),
    );
    return;
  }

  const tokenWithMarket = combineTokenWithMarket(token);
  if (!tokenWithMarket) {
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Failed to get market data'),
    );
    return;
  }

  res.json(createSuccessResponse(tokenWithMarket));
});

marketRouter.get('/tokens/:tokenId/chart', (req, res) => {
  const { tokenId } = req.params;
  const timeFrame = (req.query.timeFrame as TimeFrame) ?? '1h';
  const count = Math.min(500, Math.max(10, Number(req.query.count) || 100));

  console.log('[Market] Get chart:', tokenId, timeFrame, count);

  // Validate token exists
  const token = getTokenById(tokenId);
  if (!token) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Token '${tokenId}' not found`),
    );
    return;
  }

  // Validate time frame
  const validTimeFrames: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  if (!validTimeFrames.includes(timeFrame)) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid time frame', {
        validValues: validTimeFrames,
      }),
    );
    return;
  }

  // Generate chart data
  const chartData = generateTokenChartData(tokenId, timeFrame, count);

  res.json(createSuccessResponse(chartData));
});

marketRouter.get('/trending', (_req, res) => {
  console.log('[Market] Get trending');

  const tokens = getAllTokensWithMarket();
  const trending = sortTokensBy(tokens, 'priceChangePercent24h', 'desc').slice(0, 5);

  res.json(createSuccessResponse(trending));
});

marketRouter.get('/gainers', (_req, res) => {
  console.log('[Market] Get gainers');

  const tokens = getAllTokensWithMarket();
  const gainers = sortTokensBy(tokens, 'priceChangePercent24h', 'desc')
    .filter((t) => t.market.priceChangePercent24h > 0)
    .slice(0, 10);

  res.json(createSuccessResponse(gainers));
});

marketRouter.get('/losers', (_req, res) => {
  console.log('[Market] Get losers');

  const tokens = getAllTokensWithMarket();
  const losers = sortTokensBy(tokens, 'priceChangePercent24h', 'asc')
    .filter((t) => t.market.priceChangePercent24h < 0)
    .slice(0, 10);

  res.json(createSuccessResponse(losers));
});
