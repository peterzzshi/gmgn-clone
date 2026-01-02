import axios from 'axios';

import { logger } from '@/logger/logger';

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';

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

/**
 * Fetch token data from DexScreener
 * @param tokenAddress - The token contract address
 * @param chainId - The chain (default: 'solana')
 */
export const fetchDexScreenerData = async (
  tokenAddress: string,
  chainId: string = 'solana',
): Promise<DexScreenerPair | null> => {
  try {
    const response = await axios.get<DexScreenerResponse>(
      `${DEXSCREENER_BASE_URL}/dex/tokens/${tokenAddress}`,
      {
        timeout: 5000,
      },
    );

    if (!response.data.pairs || response.data.pairs.length === 0) {
      logger.warn(`⚠️ No DexScreener pairs found for token: ${tokenAddress}`);
      return null;
    }

    // Filter by chain and get the pair with the highest liquidity
    const chainPairs = response.data.pairs.filter(
      (pair) => pair.chainId.toLowerCase() === chainId.toLowerCase(),
    );

    if (chainPairs.length === 0) {
      logger.warn(`⚠️ No ${chainId} pairs found for token: ${tokenAddress}`);
      return null;
    }

    // Return pair with the highest liquidity

    return chainPairs.reduce((prev, current) =>
      (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? current : prev,
    );
  } catch (error) {
    logger.error(`❌ Failed to fetch DexScreener data for ${tokenAddress}:`, error);
    return null;
  }
};

/**
 * Fetch multiple tokens in parallel
 */
export const fetchMultipleDexScreenerData = async (
  tokenAddresses: readonly string[],
  chainId: string = 'solana',
): Promise<Map<string, DexScreenerPair>> => {
  const results = await Promise.allSettled(
    tokenAddresses.map((address) => fetchDexScreenerData(address, chainId)),
  );

  const dataMap = new Map<string, DexScreenerPair>();

  results.forEach((result, index) => {
    const address = tokenAddresses[index];
    if (result.status === 'fulfilled' && result.value && address) {
      dataMap.set(address, result.value);
    }
  });

  logger.debug(`📊 Fetched DexScreener data for ${dataMap.size}/${tokenAddresses.length} tokens`);

  return dataMap;
};
