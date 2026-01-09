/**
 * Pyth Network Price Feed IDs for Solana Mainnet
 * Find more at: https://pyth.network/developers/price-feed-ids
 * Last verified: December 31, 2025
 */

export const PYTH_PRICE_FEEDS: Record<string, string> = {
  SOL: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  BONK: '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
  WIF: '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
  JUP: '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
  POPCAT: '0x8963217838ab4cf5cadc172203c1f0b763fbaa45f346d8ee50ba994bbcac3026',
};

/**
 * Get price feed ID by token symbol
 */
export const getPriceFeedId = (symbol: string): string | undefined => {
  return PYTH_PRICE_FEEDS[symbol.toUpperCase()];
};

/**
 * Get all configured token symbols
 */
export const getSupportedTokenSymbols = (): string[] => {
  return Object.keys(PYTH_PRICE_FEEDS);
};

/**
 * Check if a token has a price feed configured
 */
export const hasPriceFeed = (symbol: string): boolean => {
  return symbol.toUpperCase() in PYTH_PRICE_FEEDS;
};
