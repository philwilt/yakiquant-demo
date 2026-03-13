"use client";

import {
  watchlistItems,
  stockHistories,
  tickerNews,
  getMockStockEvents,
} from "@/lib/mock-data";
import type {
  StockEventsResponse,
  StockHistory,
  TickerNewsResponse,
  WatchlistItem,
} from "@/lib/types";

export function useWatchlist(): {
  data: WatchlistItem[];
  error: undefined;
  isLoading: boolean;
} {
  return { data: watchlistItems, error: undefined, isLoading: false };
}

export function useStockHistory(
  ticker: string | null,
  _range: string
): {
  data: StockHistory | undefined;
  error: undefined;
  isLoading: boolean;
} {
  const data = ticker ? stockHistories[ticker] : undefined;
  return { data, error: undefined, isLoading: false };
}

export function useStockEvents(
  ticker: string | null,
  eventDate: string | null
): {
  data: StockEventsResponse | undefined;
  error: undefined;
  isLoading: boolean;
} {
  const data = ticker && eventDate ? getMockStockEvents(ticker, eventDate) : undefined;
  return { data, error: undefined, isLoading: false };
}

export function useTickerNews(ticker: string | null): {
  data: TickerNewsResponse | undefined;
  error: undefined;
  isLoading: boolean;
} {
  const data = ticker ? tickerNews[ticker] : undefined;
  return { data, error: undefined, isLoading: false };
}

// Noops for demo mode
export async function addTicker(_ticker: string): Promise<void> {
  // Demo mode: no-op
}

export async function removeTicker(_ticker: string): Promise<void> {
  // Demo mode: no-op
}
