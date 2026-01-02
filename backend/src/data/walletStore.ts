import { v4 as uuidv4 } from 'uuid';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import { getTokenById, fetchTokenMarketData } from '@/services/marketData';
import { generateId } from '@/utils';

import type { Order, Transaction } from '@/types';

interface WalletBalance {
  tokenId: string;
  symbol: string;
  name: string;
  logoUrl: string;
  balance: number;
  balanceUsd: number;
  price: number;
  priceChange24h: number;
}

interface UserWallet {
  usdBalance: number;
  assets: Map<string, WalletAsset>;
  transactions: Transaction[];
  orders: Order[];
}

interface WalletAsset {
  tokenId: string;
  symbol: string;
  name: string;
  logoUrl: string;
  amount: number;
}

const walletStore = new Map<string, UserWallet>();

const DEFAULT_USD_BALANCE = 10_000;

const DEFAULT_ASSETS: WalletAsset[] = [
  {
    tokenId: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    logoUrl:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    amount: 5,
  },
];

export const getOrCreateWallet = (userId: string): UserWallet => {
  let wallet = walletStore.get(userId);

  if (!wallet) {
    wallet = {
      usdBalance: DEFAULT_USD_BALANCE,
      assets: new Map(),
      transactions: [],
      orders: [],
    };

    for (const asset of DEFAULT_ASSETS) {
      wallet.assets.set(asset.tokenId, { ...asset });
    }

    walletStore.set(userId, wallet);

    const context = LogContext.create('wallet-store');
    withLogContext(context, () => {
      logger.debug('Created new wallet', { userId });
    });
  }

  return wallet;
};

export const getUsdBalance = (userId: string): number => {
  const wallet = getOrCreateWallet(userId);
  return wallet.usdBalance;
};

export const getTokenBalance = (userId: string, tokenId: string): number => {
  const wallet = getOrCreateWallet(userId);
  return wallet.assets.get(tokenId)?.amount ?? 0;
};

export const getWalletBalances = async (userId: string): Promise<WalletBalance[]> => {
  const wallet = getOrCreateWallet(userId);
  const balances: WalletBalance[] = [];

  for (const asset of wallet.assets.values()) {
    const token = getTokenById(asset.tokenId);
    if (!token) continue;

    const marketData = await fetchTokenMarketData(token);
    const balanceUsd = asset.amount * marketData.price;

    balances.push({
      tokenId: asset.tokenId,
      symbol: asset.symbol,
      name: asset.name,
      logoUrl: asset.logoUrl,
      balance: asset.amount,
      balanceUsd,
      price: marketData.price,
      priceChange24h: marketData.priceChangePercent24h,
    });
  }

  return balances.sort((a, b) => b.balanceUsd - a.balanceUsd);
};

export const getTotalPortfolioValue = async (userId: string): Promise<number> => {
  const wallet = getOrCreateWallet(userId);
  let total = wallet.usdBalance;

  for (const asset of wallet.assets.values()) {
    const token = getTokenById(asset.tokenId);
    if (!token) continue;

    const marketData = await fetchTokenMarketData(token);
    total += asset.amount * marketData.price;
  }

  return total;
};

export const updateBalanceAfterTrade = (
  userId: string,
  side: 'buy' | 'sell',
  tokenId: string,
  amount: number,
  totalUsd: number,
  fee: number,
): boolean => {
  const context = LogContext.create('wallet-store');

  return withLogContext(context, () => {
    const wallet = getOrCreateWallet(userId);
    const token = getTokenById(tokenId);

    if (!token) {
      logger.error('Token not found', { tokenId });
      return false;
    }

    if (side === 'buy') {
      const totalCost = totalUsd + fee;
      if (wallet.usdBalance < totalCost) {
        logger.warn('Insufficient USD balance', {
          available: wallet.usdBalance,
          required: totalCost,
        });
        return false;
      }

      wallet.usdBalance -= totalCost;

      const existingAsset = wallet.assets.get(tokenId);
      if (existingAsset) {
        existingAsset.amount += amount;
      } else {
        wallet.assets.set(tokenId, {
          tokenId,
          symbol: token.symbol,
          name: token.name,
          logoUrl: token.logoUrl,
          amount,
        });
      }

      logger.debug('Buy executed', { totalCost, amount, symbol: token.symbol });
    } else {
      const existingAsset = wallet.assets.get(tokenId);
      if (!existingAsset || existingAsset.amount < amount) {
        const currentAmount = existingAsset?.amount ?? 0;
        logger.warn('Insufficient token balance', { available: currentAmount, required: amount });
        return false;
      }

      existingAsset.amount -= amount;

      if (existingAsset.amount <= 0) {
        wallet.assets.delete(tokenId);
      }

      wallet.usdBalance += totalUsd - fee;

      logger.debug('Sell executed', {
        totalReceived: totalUsd - fee,
        amount,
        symbol: token.symbol,
      });
    }

    return true;
  });
};

export const addTransaction = (userId: string, transaction: Transaction): void => {
  const context = LogContext.create('wallet-store');

  withLogContext(context, () => {
    const wallet = getOrCreateWallet(userId);
    wallet.transactions.unshift(transaction);

    if (wallet.transactions.length > 100) {
      wallet.transactions = wallet.transactions.slice(0, 100);
    }

    logger.debug('Added transaction', { transactionId: transaction.id });
  });
};

export const getTransactions = (userId: string, limit: number = 20): Transaction[] => {
  const wallet = getOrCreateWallet(userId);
  return wallet.transactions.slice(0, limit);
};

export const addOrder = (userId: string, order: Order): void => {
  const context = LogContext.create('wallet-store');

  withLogContext(context, () => {
    const wallet = getOrCreateWallet(userId);
    wallet.orders.unshift(order);

    if (wallet.orders.length > 100) {
      wallet.orders = wallet.orders.slice(0, 100);
    }

    logger.debug('Added order', { orderId: order.id });
  });
};

export const getOrders = (userId: string, status?: Order['status']): Order[] => {
  const wallet = getOrCreateWallet(userId);
  let orders = [...wallet.orders];

  if (status) {
    orders = orders.filter((o) => o.status === status);
  }

  return orders;
};

export const updateOrderStatus = (
  userId: string,
  orderId: string,
  status: Order['status'],
): Order | null => {
  const wallet = getOrCreateWallet(userId);
  const orderIndex = wallet.orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    return null;
  }

  const existingOrder = wallet.orders[orderIndex];
  if (!existingOrder) {
    return null;
  }

  const updatedOrder: Order = {
    id: existingOrder.id,
    userId: existingOrder.userId,
    tokenId: existingOrder.tokenId,
    side: existingOrder.side,
    type: existingOrder.type,
    status,
    amount: existingOrder.amount,
    price: existingOrder.price,
    filledAmount: existingOrder.filledAmount,
    filledPrice: existingOrder.filledPrice,
    fee: existingOrder.fee,
    createdAt: existingOrder.createdAt,
    updatedAt: new Date().toISOString(),
  };

  wallet.orders[orderIndex] = updatedOrder;
  return updatedOrder;
};

export const createTransactionFromOrder = (
  order: Order,
  token: { symbol: string },
): Transaction => {
  const total = order.filledAmount * order.filledPrice;

  return {
    id: generateId('tx'),
    type: 'swap',
    tokenId: order.tokenId,
    symbol: token.symbol,
    amount: order.side === 'buy' ? order.filledAmount : -order.filledAmount,
    amountUsd: order.side === 'buy' ? total : -total,
    fee: order.fee,
    txHash: `0x${uuidv4().replace(/-/g, '').slice(0, 64)}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
};

export const resetWallet = (userId: string): void => {
  const context = LogContext.create('wallet-store');

  withLogContext(context, () => {
    walletStore.delete(userId);
    logger.info('Reset wallet', { userId });
  });
};

export const getStoreStats = (): { userCount: number; totalTransactions: number } => {
  let totalTransactions = 0;
  for (const wallet of walletStore.values()) {
    totalTransactions += wallet.transactions.length;
  }

  return {
    userCount: walletStore.size,
    totalTransactions,
  };
};
