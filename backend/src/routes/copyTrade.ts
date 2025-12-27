import { Router } from 'express';

import {
  MOCK_TRADERS,
  MOCK_COPY_POSITIONS,
  getTraderById,
  sortTradersByField,
  filterVerifiedTraders,
  filterTradersByTag,
  searchTraders,
  getPositionsByUserId,
  filterOpenPositions,
  calculateTotalPnl,
  createDefaultCopySettings,
} from '@data/traders';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';

export const copyTradeRouter = Router();

copyTradeRouter.get('/traders', (req, res) => {
  console.log('[CopyTrade] Get traders');

  const { page, limit } = parsePaginationParams(req.query);
  const sortBy = (req.query.sortBy as string) ?? 'pnlPercent7d';
  const sortOrder = (req.query.order as 'asc' | 'desc') ?? 'desc';
  const search = (req.query.search as string) ?? '';
  const tag = req.query.tag as string | undefined;
  const verifiedOnly = req.query.verified === 'true';

  // Start with all traders
  let traders = [...MOCK_TRADERS];

  // Apply filters
  if (search) {
    traders = [...searchTraders(traders, search)];
  }

  if (tag) {
    traders = [...filterTradersByTag(traders, tag)];
  }

  if (verifiedOnly) {
    traders = [...filterVerifiedTraders(traders)];
  }

  // Apply sorting
  const validSortFields = ['pnlPercent7d', 'pnlPercent30d', 'followers', 'winRate'] as const;
  if (validSortFields.includes(sortBy as typeof validSortFields[number])) {
    traders = [...sortTradersByField(
      traders,
      sortBy as 'pnlPercent7d' | 'pnlPercent30d' | 'followers' | 'winRate',
      sortOrder,
    )];
  }

  // Paginate
  const total = traders.length;
  const paginatedTraders = paginate(traders, page, limit);

  res.json(
    createSuccessResponse(
      createPaginatedResponse(paginatedTraders, { page, limit }, total),
    ),
  );
});

copyTradeRouter.get('/traders/:traderId', (req, res) => {
  const { traderId } = req.params;

  console.log('[CopyTrade] Get trader:', traderId);

  const trader = getTraderById(traderId);
  if (!trader) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Trader '${traderId}' not found`),
    );
    return;
  }

  res.json(createSuccessResponse(trader));
});

copyTradeRouter.get('/top', (_req, res) => {
  console.log('[CopyTrade] Get top traders');

  const topTraders = sortTradersByField(MOCK_TRADERS, 'pnlPercent7d', 'desc').slice(0, 5);

  res.json(createSuccessResponse(topTraders));
});

copyTradeRouter.get('/positions', (req, res) => {
  console.log('[CopyTrade] Get positions');

  const userId = (req.query.userId as string) ?? 'user-1';
  const status = req.query.status as 'open' | 'closed' | undefined;

  let positions = [...getPositionsByUserId(MOCK_COPY_POSITIONS, userId)];

  if (status === 'open') {
    positions = [...filterOpenPositions(positions)];
  } else if (status === 'closed') {
    positions = positions.filter((p) => p.status === 'closed');
  }

  const totalPnl = calculateTotalPnl(positions);

  res.json(createSuccessResponse({
    positions,
    summary: {
      total: positions.length,
      openCount: filterOpenPositions(positions).length,
      totalPnl,
    },
  }));
});

copyTradeRouter.post('/follow/:traderId', (req, res) => {
  const { traderId } = req.params;

  console.log('[CopyTrade] Follow trader:', traderId);

  const trader = getTraderById(traderId);
  if (!trader) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Trader '${traderId}' not found`),
    );
    return;
  }

  const settings = createDefaultCopySettings(traderId);

  res.status(201).json(createSuccessResponse({
    ...settings,
    isActive: true,
    trader,
  }, 'Successfully started following trader'));
});

copyTradeRouter.delete('/follow/:traderId', (req, res) => {
  const { traderId } = req.params;

  console.log('[CopyTrade] Unfollow trader:', traderId);

  res.json(createSuccessResponse(null, 'Successfully stopped following trader'));
});

copyTradeRouter.put('/settings/:traderId', (req, res) => {
  const { traderId } = req.params;
  const updates = req.body as Partial<ReturnType<typeof createDefaultCopySettings>>;

  console.log('[CopyTrade] Update settings:', traderId, updates);

  const trader = getTraderById(traderId);
  if (!trader) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Trader '${traderId}' not found`),
    );
    return;
  }

  const currentSettings = createDefaultCopySettings(traderId);
  const updatedSettings = {
    ...currentSettings,
    ...updates,
    traderId, // Ensure traderId cannot be changed
  };

  res.json(createSuccessResponse(updatedSettings, 'Settings updated successfully'));
});
