import { Router } from 'express';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import { getTokenById, fetchTokenMarketData } from '@/services/marketData';
import { createSuccessResponse, createErrorResponse, validateRequired, generateId } from '@/utils';
import {
  getUsdBalance,
  getTokenBalance,
  updateBalanceAfterTrade,
  addTransaction,
  addOrder,
  createTransactionFromOrder,
} from '@data/walletStore';

import type { Order, TradeParams } from '@/types';

export const tradingRouter = Router();

interface PlaceOrderBody extends TradeParams {
  userId?: string;
  [key: string]: unknown;
}

tradingRouter.post('/order', async (req, res) => {
  const context = LogContext.create('trading');

  await withLogContext(context, async () => {
    const body = req.body as PlaceOrderBody;
    const userId = body.userId ?? 'user-1';

    logger.info('Place order', { tokenId: body.tokenId, side: body.side, amount: body.amount });

    const missingFields = validateRequired(body, ['tokenId', 'side', 'type', 'amount']);
    if (missingFields.length > 0) {
      res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Missing required fields', {
          fields: missingFields,
        }),
      );
      return;
    }

    const token = getTokenById(body.tokenId);
    if (!token) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Token '${body.tokenId}' not found`));
      return;
    }

    const marketData = await fetchTokenMarketData(token);
    if (!marketData) {
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to get market data'));
      return;
    }

    if (!['buy', 'sell'].includes(body.side)) {
      res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid order side', {
          validValues: ['buy', 'sell'],
        }),
      );
      return;
    }

    if (!['market', 'limit'].includes(body.type)) {
      res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid order type', {
          validValues: ['market', 'limit'],
        }),
      );
      return;
    }

    if (body.type === 'limit' && !body.price) {
      res
        .status(400)
        .json(createErrorResponse('VALIDATION_ERROR', 'Price is required for limit orders'));
      return;
    }

    const slippage = body.slippage ?? 0.5;
    const slippageMultiplier = body.side === 'buy' ? 1 + slippage / 100 : 1 - slippage / 100;
    const executionPrice =
      body.type === 'market'
        ? marketData.price * slippageMultiplier
        : (body.price ?? marketData.price);

    const isMarketOrder = body.type === 'market';
    const totalUsd = body.amount * executionPrice;
    const fee = isMarketOrder ? totalUsd * 0.001 : 0;

    if (body.side === 'buy') {
      const usdBalance = getUsdBalance(userId);
      const totalCost = totalUsd + fee;
      if (usdBalance < totalCost) {
        logger.warn('Insufficient USD balance', { required: totalCost, available: usdBalance });
        res
          .status(400)
          .json(
            createErrorResponse(
              'INSUFFICIENT_BALANCE',
              `Insufficient USD balance. Required: $${totalCost.toFixed(2)}, Available: $${usdBalance.toFixed(2)}`,
              { required: totalCost, available: usdBalance },
            ),
          );
        return;
      }
    } else {
      const tokenBalance = getTokenBalance(userId, body.tokenId);
      if (tokenBalance < body.amount) {
        logger.warn('Insufficient token balance', {
          required: body.amount,
          available: tokenBalance,
        });
        res
          .status(400)
          .json(
            createErrorResponse(
              'INSUFFICIENT_BALANCE',
              `Insufficient ${token.symbol} balance. Required: ${body.amount}, Available: ${tokenBalance}`,
              { required: body.amount, available: tokenBalance },
            ),
          );
        return;
      }
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: generateId('order'),
      userId,
      tokenId: body.tokenId,
      side: body.side,
      type: body.type,
      status: isMarketOrder ? 'filled' : 'pending',
      amount: body.amount,
      price: body.price ?? marketData.price,
      filledAmount: isMarketOrder ? body.amount : 0,
      filledPrice: isMarketOrder ? executionPrice : 0,
      fee,
      createdAt: now,
      updatedAt: now,
    };

    if (isMarketOrder) {
      const success = updateBalanceAfterTrade(
        userId,
        body.side,
        body.tokenId,
        body.amount,
        totalUsd,
        fee,
      );

      if (!success) {
        logger.error('Failed to execute trade');
        res.status(400).json(createErrorResponse('TRADE_FAILED', 'Failed to execute trade'));
        return;
      }

      const transaction = createTransactionFromOrder(order, token);
      addTransaction(userId, transaction);
    }

    addOrder(userId, order);

    logger.info('Order created', { orderId: order.id, status: order.status });
    res.status(201).json(createSuccessResponse(order));
  });
});

tradingRouter.delete('/order/:orderId', (req, res) => {
  const context = LogContext.create('trading');

  withLogContext(context, () => {
    const { orderId } = req.params;

    logger.info('Cancel order', { orderId });

    const cancelledOrder: Partial<Order> = {
      id: orderId,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    res.json(createSuccessResponse(cancelledOrder, 'Order cancelled successfully'));
  });
});

tradingRouter.get('/quote', async (req, res) => {
  const context = LogContext.create('trading');

  await withLogContext(context, async () => {
    const tokenId = req.query.tokenId as string;
    const side = req.query.side as 'buy' | 'sell';
    const amount = Number(req.query.amount);

    logger.debug('Get quote', { tokenId, side, amount });

    if (!tokenId || !side || !amount) {
      res
        .status(400)
        .json(
          createErrorResponse(
            'VALIDATION_ERROR',
            'Missing required parameters: tokenId, side, amount',
          ),
        );
      return;
    }

    const token = getTokenById(tokenId);
    if (!token) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Token '${tokenId}' not found`));
      return;
    }

    const marketData = await fetchTokenMarketData(token);
    if (!marketData) {
      res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'Failed to get market data'));
      return;
    }

    const slippage = 0.5;
    const slippageMultiplier = side === 'buy' ? 1 + slippage / 100 : 1 - slippage / 100;
    const estimatedPrice = marketData.price * slippageMultiplier;
    const estimatedTotal = amount * estimatedPrice;
    const estimatedFee = estimatedTotal * 0.001;

    const quote = {
      tokenId,
      side,
      amount,
      price: marketData.price,
      estimatedPrice,
      estimatedTotal,
      estimatedFee,
      slippage,
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
    };

    res.json(createSuccessResponse(quote));
  });
});
