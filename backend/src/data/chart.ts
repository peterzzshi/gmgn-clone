import type { OHLCVData, TimeFrame } from '@/types';

export const TIME_FRAME_SECONDS: Record<TimeFrame, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
  '1w': 604800,
} as const;

export const generateOHLCVData = (
  basePrice: number,
  timeFrame: TimeFrame,
  count: number,
  volatility: number = 0.02,
): readonly OHLCVData[] => {
  const intervalSeconds = TIME_FRAME_SECONDS[timeFrame];
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * intervalSeconds;

  let currentPrice = basePrice * (0.9 + Math.random() * 0.2);
  const result: OHLCVData[] = [];

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalSeconds;

    const change = (Math.random() - 0.5) * volatility;
    const open = currentPrice;
    const close = open * (1 + change);

    const wickUp = Math.random() * volatility * 0.5;
    const high = Math.max(open, close) * (1 + wickUp);

    const wickDown = Math.random() * volatility * 0.5;
    const low = Math.min(open, close) * (1 - wickDown);

    const baseVolume = 1_000_000;
    const volume = baseVolume * (0.5 + Math.random());

    result.push({
      time,
      open: Number(open.toFixed(8)),
      high: Number(high.toFixed(8)),
      low: Number(low.toFixed(8)),
      close: Number(close.toFixed(8)),
      volume: Math.floor(volume),
    });

    currentPrice = close;
  }

  return result;
};

export const generateTokenChartData = (
  tokenId: string,
  timeFrame: TimeFrame,
  count: number = 100,
): readonly OHLCVData[] => {
  const basePrices: Record<string, number> = {
    sol: 178.45,
    bonk: 0.00002834,
    wif: 2.45,
    jup: 0.92,
    ray: 4.78,
    orca: 3.92,
    popcat: 0.78,
    render: 7.24,
  };

  const basePrice = basePrices[tokenId] ?? 1.0;
  const volatility = tokenId === 'sol' ? 0.015 : 0.03;

  return generateOHLCVData(basePrice, timeFrame, count, volatility);
};

export const getLatestCandle = (data: readonly OHLCVData[]): OHLCVData | undefined =>
  data.at(-1);

export const calculatePriceChange = (
  data: readonly OHLCVData[],
): { change: number; changePercent: number } => {
  if (data.length < 2) {
    return { change: 0, changePercent: 0 };
  }

  const first = data[0];
  const last = data.at(-1);

  if (!first || !last) {
    return { change: 0, changePercent: 0 };
  }

  const change = last.close - first.open;
  const changePercent = (change / first.open) * 100;

  return { change, changePercent };
};

export const getHighestPrice = (data: readonly OHLCVData[]): number =>
  Math.max(...data.map((candle) => candle.high));

export const getLowestPrice = (data: readonly OHLCVData[]): number =>
  Math.min(...data.map((candle) => candle.low));

export const getTotalVolume = (data: readonly OHLCVData[]): number =>
  data.reduce((sum, candle) => sum + candle.volume, 0);

export const filterByTimeRange = (
  data: readonly OHLCVData[],
  startTime: number,
  endTime: number,
): readonly OHLCVData[] =>
  data.filter((candle) => candle.time >= startTime && candle.time <= endTime);

