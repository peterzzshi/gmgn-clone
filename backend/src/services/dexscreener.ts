import axios from 'axios';

import { logger } from '@/logger/logger';

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';
const REQUEST_TIMEOUT = 10000;

export interface DexScreenerPair {
  readonly chainId: string;
  readonly dexId: string;
  readonly url: string;
  readonly pairAddress: string;
  readonly baseToken: {
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
  };
  readonly priceNative: string;
  readonly priceUsd: string;
  readonly volume: {
    readonly h24: number;
  };
  readonly priceChange: {
    readonly h24: number;
  };
  readonly liquidity: {
    readonly usd: number;
  };
  readonly fdv: number;
  readonly marketCap: number;
}

export interface DexScreenerResponse {
  readonly pairs: readonly DexScreenerPair[] | null;
}

const buildTokenUrl = (tokenAddress: string): string =>
  `${DEXSCREENER_BASE_URL}/dex/tokens/${tokenAddress}`;

const matchesChain =
  (chainId: string) =>
  (pair: DexScreenerPair): boolean =>
    pair.chainId.toLowerCase() === chainId.toLowerCase();

const getLiquidityUsd = (pair: DexScreenerPair): number => pair.liquidity.usd;

const selectHighestLiquidityPair = (pairs: readonly DexScreenerPair[]): DexScreenerPair =>
  pairs.reduce((prev, current) =>
    getLiquidityUsd(current) > getLiquidityUsd(prev) ? current : prev,
  );

const filterByChain = (
  pairs: readonly DexScreenerPair[],
  chainId: string,
): readonly DexScreenerPair[] => pairs.filter(matchesChain(chainId));

const fetchPairData = async (tokenAddress: string): Promise<DexScreenerResponse> => {
  const response = await axios.get<DexScreenerResponse>(buildTokenUrl(tokenAddress), {
    timeout: REQUEST_TIMEOUT,
    headers: {
      Accept: 'application/json',
    },
  });
  return response.data;
};

export const fetchDexScreenerData = async (
  tokenAddress: string,
  chainId = 'solana',
): Promise<DexScreenerPair | null> => {
  try {
    const data = await fetchPairData(tokenAddress);

    if (!data.pairs || data.pairs.length === 0) {
      logger.debug(`No DexScreener pairs found for token: ${tokenAddress}`);
      return null;
    }

    const chainPairs = filterByChain(data.pairs, chainId);

    if (chainPairs.length === 0) {
      logger.debug(`No ${chainId} pairs found for token: ${tokenAddress}`);
      return null;
    }

    return selectHighestLiquidityPair(chainPairs);
  } catch {
    logger.debug(`Failed to fetch DexScreener data for ${tokenAddress}`);
    return null;
  }
};

const createPairMap = (
  results: readonly PromiseSettledResult<DexScreenerPair | null>[],
  addresses: readonly string[],
): ReadonlyMap<string, DexScreenerPair> => {
  const dataMap = new Map<string, DexScreenerPair>();

  results.forEach((result, index) => {
    const address = addresses[index];
    if (result.status === 'fulfilled' && result.value && address) {
      dataMap.set(address, result.value);
    }
  });

  return dataMap;
};

export const fetchMultipleDexScreenerData = async (
  tokenAddresses: readonly string[],
  chainId = 'solana',
): Promise<ReadonlyMap<string, DexScreenerPair>> => {
  const results = await Promise.allSettled(
    tokenAddresses.map(address => fetchDexScreenerData(address, chainId)),
  );

  const dataMap = createPairMap(results, tokenAddresses);

  logger.debug(`📊 Fetched DexScreener data for ${dataMap.size}/${tokenAddresses.length} tokens`);

  return dataMap;
};
