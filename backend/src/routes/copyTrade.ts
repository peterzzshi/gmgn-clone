import { Router } from 'express';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';
import {
  getAllTraders,
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

import type { Trader } from '@/types';

export const copyTradeRouter = Router();

copyTradeRouter.get('/traders', (req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    logger.debug('Get traders');

    const { page, limit } = parsePaginationParams(req.query);
    const sortBy = (req.query.sortBy as string | undefined) ?? 'pnlPercent7d';
    const sortOrder = (req.query.order as 'asc' | 'desc' | undefined) ?? 'desc';
    const search = (req.query.search as string | undefined) ?? '';
    const tag = req.query.tag as string | undefined;
    const verifiedOnly = req.query.verified === 'true';

    const filteredTraders = [
      search ? (t: readonly Trader[]) => searchTraders(t, search) : null,
      tag ? (t: readonly Trader[]) => filterTradersByTag(t, tag) : null,
      verifiedOnly ? (t: readonly Trader[]) => filterVerifiedTraders(t) : null,
    ]
      .filter((fn): fn is (t: readonly Trader[]) => readonly Trader[] => fn !== null)
      .reduce((traders, filterFn) => filterFn(traders), getAllTraders());

    const validSortFields = ['pnlPercent7d', 'pnlPercent30d', 'followers', 'winRate'] as const;
    const sortedTraders = validSortFields.includes(sortBy as (typeof validSortFields)[number])
      ? sortTradersByField(
          filteredTraders,
          sortBy as 'pnlPercent7d' | 'pnlPercent30d' | 'followers' | 'winRate',
          sortOrder,
        )
      : filteredTraders;

    const total = sortedTraders.length;
    const paginatedTraders = paginate(sortedTraders, page, limit);

    const paginatedResponse = createPaginatedResponse(paginatedTraders, { page, limit }, total);
    res.json(
      createSuccessResponse({
        ...paginatedResponse,
        _meta: {
          warning: 'DEMO_DATA',
          message:
            'Trader data is for demonstration purposes only. Real on-chain analysis coming soon.',
        },
      }),
    );
  });
});

copyTradeRouter.get('/traders/:traderId', (req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    const { traderId } = req.params;

    logger.debug('Get trader', { traderId });

    const trader = getTraderById(traderId);
    if (!trader) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Trader '${traderId}' not found`));
      return;
    }

    res.json(createSuccessResponse(trader));
  });
});

copyTradeRouter.get('/top', (_req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    logger.debug('Get top traders');

    const topTraders = sortTradersByField(getAllTraders(), 'pnlPercent7d', 'desc').slice(0, 5);

    res.json(createSuccessResponse(topTraders));
  });
});

copyTradeRouter.get('/positions', (req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    logger.debug('Get positions');

    const userId = (req.query.userId as string | undefined) ?? 'user-1';
    const status = req.query.status as 'open' | 'closed' | undefined;

    let positions = [...getPositionsByUserId(MOCK_COPY_POSITIONS, userId)];

    if (status === 'open') {
      positions = [...filterOpenPositions(positions)];
    } else if (status === 'closed') {
      positions = positions.filter(p => p.status === 'closed');
    }

    const totalPnl = calculateTotalPnl(positions);

    res.json(
      createSuccessResponse({
        positions,
        summary: {
          total: positions.length,
          openCount: filterOpenPositions(positions).length,
          totalPnl,
        },
      }),
    );
  });
});

copyTradeRouter.post('/follow/:traderId', (req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    const { traderId } = req.params;

    logger.info('Follow trader', { traderId });

    const trader = getTraderById(traderId);
    if (!trader) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Trader '${traderId}' not found`));
      return;
    }

    const settings = createDefaultCopySettings(traderId);

    res.status(201).json(
      createSuccessResponse(
        {
          ...settings,
          isActive: true,
          trader,
        },
        'Successfully started following trader',
      ),
    );
  });
});

copyTradeRouter.delete('/follow/:traderId', (req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    const { traderId } = req.params;

    logger.info('Unfollow trader', { traderId });

    res.json(createSuccessResponse(null, 'Successfully stopped following trader'));
  });
});

copyTradeRouter.put('/settings/:traderId', (req, res) => {
  const context = LogContext.create('copy-trade');

  withLogContext(context, () => {
    const { traderId } = req.params;
    const updates = req.body as Partial<ReturnType<typeof createDefaultCopySettings>>;

    logger.info('Update settings', { traderId });

    const trader = getTraderById(traderId);
    if (!trader) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Trader '${traderId}' not found`));
      return;
    }

    const currentSettings = createDefaultCopySettings(traderId);
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      traderId,
    };

    res.json(createSuccessResponse(updatedSettings, 'Settings updated successfully'));
  });
});
