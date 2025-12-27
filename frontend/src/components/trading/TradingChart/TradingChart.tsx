import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

import { tokenService } from '@/services';

import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import type { TimeFrame } from '@/types';

interface TradingChartProps {
  readonly tokenId: string;
  readonly timeFrame: TimeFrame;
}

// Chart theme configuration (pure data)
const CHART_COLORS = {
  backgroundColor: '#1a1a1a',
  textColor: '#a0a0a0',
  lineColor: '#2a2a2a',
  upColor: '#00d4aa',
  downColor: '#ff4757',
  wickUpColor: '#00d4aa',
  wickDownColor: '#ff4757',
} as const;

export const TradingChart = ({ tokenId, timeFrame }: TradingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.backgroundColor },
        textColor: CHART_COLORS.textColor,
      },
      grid: {
        vertLines: { color: CHART_COLORS.lineColor },
        horzLines: { color: CHART_COLORS.lineColor },
      },
      crosshair: {
        mode: 1, // Magnet mode
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.lineColor,
      },
      timeScale: {
        borderColor: CHART_COLORS.lineColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderVisible: false,
      wickUpColor: CHART_COLORS.wickUpColor,
      wickDownColor: CHART_COLORS.wickDownColor,
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data when tokenId or timeFrame changes
  useEffect(() => {
    if (!seriesRef.current) return;

    const fetchChartData = async () => {
      try {
        const ohlcvData = await tokenService.getChartData(tokenId, timeFrame, 100);

        // Transform to lightweight-charts format
        const chartData: CandlestickData[] = ohlcvData.map((candle) => ({
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        seriesRef.current?.setData(chartData);

        // Fit content
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    fetchChartData();
  }, [tokenId, timeFrame]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
};
