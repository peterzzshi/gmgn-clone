import type { Token, TokenMarketData, TokenWithMarket } from '@/types';

export const MOCK_TOKENS: readonly Token[] = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    chain: 'solana',
  },
  {
    id: 'bonk',
    symbol: 'BONK',
    name: 'Bonk',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    logoUrl: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    chain: 'solana',
  },
  {
    id: 'wif',
    symbol: 'WIF',
    name: 'dogwifhat',
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    logoUrl: 'https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betiez2aotjqqzlvtygt4.ipfs.nftstorage.link',
    chain: 'solana',
  },
  {
    id: 'jup',
    symbol: 'JUP',
    name: 'Jupiter',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoUrl: 'https://static.jup.ag/jup/icon.png',
    chain: 'solana',
  },
  {
    id: 'ray',
    symbol: 'RAY',
    name: 'Raydium',
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    chain: 'solana',
  },
  {
    id: 'orca',
    symbol: 'ORCA',
    name: 'Orca',
    address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
    chain: 'solana',
  },
  {
    id: 'popcat',
    symbol: 'POPCAT',
    name: 'Popcat',
    address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    decimals: 9,
    logoUrl: 'https://bafkreidvkvuzyslw5jh5z242lgzwzhbi2kxxnpkic5wsvyno5ikvpr7reu.ipfs.nftstorage.link',
    chain: 'solana',
  },
  {
    id: 'render',
    symbol: 'RENDER',
    name: 'Render Token',
    address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png',
    chain: 'solana',
  },
] as const;

const generateMarketData = (
  tokenId: string,
  basePrice: number,
  baseChange: number,
  volume: number,
  marketCap: number,
  liquidity: number,
  holders: number,
): TokenMarketData => {
  const variance = 0.02; // 2% variance
  const priceMultiplier = 1 + (Math.random() - 0.5) * variance;
  const price = basePrice * priceMultiplier;
  const priceChange = baseChange + (Math.random() - 0.5) * 2;

  return {
    tokenId,
    price,
    priceChange24h: priceChange,
    priceChangePercent24h: (priceChange / (price - priceChange)) * 100,
    volume24h: volume * (1 + (Math.random() - 0.5) * 0.1),
    marketCap,
    liquidity,
    holders,
    updatedAt: new Date().toISOString(),
  };
};

export const getMarketData = (): readonly TokenMarketData[] => [
  generateMarketData('sol', 178.45, 5.23, 2_450_000_000, 82_000_000_000, 450_000_000, 2_500_000),
  generateMarketData('bonk', 0.00002834, 0.00000156, 180_000_000, 1_800_000_000, 45_000_000, 850_000),
  generateMarketData('wif', 2.45, -0.12, 320_000_000, 2_400_000_000, 85_000_000, 420_000),
  generateMarketData('jup', 0.92, 0.04, 95_000_000, 1_250_000_000, 65_000_000, 380_000),
  generateMarketData('ray', 4.78, 0.23, 42_000_000, 720_000_000, 28_000_000, 145_000),
  generateMarketData('orca', 3.92, -0.08, 18_000_000, 280_000_000, 22_000_000, 95_000),
  generateMarketData('popcat', 0.78, 0.15, 125_000_000, 760_000_000, 32_000_000, 185_000),
  generateMarketData('render', 7.24, 0.42, 85_000_000, 2_800_000_000, 48_000_000, 125_000),
];

export const getTokenById = (tokenId: string): Token | undefined =>
  MOCK_TOKENS.find((token) => token.id === tokenId);

export const getMarketDataByTokenId = (tokenId: string): TokenMarketData | undefined =>
  getMarketData().find((market) => market.tokenId === tokenId);

export const combineTokenWithMarket = (token: Token): TokenWithMarket | null => {
  const marketData = getMarketDataByTokenId(token.id);
  if (!marketData) {
    return null;
  }
  return { ...token, market: marketData };
};

export const getAllTokensWithMarket = (): readonly TokenWithMarket[] =>
  MOCK_TOKENS
    .map(combineTokenWithMarket)
    .filter((token): token is TokenWithMarket => token !== null);

export const sortTokensBy = (
  tokens: readonly TokenWithMarket[],
  field: 'marketCap' | 'volume24h' | 'priceChangePercent24h',
  order: 'asc' | 'desc' = 'desc',
): readonly TokenWithMarket[] => {
  const multiplier = order === 'desc' ? -1 : 1;
  return [...tokens].sort((a, b) => multiplier * (a.market[field] - b.market[field]));
};

export const filterTokensByQuery = (
  tokens: readonly TokenWithMarket[],
  query: string,
): readonly TokenWithMarket[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return tokens;
  }
  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(normalizedQuery) ||
      token.name.toLowerCase().includes(normalizedQuery) ||
      token.address.toLowerCase().includes(normalizedQuery),
  );
};
