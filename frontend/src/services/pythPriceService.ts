import { HermesClient } from '@pythnetwork/hermes-client';

import { getPriceFeedId, getSupportedTokenSymbols } from '@/config/pythFeeds';

const HERMES_ENDPOINT = 'https://hermes.pyth.network';

const hermesClient = new HermesClient(HERMES_ENDPOINT);

interface PythPriceFeed {
  readonly id: string;
  readonly price: {
    readonly price: string;
    readonly conf: string;
    readonly expo: number;
    readonly publish_time: number;
  };
}

interface PythStreamData {
  readonly binary?: unknown;
  readonly parsed?: readonly PythPriceFeed[];
}

export interface PythPriceData {
  readonly tokenSymbol: string;
  readonly price: number;
  readonly confidence: number;
  readonly timestamp: number;
  readonly publishTime: number;
}

const normalizeFeedId = (feedId: string): string => feedId.toLowerCase().replace('0x', '');

const createFeedIdMap = (symbols: readonly string[]): ReadonlyMap<string, string> =>
  new Map(
    symbols
      .map(symbol => ({ symbol, feedId: getPriceFeedId(symbol) }))
      .filter((entry): entry is { symbol: string; feedId: string } => entry.feedId !== undefined)
      .map(({ symbol, feedId }) => [normalizeFeedId(feedId), symbol] as const),
  );

const calculatePrice = (rawPrice: string, exponent: number): number =>
  Number(rawPrice) * Math.pow(10, exponent);

const transformPriceFeed = (
  feed: PythPriceFeed,
  symbol: string,
  timestamp: number,
): PythPriceData => ({
  tokenSymbol: symbol,
  price: calculatePrice(feed.price.price, feed.price.expo),
  confidence: calculatePrice(feed.price.conf, feed.price.expo),
  timestamp,
  publishTime: feed.price.publish_time * 1000,
});

const parsePriceFeeds = (
  feeds: readonly PythPriceFeed[],
  feedIdMap: ReadonlyMap<string, string>,
): Record<string, PythPriceData> => {
  const timestamp = Date.now();

  return Object.fromEntries(
    feeds
      .map(feed => ({ feed, symbol: feedIdMap.get(feed.id.toLowerCase()) }))
      .filter((entry): entry is { feed: PythPriceFeed; symbol: string } => entry.symbol !== undefined)
      .map(({ feed, symbol }) => [symbol, transformPriceFeed(feed, symbol, timestamp)]),
  );
};

const getConfiguredFeedIds = (): readonly string[] =>
  getSupportedTokenSymbols()
    .map(symbol => getPriceFeedId(symbol))
    .filter((id): id is string => id !== undefined);

export const subscribeToPriceStream = (
  onUpdate: (data: Record<string, PythPriceData>) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const feedIds = getConfiguredFeedIds();

  if (feedIds.length === 0) {
    console.warn('[Pyth] No price feeds configured');
    return () => undefined;
  }

  const feedIdMap = createFeedIdMap(getSupportedTokenSymbols());

  const cleanup = (async () => {
    try {
      const eventSource = await hermesClient.getPriceUpdatesStream([...feedIds], {
        parsed: true,
        encoding: 'hex',
        benchmarksOnly: false,
      });

      eventSource.addEventListener('message', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string) as PythStreamData;

          if (data.parsed?.length) {
            onUpdate(parsePriceFeeds(data.parsed, feedIdMap));
          }
        } catch (parseError) {
          console.error('[Pyth] Failed to parse stream data:', parseError);
        }
      });

      eventSource.addEventListener('error', () => {
        console.error('[Pyth] Stream connection error');
        onError?.(new Error('Price stream connection error'));
      });

      eventSource.addEventListener('open', () => {
        console.info('[Pyth] Stream connected successfully');
      });

      console.info(`[Pyth] Started SSE streaming for ${feedIds.length} price feeds`);

      return () => {
        eventSource.close();
        console.info('[Pyth] Stream closed');
      };
    } catch (streamError) {
      console.error('[Pyth] Failed to start stream:', streamError);
      onError?.(streamError instanceof Error ? streamError : new Error('Failed to start stream'));
      return () => undefined;
    }
  })();

  let cleanupFn: (() => void) | undefined;
  void cleanup.then(fn => {
    cleanupFn = fn;
  });

  return () => {
    cleanupFn?.();
  };
};
