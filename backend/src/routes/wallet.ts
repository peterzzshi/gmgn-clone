import { Router } from 'express';

import {
  MOCK_WALLET_BALANCES,
  MOCK_TRANSACTIONS,
  MOCK_ORDERS,
  calculateWalletSummary,
  sortBalancesByValue,
  filterTransactionsByType,
  filterTransactionsByStatus,
  getRecentTransactions,
  filterOrdersByStatus,
} from '@data/wallet';
import {
  createSuccessResponse,
  createPaginatedResponse,
  parsePaginationParams,
  paginate,
} from '@/utils';

import type { TransactionType, TransactionStatus, OrderStatus } from '@/types';

export const walletRouter = Router();

walletRouter.get('/summary', (_req, res) => {
  console.log('[Wallet] Get summary');

  const summary = calculateWalletSummary(MOCK_WALLET_BALANCES);

  res.json(createSuccessResponse(summary));
});

walletRouter.get('/balances', (req, res) => {
  console.log('[Wallet] Get balances');

  const sortOrder = (req.query.order as 'asc' | 'desc') ?? 'desc';

  const balances = sortBalancesByValue(MOCK_WALLET_BALANCES, sortOrder);

  res.json(createSuccessResponse(balances));
});

walletRouter.get('/transactions', (req, res) => {
  console.log('[Wallet] Get transactions');

  const { page, limit } = parsePaginationParams(req.query);
  const type = req.query.type as TransactionType | undefined;
  const status = req.query.status as TransactionStatus | undefined;

  // Apply filters
  let transactions = [...MOCK_TRANSACTIONS];

  if (type) {
    transactions = [...filterTransactionsByType(transactions, type)];
  }

  if (status) {
    transactions = [...filterTransactionsByStatus(transactions, status)];
  }

  // Sort by date (newest first)
  transactions = [...getRecentTransactions(transactions, transactions.length)];

  // Paginate
  const total = transactions.length;
  const paginatedTx = paginate(transactions, page, limit);

  res.json(
    createSuccessResponse(
      createPaginatedResponse(paginatedTx, { page, limit }, total),
    ),
  );
});

walletRouter.get('/orders', (req, res) => {
  console.log('[Wallet] Get orders');

  const { page, limit } = parsePaginationParams(req.query);
  const status = req.query.status as OrderStatus | undefined;

  // Apply filters
  let orders = [...MOCK_ORDERS];

  if (status) {
    orders = [...filterOrdersByStatus(orders, status)];
  }

  // Sort by date (newest first)
  orders = orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Paginate
  const total = orders.length;
  const paginatedOrders = paginate(orders, page, limit);

  res.json(
    createSuccessResponse(
      createPaginatedResponse(paginatedOrders, { page, limit }, total),
    ),
  );
});

walletRouter.get('/orders/pending', (_req, res) => {
  console.log('[Wallet] Get pending orders');

  const pendingOrders = filterOrdersByStatus(MOCK_ORDERS, 'pending');

  res.json(createSuccessResponse(pendingOrders));
});
