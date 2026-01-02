import { logger } from '@/logger/logger';

import { fetchDexScreenerData } from './dexscreener';

import type { Token, TokenMarketData, TokenWithMarket } from '@/types';

/**
 * Token definitions with Pyth price feed support
 * Metadata only - prices fetched from Pyth/DexScreener
 */
export const SUPPORTED_TOKENS: readonly Token[] = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoUrl:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
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
    logoUrl:
      'https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betiez2aotjqqzlvtygt4.ipfs.nftstorage.link',
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
    id: 'popcat',
    symbol: 'POPCAT',
    name: 'Popcat',
    address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    decimals: 9,
    logoUrl:
      'https://bafkreidvkvuzyslw5jh5z242lgzwzhbi2kxxnpkic5wsvyno5ikvpr7reu.ipfs.nftstorage.link',
    chain: 'solana',
  },
] as const;

/**
 * Get placeholder market data (to be replaced by real data from APIs)
 */
const getPlaceholderMarketData = (tokenId: string): TokenMarketData => ({
  tokenId,
  price: 0,
  priceChange24h: 0,
  priceChangePercent24h: 0,
  volume24h: 0,
  marketCap: 0,
  liquidity: 0,
  holders: 0,
  updatedAt: new Date().toISOString(),
});

/**
 * Fetch real market data from DexScreener for a single token
 */
export const fetchTokenMarketData = async (token: Token): Promise<TokenMarketData> => {
  try {
    const dexData = await fetchDexScreenerData(token.address, token.chain);

    if (!dexData) {
      logger.warn(`No DexScreener data for ${token.symbol}, using placeholder`);
      return getPlaceholderMarketData(token.id);
    }

    return {
      tokenId: token.id,
      price: parseFloat(dexData.priceUsd) || 0,
      priceChange24h: (parseFloat(dexData.priceUsd) * dexData.priceChange.h24) / 100 || 0,
      priceChangePercent24h: dexData.priceChange.h24 || 0,
      volume24h: dexData.volume.h24 || 0,
      marketCap: dexData.marketCap || 0,
      liquidity: dexData.liquidity?.usd || 0,
      holders: 0, // Not provided by DexScreener
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Failed to fetch market data for ${token.symbol}:`, error);
    return getPlaceholderMarketData(token.id);
  }
};

/**
 * Get all tokens (metadata only)
 */
export const getAllTokens = (): readonly Token[] => SUPPORTED_TOKENS;

/**
 * Get token by ID
 */
export const getTokenById = (tokenId: string): Token | undefined =>
  SUPPORTED_TOKENS.find((token) => token.id === tokenId);

/**
 * Get all tokens with market data from DexScreener
 */
export const getAllTokensWithMarket = async (): Promise<readonly TokenWithMarket[]> => {
  const marketDataPromises = SUPPORTED_TOKENS.map((token) =>
    fetchTokenMarketData(token).then((market) => ({ ...token, market })),
  );

  const tokens = await Promise.all(marketDataPromises);
  logger.info(`Fetched market data for ${tokens.length} tokens`);
  return tokens;
};

/**
 * Get single token with market data
 */
export const getTokenWithMarket = async (tokenId: string): Promise<TokenWithMarket | null> => {
  const token = getTokenById(tokenId);
  if (!token) return null;

  const market = await fetchTokenMarketData(token);
  return { ...token, market };
};

/**
 * Sort tokens by field
 */
export const sortTokensBy = (
  tokens: readonly TokenWithMarket[],
  field: 'marketCap' | 'volume24h' | 'priceChangePercent24h',
  order: 'asc' | 'desc' = 'desc',
): readonly TokenWithMarket[] => {
  const multiplier = order === 'desc' ? -1 : 1;
  return [...tokens].sort((a, b) => multiplier * (a.market[field] - b.market[field]));
};

/**
 * Filter tokens by search query
 */
export const filterTokensByQuery = (
  tokens: readonly TokenWithMarket[],
  query: string,
): readonly TokenWithMarket[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return tokens;

  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(normalizedQuery) ||
      token.name.toLowerCase().includes(normalizedQuery) ||
      token.address.toLowerCase().includes(normalizedQuery),
  );
};
