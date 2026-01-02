import type { Trader, CopyPosition, CopyTradeSettings } from '@/types';

export const MOCK_TRADERS: readonly Trader[] = [
  {
    id: 'trader-1',
    address: '7xKX...3nPq',
    displayName: 'SolanaWhale',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=whale',
    bio: 'Full-time DeFi trader. Focus on SOL ecosystem gems. NFA.',
    followers: 12_450,
    pnl7d: 45_230,
    pnl30d: 182_400,
    pnlPercent7d: 23.5,
    pnlPercent30d: 89.2,
    winRate: 72.4,
    totalTrades: 1_245,
    avgHoldTime: 14_400,
    isVerified: true,
    tags: ['Top Trader', 'Whale', 'DeFi'],
  },
  {
    id: 'trader-2',
    address: '3mKL...9xRt',
    displayName: 'MemeKing',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=meme',
    bio: 'Early meme coin hunter. DYOR. High risk, high reward.',
    followers: 8_920,
    pnl7d: 28_100,
    pnl30d: -15_600,
    pnlPercent7d: 156.8,
    pnlPercent30d: -12.4,
    winRate: 45.2,
    totalTrades: 892,
    avgHoldTime: 3_600,
    isVerified: true,
    tags: ['Meme Hunter', 'High Risk'],
  },
  {
    id: 'trader-3',
    address: '9pQR...2wXz',
    displayName: 'DiamondHands',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=diamond',
    bio: 'Long-term holder. Blue chip tokens only. Patience pays.',
    followers: 5_640,
    pnl7d: 8_450,
    pnl30d: 95_200,
    pnlPercent7d: 4.2,
    pnlPercent30d: 47.6,
    winRate: 68.9,
    totalTrades: 156,
    avgHoldTime: 604_800,
    isVerified: false,
    tags: ['Holder', 'Blue Chip'],
  },
  {
    id: 'trader-4',
    address: '5tYU...7mNb',
    displayName: 'ScalpMaster',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=scalp',
    bio: 'Quick in, quick out. Scalping is an art form.',
    followers: 15_780,
    pnl7d: 12_890,
    pnl30d: 67_450,
    pnlPercent7d: 8.9,
    pnlPercent30d: 42.3,
    winRate: 61.5,
    totalTrades: 4_567,
    avgHoldTime: 900,
    isVerified: true,
    tags: ['Scalper', 'High Frequency'],
  },
  {
    id: 'trader-5',
    address: '2aBC...4dEf',
    displayName: 'NFTDegen',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=nft',
    bio: 'NFT & token trader. Community alpha. LFG!',
    followers: 3_210,
    pnl7d: -5_670,
    pnl30d: 23_400,
    pnlPercent7d: -8.4,
    pnlPercent30d: 34.7,
    winRate: 52.1,
    totalTrades: 678,
    avgHoldTime: 86_400,
    isVerified: false,
    tags: ['NFT', 'Community'],
  },
  {
    id: 'trader-6',
    address: '8gHI...1jKl',
    displayName: 'AlphaSeeker',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alpha',
    bio: 'On-chain analysis. Finding alpha before the crowd.',
    followers: 9_870,
    pnl7d: 34_560,
    pnl30d: 145_800,
    pnlPercent7d: 18.7,
    pnlPercent30d: 78.9,
    winRate: 65.3,
    totalTrades: 423,
    avgHoldTime: 43_200,
    isVerified: true,
    tags: ['Alpha', 'On-chain', 'Analyst'],
  },
] as const;

export const MOCK_COPY_POSITIONS: readonly CopyPosition[] = [
  {
    id: 'pos-1',
    traderId: 'trader-1',
    userId: 'user-1',
    tokenId: 'bonk',
    entryPrice: 0.00002534,
    currentPrice: 0.00002834,
    amount: 50_000_000,
    pnl: 150,
    pnlPercent: 11.84,
    status: 'open',
    openedAt: new Date(Date.now() - 86_400_000).toISOString(),
    closedAt: null,
  },
  {
    id: 'pos-2',
    traderId: 'trader-1',
    userId: 'user-1',
    tokenId: 'wif',
    entryPrice: 2.12,
    currentPrice: 2.45,
    amount: 100,
    pnl: 33,
    pnlPercent: 15.57,
    status: 'open',
    openedAt: new Date(Date.now() - 172_800_000).toISOString(),
    closedAt: null,
  },
  {
    id: 'pos-3',
    traderId: 'trader-4',
    userId: 'user-1',
    tokenId: 'jup',
    entryPrice: 0.95,
    currentPrice: 0.92,
    amount: 500,
    pnl: -15,
    pnlPercent: -3.16,
    status: 'open',
    openedAt: new Date(Date.now() - 3_600_000).toISOString(),
    closedAt: null,
  },
] as const;

export const getTraderById = (traderId: string): Trader | undefined =>
  MOCK_TRADERS.find((trader) => trader.id === traderId);

export const sortTradersByField = (
  traders: readonly Trader[],
  field: 'pnlPercent7d' | 'pnlPercent30d' | 'followers' | 'winRate',
  order: 'asc' | 'desc' = 'desc',
): readonly Trader[] => {
  const multiplier = order === 'desc' ? -1 : 1;
  return [...traders].sort((a, b) => multiplier * (a[field] - b[field]));
};

export const filterVerifiedTraders = (traders: readonly Trader[]): readonly Trader[] =>
  traders.filter((trader) => trader.isVerified);

export const filterTradersByTag = (traders: readonly Trader[], tag: string): readonly Trader[] =>
  traders.filter((trader) => trader.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())));

export const searchTraders = (traders: readonly Trader[], query: string): readonly Trader[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return traders;
  }
  return traders.filter(
    (trader) =>
      trader.displayName.toLowerCase().includes(normalizedQuery) ||
      trader.address.toLowerCase().includes(normalizedQuery),
  );
};

export const getPositionsByUserId = (
  positions: readonly CopyPosition[],
  userId: string,
): readonly CopyPosition[] => positions.filter((position) => position.userId === userId);

export const getPositionsByTraderId = (
  positions: readonly CopyPosition[],
  traderId: string,
): readonly CopyPosition[] => positions.filter((position) => position.traderId === traderId);

export const filterOpenPositions = (positions: readonly CopyPosition[]): readonly CopyPosition[] =>
  positions.filter((position) => position.status === 'open');

export const calculateTotalPnl = (positions: readonly CopyPosition[]): number =>
  positions.reduce((total, position) => total + position.pnl, 0);

export const createDefaultCopySettings = (traderId: string): CopyTradeSettings => ({
  traderId,
  isActive: false,
  maxPositionSize: 100,
  copyRatio: 0.1,
  stopLoss: 10,
  takeProfit: 50,
  maxDailyTrades: 10,
});
