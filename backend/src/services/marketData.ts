import { logger } from '@/logger/logger';

import { fetchDexScreenerData } from './dexscreener';
import { getTokenMetadata } from './jupiterTokenList';

import type { Token, TokenMarketData, TokenWithMarket } from '@/types';

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

const FALLBACK_PRICES: Readonly<Record<string, number>> = {
  sol: 125.0,
  bonk: 0.000025,
  wif: 2.5,
  jup: 1.0,
  popcat: 0.8,
};

const getFallbackPrice = (tokenId: string): number => FALLBACK_PRICES[tokenId] ?? 1.0;

const createPlaceholderMarketData = (tokenId: string): TokenMarketData => {
  const price = getFallbackPrice(tokenId);
  const priceChange = price * 0.02;

  return {
    tokenId,
    price,
    priceChange24h: priceChange,
    priceChangePercent24h: 2.0,
    volume24h: 1000000,
    marketCap: 10000000,
    liquidity: 500000,
    holders: 0,
    updatedAt: new Date().toISOString(),
  };
};

const calculatePriceChange = (priceUsd: string, changePercent: number): number =>
  (parseFloat(priceUsd) * changePercent) / 100 || 0;

const transformDexDataToMarketData = (
  tokenId: string,
  dexData: Awaited<ReturnType<typeof fetchDexScreenerData>>,
): TokenMarketData => {
  if (!dexData) {
    return createPlaceholderMarketData(tokenId);
  }

  return {
    tokenId,
    price: parseFloat(dexData.priceUsd) || 0,
    priceChange24h: calculatePriceChange(dexData.priceUsd, dexData.priceChange.h24),
    priceChangePercent24h: dexData.priceChange.h24 || 0,
    volume24h: dexData.volume.h24 || 0,
    marketCap: dexData.marketCap || 0,
    liquidity: dexData.liquidity.usd,
    holders: 0,
    updatedAt: new Date().toISOString(),
  };
};

export const fetchTokenMarketData = async (token: Token): Promise<TokenMarketData> => {
  const dexData = await fetchDexScreenerData(token.address, token.chain);

  if (!dexData) {
    logger.debug(`No DexScreener data for ${token.symbol}, using fallback`);
  }

  return transformDexDataToMarketData(token.id, dexData);
};

const enrichWithJupiterLogo = async (token: Token): Promise<Token> => {
  const jupiterData = await getTokenMetadata(token.address);

  if (jupiterData?.logoURI) {
    logger.debug(`Enriched ${token.symbol} with Jupiter logo`);
    return { ...token, logoUrl: jupiterData.logoURI };
  }

  logger.debug(`Using hardcoded logo for ${token.symbol}`);
  return token;
};

const enrichTokenWithMarket = async (token: Token): Promise<TokenWithMarket> => {
  const enrichedToken = await enrichWithJupiterLogo(token);
  const market = await fetchTokenMarketData(enrichedToken);
  return { ...enrichedToken, market };
};

export const getAllTokens = (): readonly Token[] => SUPPORTED_TOKENS;

export const getTokenById = (tokenId: string): Token | undefined =>
  SUPPORTED_TOKENS.find(token => token.id === tokenId);

export const getAllTokensWithMarket = async (): Promise<readonly TokenWithMarket[]> => {
  const tokens = await Promise.all(SUPPORTED_TOKENS.map(enrichTokenWithMarket));
  logger.info(`Fetched market data for ${tokens.length} tokens (with Jupiter logos)`);
  return tokens;
};

export const getTokenWithMarket = async (tokenId: string): Promise<TokenWithMarket | null> => {
  const token = getTokenById(tokenId);
  return token ? enrichTokenWithMarket(token) : null;
};

const compareByField =
  (field: 'marketCap' | 'volume24h' | 'priceChangePercent24h', multiplier: number) =>
  (a: TokenWithMarket, b: TokenWithMarket): number =>
    multiplier * (a.market[field] - b.market[field]);

export const sortTokensBy = (
  tokens: readonly TokenWithMarket[],
  field: 'marketCap' | 'volume24h' | 'priceChangePercent24h',
  order: 'asc' | 'desc' = 'desc',
): readonly TokenWithMarket[] => {
  const multiplier = order === 'desc' ? -1 : 1;
  return [...tokens].sort(compareByField(field, multiplier));
};

const normalizeQuery = (query: string): string => query.toLowerCase().trim();

const matchesQuery =
  (query: string) =>
  (token: TokenWithMarket): boolean => {
    const normalized = normalizeQuery(query);
    return (
      token.symbol.toLowerCase().includes(normalized) ||
      token.name.toLowerCase().includes(normalized) ||
      token.address.toLowerCase().includes(normalized)
    );
  };

export const filterTokensByQuery = (
  tokens: readonly TokenWithMarket[],
  query: string,
): readonly TokenWithMarket[] => {
  const normalized = normalizeQuery(query);
  return normalized ? tokens.filter(matchesQuery(query)) : tokens;
};

export const enrichTokenWithJupiterMetadata = enrichWithJupiterLogo;
