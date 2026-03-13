"use client";

import {
  metrics,
  equitySeries,
  positions,
  trades,
  sectorExposure,
  strategyExposure,
  scanResults,
  tradeIdeas,
  researchNews,
} from "@/lib/mock-data";
import type {
  DashboardMetrics,
  EquityPoint,
  Position,
  ResearchNewsItem,
  ScanResult,
  Trade,
  TradeIdea,
} from "@/lib/types";

type ExposureData = {
  sector: typeof sectorExposure;
  strategy: typeof strategyExposure;
  total_equity: number;
};

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export function useMetrics(): {
  data: DashboardMetrics | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  return { data: metrics, isLoading: false, error: undefined, mutate: () => {} };
}

// ---------------------------------------------------------------------------
// Equity curve
// ---------------------------------------------------------------------------

export function useEquityCurve(): {
  data: EquityPoint[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
} {
  return { data: equitySeries, isLoading: false, error: undefined };
}

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

export function usePositions(): {
  data: Position[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  return { data: positions, isLoading: false, error: undefined, mutate: () => {} };
}

// ---------------------------------------------------------------------------
// Trades
// ---------------------------------------------------------------------------

export function useTrades(_params?: { limit?: number; offset?: number; status?: string }): {
  data: Trade[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  return { data: trades, isLoading: false, error: undefined, mutate: () => {} };
}

// ---------------------------------------------------------------------------
// Exposure
// ---------------------------------------------------------------------------

export function useExposure(): {
  data: ExposureData | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const data: ExposureData = {
    sector: sectorExposure,
    strategy: strategyExposure,
    total_equity: metrics.total_equity,
  };
  return { data, isLoading: false, error: undefined, mutate: () => {} };
}

// ---------------------------------------------------------------------------
// Scanner results
// ---------------------------------------------------------------------------

export function useScans(_params?: { date?: string; scanner?: string }): {
  data: ScanResult[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  return { data: scanResults, isLoading: false, error: undefined, mutate: () => {} };
}

// ---------------------------------------------------------------------------
// Trade ideas
// ---------------------------------------------------------------------------

export function useIdeas(_params?: { date?: string; status?: string }): {
  data: TradeIdea[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  return { data: tradeIdeas, isLoading: false, error: undefined, mutate: () => {} };
}

// ---------------------------------------------------------------------------
// Research news
// ---------------------------------------------------------------------------

export function useResearchNews(_params?: { date?: string }): {
  data: ResearchNewsItem[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
} {
  return { data: researchNews, isLoading: false, error: undefined };
}
