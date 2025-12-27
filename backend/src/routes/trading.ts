import { Router } from 'express';

import type { TradeParams, Order } from '@/types';
import { getTokenById, getMarketDataByTokenId } from '@data/tokens';
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequired,
  generateId,
} from '@/utils';

export const tradingRouter = Router();

interface PlaceOrderBody extends TradeParams {
  userId?: string;
  [key: string]: unknown;
}

tradingRouter.post('/order', (req, res) => {
  const body = req.body as PlaceOrderBody;

  console.log('[Trading] Place order:', body);

  // Validate required fields
  const missingFields = validateRequired(body, ['tokenId', 'side', 'type', 'amount']);
  if (missingFields.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Missing required fields', { fields: missingFields }),
    );
    return;
  }

  // Validate token exists
  const token = getTokenById(body.tokenId);
  if (!token) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Token '${body.tokenId}' not found`),
    );
    return;
  }

  // Get current market price
  const marketData = getMarketDataByTokenId(body.tokenId);
  if (!marketData) {
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Failed to get market data'),
    );
    return;
  }

  // Validate side
  if (!['buy', 'sell'].includes(body.side)) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid order side', { validValues: ['buy', 'sell'] }),
    );
    return;
  }

  // Validate type
  if (!['market', 'limit'].includes(body.type)) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid order type', { validValues: ['market', 'limit'] }),
    );
    return;
  }

  // For limit orders, price is required
  if (body.type === 'limit' && !body.price) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Price is required for limit orders'),
    );
    return;
  }

  // Calculate execution price (with simulated slippage for market orders)
  const slippage = body.slippage ?? 0.5;
  const slippageMultiplier = body.side === 'buy' ? 1 + slippage / 100 : 1 - slippage / 100;
  const executionPrice = body.type === 'market'
    ? marketData.price * slippageMultiplier
    : body.price ?? marketData.price;

  // Simulate order execution
  const now = new Date().toISOString();
  const isMarketOrder = body.type === 'market';

  const order: Order = {
    id: generateId('order'),
    userId: body.userId ?? 'user-1',
    tokenId: body.tokenId,
    side: body.side,
    type: body.type,
    status: isMarketOrder ? 'filled' : 'pending',
    amount: body.amount,
    price: body.price ?? marketData.price,
    filledAmount: isMarketOrder ? body.amount : 0,
    filledPrice: isMarketOrder ? executionPrice : 0,
    fee: isMarketOrder ? body.amount * executionPrice * 0.001 : 0, // 0.1% fee
    createdAt: now,
    updatedAt: now,
  };

  console.log('[Trading] Order created:', order.id, order.status);

  res.status(201).json(createSuccessResponse(order));
});

tradingRouter.delete('/order/:orderId', (req, res) => {
  const { orderId } = req.params;

  console.log('[Trading] Cancel order:', orderId);

  // In real implementation, would find and cancel the order
  // For mock, just return success

  const cancelledOrder: Partial<Order> = {
    id: orderId,
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  };

  res.json(createSuccessResponse(cancelledOrder, 'Order cancelled successfully'));
});

tradingRouter.get('/quote', (req, res) => {
  const tokenId = req.query.tokenId as string;
  const side = req.query.side as 'buy' | 'sell';
  const amount = Number(req.query.amount);

  console.log('[Trading] Get quote:', tokenId, side, amount);

  if (!tokenId || !side || !amount) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Missing required parameters: tokenId, side, amount'),
    );
    return;
  }

  const token = getTokenById(tokenId);
  if (!token) {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', `Token '${tokenId}' not found`),
    );
    return;
  }

  const marketData = getMarketDataByTokenId(tokenId);
  if (!marketData) {
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Failed to get market data'),
    );
    return;
  }

  // Calculate quote with slippage estimate
  const slippage = 0.5; // 0.5%
  const slippageMultiplier = side === 'buy' ? 1 + slippage / 100 : 1 - slippage / 100;
  const estimatedPrice = marketData.price * slippageMultiplier;
  const estimatedTotal = amount * estimatedPrice;
  const estimatedFee = estimatedTotal * 0.001; // 0.1% fee

  const quote = {
    tokenId,
    side,
    amount,
    price: marketData.price,
    estimatedPrice,
    estimatedTotal,
    estimatedFee,
    slippage,
    expiresAt: new Date(Date.now() + 30_000).toISOString(), // 30 second validity
  };

  res.json(createSuccessResponse(quote));
});
