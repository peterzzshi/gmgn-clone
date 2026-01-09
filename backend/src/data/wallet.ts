import type { WalletBalance, WalletSummary, Transaction, Order } from '@/types';

export const MOCK_WALLET_BALANCES: readonly WalletBalance[] = [
  {
    tokenId: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    logoUrl:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    balance: 12.5,
    balanceUsd: 2_230.63,
    price: 178.45,
    priceChange24h: 3.02,
  },
  {
    tokenId: 'bonk',
    symbol: 'BONK',
    name: 'Bonk',
    logoUrl: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    balance: 85_000_000,
    balanceUsd: 2_408.9,
    price: 0.00002834,
    priceChange24h: 5.82,
  },
  {
    tokenId: 'jup',
    symbol: 'JUP',
    name: 'Jupiter',
    logoUrl: 'https://static.jup.ag/jup/icon.png',
    balance: 1_250,
    balanceUsd: 1_150.0,
    price: 0.92,
    priceChange24h: 4.54,
  },
  {
    tokenId: 'wif',
    symbol: 'WIF',
    name: 'dogwifhat',
    logoUrl:
      'https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betiez2aotjqqzlvtygt4.ipfs.nftstorage.link',
    balance: 320,
    balanceUsd: 784.0,
    price: 2.45,
    priceChange24h: -4.67,
  },
] as const;

export const MOCK_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'tx-1',
    type: 'swap',
    tokenId: 'bonk',
    symbol: 'BONK',
    amount: 10_000_000,
    amountUsd: 283.4,
    fee: 0.25,
    txHash: '5xYz...8pQr',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'tx-2',
    type: 'swap',
    tokenId: 'sol',
    symbol: 'SOL',
    amount: -2.5,
    amountUsd: -446.13,
    fee: 0.15,
    txHash: '9aBc...2dEf',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
  },
  {
    id: 'tx-3',
    type: 'deposit',
    tokenId: 'sol',
    symbol: 'SOL',
    amount: 5.0,
    amountUsd: 892.25,
    fee: 0,
    txHash: '3gHi...6jKl',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'tx-4',
    type: 'swap',
    tokenId: 'jup',
    symbol: 'JUP',
    amount: 500,
    amountUsd: 460.0,
    fee: 0.18,
    txHash: '7mNo...0pQr',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
  },
  {
    id: 'tx-5',
    type: 'withdraw',
    tokenId: 'sol',
    symbol: 'SOL',
    amount: -1.0,
    amountUsd: -178.45,
    fee: 0.001,
    txHash: '1sTu...4vWx',
    status: 'pending',
    createdAt: new Date(Date.now() - 1_800_000).toISOString(),
  },
] as const;

export const MOCK_ORDERS: readonly Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    tokenId: 'bonk',
    side: 'buy',
    type: 'market',
    status: 'filled',
    amount: 10_000_000,
    price: 0.00002834,
    filledAmount: 10_000_000,
    filledPrice: 0.00002831,
    fee: 0.71,
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3_598_000).toISOString(),
  },
  {
    id: 'order-2',
    userId: 'user-1',
    tokenId: 'wif',
    side: 'sell',
    type: 'limit',
    status: 'pending',
    amount: 50,
    price: 2.6,
    filledAmount: 0,
    filledPrice: 0,
    fee: 0,
    createdAt: new Date(Date.now() - 1_800_000).toISOString(),
    updatedAt: new Date(Date.now() - 1_800_000).toISOString(),
  },
  {
    id: 'order-3',
    userId: 'user-1',
    tokenId: 'jup',
    side: 'buy',
    type: 'limit',
    status: 'cancelled',
    amount: 200,
    price: 0.85,
    filledAmount: 0,
    filledPrice: 0,
    fee: 0,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 43_200_000).toISOString(),
  },
] as const;

export const calculateWalletSummary = (balances: readonly WalletBalance[]): WalletSummary => {
  const totalBalanceUsd = balances.reduce((sum, b) => sum + b.balanceUsd, 0);

  const totalPnl24h = balances.reduce((sum, b) => {
    const previousValue = b.balanceUsd / (1 + b.priceChange24h / 100);
    return sum + (b.balanceUsd - previousValue);
  }, 0);

  const totalPnlPercent24h =
    totalBalanceUsd > 0 ? (totalPnl24h / (totalBalanceUsd - totalPnl24h)) * 100 : 0;

  return {
    totalBalanceUsd,
    totalPnl24h,
    totalPnlPercent24h,
    balances,
  };
};

export const getBalanceByTokenId = (
  balances: readonly WalletBalance[],
  tokenId: string,
): WalletBalance | undefined => balances.find(balance => balance.tokenId === tokenId);

export const sortBalancesByValue = (
  balances: readonly WalletBalance[],
  order: 'asc' | 'desc' = 'desc',
): readonly WalletBalance[] => {
  const multiplier = order === 'desc' ? -1 : 1;
  return [...balances].sort((a, b) => multiplier * (a.balanceUsd - b.balanceUsd));
};

export const filterTransactionsByType = (
  transactions: readonly Transaction[],
  type: Transaction['type'],
): readonly Transaction[] => transactions.filter(tx => tx.type === type);

export const filterTransactionsByStatus = (
  transactions: readonly Transaction[],
  status: Transaction['status'],
): readonly Transaction[] => transactions.filter(tx => tx.status === status);

export const getRecentTransactions = (
  transactions: readonly Transaction[],
  limit: number,
): readonly Transaction[] =>
  [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

export const filterOrdersByStatus = (
  orders: readonly Order[],
  status: Order['status'],
): readonly Order[] => orders.filter(order => order.status === status);

export const getOrdersByUserId = (orders: readonly Order[], userId: string): readonly Order[] =>
  orders.filter(order => order.userId === userId);
