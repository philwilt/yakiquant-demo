/**
 * Shared data types for the Yakiquant demo dashboard.
 */

export interface EquityPoint {
  date: string;
  equity: number;
  benchmark: number;
}

export interface DrawdownPoint {
  date: string;
  drawdown: number;
}

export interface DailyReturn {
  date: string;
  return: number;
  pnl: number;
}

export interface Position {
  symbol: string;
  strategy: string | null;
  side: "LONG" | "SHORT";
  qty: number;
  avg_cost: number;
  last_price: number;
  pnl: number;
  pnl_pct: number;
  sector: string | null;
  entry_date: string;
  score: number | null;
}

export interface Trade {
  id: string;
  date: string | null;
  symbol: string;
  strategy: string | null;
  side: "BUY" | "SELL";
  qty: number;
  price: number | null;
  pnl: number | null;
  status: string;
}

export interface SectorExposure {
  sector: string;
  value: number;
  pct: number;
  color: string;
}

export interface StrategyExposure {
  strategy: string;
  value: number;
  pct: number;
  color?: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string | null;
  sector: string | null;
  price: number | null;
  change: number | null;
  change_pct: number | null;
  sparkline: number[];
  last_date: string | null;
}

export interface StockBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistory {
  ticker: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  bars: StockBar[];
  high_52w: number | null;
  low_52w: number | null;
  avg_volume: number | null;
}

export interface ScanResult {
  id: number;
  ticker: string;
  scan_date: string;
  scanner_name: string;
  score: number;
  signals: Record<string, unknown> | null;
  scanned_at: string;
}

export interface TradeIdea {
  id: number;
  ticker: string;
  idea_date: string;
  scanner_name: string | null;
  scanner_score: number | null;
  status: string;
  rank: number | null;
  catalyst_type: string | null;
  catalyst_confidence: number | null;
  conviction: string | null;
  thesis_summary: string | null;
  entry_price: number | null;
  stop_loss: number | null;
  target_price: number | null;
  position_size_pct: number | null;
  bear_case: string | null;
  adversarial_recommendation: string | null;
  risk_approved: boolean | null;
  risk_rejection_reason: string | null;
  catalyst_classification: Record<string, unknown> | null;
  thesis: Record<string, unknown> | null;
  adversarial_review: Record<string, unknown> | null;
  risk_check: Record<string, unknown> | null;
}

export interface NewsItem {
  headline: string;
  source: string | null;
  published_at: string;
  url: string | null;
  summary: string | null;
}

export interface ResearchNewsItem extends NewsItem {
  ticker: string;
}

export interface TickerNewsResponse {
  ticker: string;
  from_date: string;
  to_date: string;
  articles: NewsItem[];
}

export interface StockEventScan {
  scanner_name: string;
  score: number;
  signals: Record<string, unknown> | null;
}

export interface StockEventIdea {
  id: number;
  status: string;
  conviction: string | null;
  thesis_summary: string | null;
  bear_case: string | null;
  risk_approved: boolean | null;
}

export interface StockEventsResponse {
  ticker: string;
  date: string;
  price_change_pct: number | null;
  close: number | null;
  news: NewsItem[];
  scans: StockEventScan[];
  ideas: StockEventIdea[];
}

export interface OrderResponse {
  id: string;
  broker_order_id: string | null;
  ticker: string;
  side: "BUY" | "SELL";
  qty: number;
  status: string;
  submitted_at: string | null;
}

export interface SyncResponse {
  synced: number;
  added: number;
  removed: number;
}

export interface OrderSyncResponse {
  updated: number;
}

export interface PipelineStatus {
  date: string;
  status: "running" | "complete" | "error";
  summary: {
    scan_hits?: number;
    ideas_created?: number;
    approved?: number;
  };
  error?: string | null;
}

export interface DashboardMetrics {
  total_equity: number;
  total_pnl: number;
  total_pnl_pct: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  sharpe_ratio: number;
  max_drawdown: number;
  current_drawdown: number;
  win_rate: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  total_trades: number;
  open_positions: number;
  cash: number;
  buying_power: number;
}

export interface DataStatus {
  latest_bar_date: string | null;
  bars_stale_days: number | null;
  latest_news_date: string | null;
  universe_size: number;
  snapshot_count: number;
}
