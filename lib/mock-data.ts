// ─── Types (imported and re-exported from lib/types.ts) ──────────────────────

import type {
  DailyReturn,
  DashboardMetrics,
  DataStatus,
  DrawdownPoint,
  EquityPoint,
  Position,
  ResearchNewsItem,
  ScanResult,
  SectorExposure,
  StockEventsResponse,
  StockHistory,
  StrategyExposure,
  TickerNewsResponse,
  Trade,
  TradeIdea,
  WatchlistItem,
} from "@/lib/types";

export type {
  DailyReturn,
  DashboardMetrics,
  DrawdownPoint,
  EquityPoint,
  Position,
  SectorExposure,
  StrategyExposure,
  Trade,
};

// ─── Deterministic pseudo-random ─────────────────────────────────────────────

function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Trading day generator ────────────────────────────────────────────────────

function tradingDays(startISO: string, count: number): string[] {
  const days: string[] = [];
  const d = new Date(startISO);
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ─── Equity Curve (300 trading days ≈ 2025-01-02 → 2026-03-11) ───────────────

const DAYS = tradingDays("2025-01-02", 300);
const START_EQUITY = 100_000;

// Build daily returns with realistic regime structure
const rawReturns = DAYS.map((_, i) => {
  // Base drift + vol
  const drift = 0.00055;
  const vol = 0.009;
  // Regime: drawdown in weeks 10-13, recovery thereafter
  const drawdownPeriod = i >= 48 && i <= 65;
  const trendBoost = i >= 66 && i <= 120 ? 0.0006 : 0;
  const regimeDrift = drawdownPeriod ? -0.0025 : drift + trendBoost;
  return regimeDrift + (rand(i) - 0.5) * vol * 2;
});

export const equitySeries: EquityPoint[] = [];
export const drawdownSeries: DrawdownPoint[] = [];
export const dailyReturnSeries: DailyReturn[] = [];

// Benchmark: SPY-like +12% / year
let equity = START_EQUITY;
let benchmark = START_EQUITY;
let peakEquity = START_EQUITY;

DAYS.forEach((date, i) => {
  const ret = rawReturns[i];
  const benchRet = 0.00045 + (rand(i + 1000) - 0.5) * 0.007;
  equity = equity * (1 + ret);
  benchmark = benchmark * (1 + benchRet);
  peakEquity = Math.max(peakEquity, equity);
  const dd = (equity - peakEquity) / peakEquity;
  equitySeries.push({
    date,
    equity: parseFloat(equity.toFixed(2)),
    benchmark: parseFloat(benchmark.toFixed(2)),
  });
  drawdownSeries.push({ date, drawdown: parseFloat((dd * 100).toFixed(3)) });
  dailyReturnSeries.push({
    date,
    return: parseFloat((ret * 100).toFixed(4)),
    pnl: parseFloat((equity * ret).toFixed(2)),
  });
});

// ─── Metrics ─────────────────────────────────────────────────────────────────

const finalEquity = equitySeries[equitySeries.length - 1].equity;
const totalPnl = finalEquity - START_EQUITY;
const rets = rawReturns;
const meanRet = rets.reduce((a, b) => a + b, 0) / rets.length;
const stdRet = Math.sqrt(
  rets.map((r) => (r - meanRet) ** 2).reduce((a, b) => a + b, 0) / rets.length
);
const sharpe = (meanRet / stdRet) * Math.sqrt(252);
const maxDD = Math.min(...drawdownSeries.map((d) => d.drawdown));
const currentDD = drawdownSeries[drawdownSeries.length - 1].drawdown;

const winningDays = dailyReturnSeries.filter((d) => d.pnl > 0);
const losingDays = dailyReturnSeries.filter((d) => d.pnl < 0);
const avgWin =
  winningDays.reduce((a, d) => a + d.pnl, 0) / winningDays.length;
const avgLoss = Math.abs(
  losingDays.reduce((a, d) => a + d.pnl, 0) / losingDays.length
);

export const metrics: DashboardMetrics = {
  total_equity: finalEquity,
  total_pnl: totalPnl,
  total_pnl_pct: (totalPnl / START_EQUITY) * 100,
  daily_pnl: dailyReturnSeries[dailyReturnSeries.length - 1].pnl,
  daily_pnl_pct: dailyReturnSeries[dailyReturnSeries.length - 1].return,
  sharpe_ratio: parseFloat(sharpe.toFixed(2)),
  max_drawdown: parseFloat(maxDD.toFixed(2)),
  current_drawdown: parseFloat(currentDD.toFixed(2)),
  win_rate: parseFloat(
    ((winningDays.length / DAYS.length) * 100).toFixed(1)
  ),
  profit_factor: parseFloat((avgWin / avgLoss).toFixed(2)),
  avg_win: parseFloat(avgWin.toFixed(0)),
  avg_loss: parseFloat(avgLoss.toFixed(0)),
  total_trades: 187,
  open_positions: 8,
  cash: parseFloat((finalEquity * 0.38).toFixed(0)),
  buying_power: parseFloat((finalEquity * 0.76).toFixed(0)),
};

// ─── Positions ───────────────────────────────────────────────────────────────

export const positions: Position[] = [
  {
    symbol: "NVDA",
    strategy: "breakout_momentum",
    side: "LONG",
    qty: 60,
    avg_cost: 875.4,
    last_price: 924.1,
    pnl: 2922,
    pnl_pct: 5.56,
    sector: "Technology",
    entry_date: "2026-02-18",
    score: 88,
  },
  {
    symbol: "IDXX",
    strategy: "breakout_momentum",
    side: "LONG",
    qty: 25,
    avg_cost: 485.2,
    last_price: 501.8,
    pnl: 415,
    pnl_pct: 3.42,
    sector: "Health Care",
    entry_date: "2026-02-24",
    score: 81,
  },
  {
    symbol: "META",
    strategy: "post_earnings_continuation",
    side: "LONG",
    qty: 40,
    avg_cost: 612.0,
    last_price: 638.5,
    pnl: 1060,
    pnl_pct: 4.33,
    sector: "Communication Services",
    entry_date: "2026-02-10",
    score: 79,
  },
  {
    symbol: "SMCI",
    strategy: "post_earnings_continuation",
    side: "LONG",
    qty: 120,
    avg_cost: 42.1,
    last_price: 44.8,
    pnl: 324,
    pnl_pct: 6.41,
    sector: "Technology",
    entry_date: "2026-02-28",
    score: 74,
  },
  {
    symbol: "GS",
    strategy: "breakout_momentum",
    side: "LONG",
    qty: 20,
    avg_cost: 598.3,
    last_price: 588.7,
    pnl: -192,
    pnl_pct: -1.60,
    sector: "Financials",
    entry_date: "2026-03-03",
    score: 66,
  },
  {
    symbol: "LLY",
    strategy: "breakout_momentum",
    side: "LONG",
    qty: 15,
    avg_cost: 883.0,
    last_price: 902.4,
    pnl: 291,
    pnl_pct: 2.20,
    sector: "Health Care",
    entry_date: "2026-03-05",
    score: 72,
  },
  {
    symbol: "TSLA",
    strategy: "post_earnings_continuation",
    side: "LONG",
    qty: 80,
    avg_cost: 287.5,
    last_price: 271.2,
    pnl: -1304,
    pnl_pct: -5.67,
    sector: "Consumer Discretionary",
    entry_date: "2026-02-20",
    score: 61,
  },
  {
    symbol: "PANW",
    strategy: "post_earnings_continuation",
    side: "LONG",
    qty: 30,
    avg_cost: 191.4,
    last_price: 198.7,
    pnl: 219,
    pnl_pct: 3.81,
    sector: "Technology",
    entry_date: "2026-03-07",
    score: 77,
  },
];

// ─── Trade Log ────────────────────────────────────────────────────────────────

const SYMBOLS = [
  "AAPL","MSFT","NVDA","META","GOOGL","AMZN","TSLA","LLY","GS","JPM",
  "IDXX","PANW","SMCI","AMD","CRM","ANET","AXON","DKNG","ENPH","TTD",
];
const STRATEGIES = ["breakout_momentum", "post_earnings_continuation"];

export const trades: Trade[] = Array.from({ length: 60 }, (_, i) => {
  const sym = SYMBOLS[Math.floor(rand(i * 3) * SYMBOLS.length)];
  const isBuy = rand(i * 7) > 0.45;
  const price = 50 + rand(i * 11) * 900;
  const qty = Math.floor(10 + rand(i * 13) * 150);
  const pnl = isBuy ? null : parseFloat(((rand(i * 17) - 0.38) * qty * price * 0.06).toFixed(0));
  const daysAgo = Math.floor(rand(i * 19) * 90);
  const date = new Date("2026-03-11");
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `TRD-${String(i + 1).padStart(4, "0")}`,
    date: date.toISOString().split("T")[0],
    symbol: sym,
    strategy: STRATEGIES[Math.floor(rand(i * 23) * STRATEGIES.length)],
    side: (isBuy ? "BUY" : "SELL") as "BUY" | "SELL",
    qty,
    price: parseFloat(price.toFixed(2)),
    pnl,
    status: (rand(i * 29) > 0.08 ? "FILLED" : rand(i * 31) > 0.5 ? "PARTIAL" : "CANCELLED") as "FILLED" | "PARTIAL" | "CANCELLED",
  };
}).sort((a, b) => b.date.localeCompare(a.date));

// ─── Sector Exposure ─────────────────────────────────────────────────────────

const sectorTotals: Record<string, number> = {};
positions.forEach((p) => {
  const val = p.qty * p.last_price;
  const sector = p.sector ?? "Other";
  sectorTotals[sector] = (sectorTotals[sector] ?? 0) + val;
});

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  "Health Care": "#10b981",
  Financials: "#f59e0b",
  "Communication Services": "#8b5cf6",
  "Consumer Discretionary": "#ef4444",
  Industrials: "#06b6d4",
};

const totalExposed = Object.values(sectorTotals).reduce((a, b) => a + b, 0);

export const sectorExposure: SectorExposure[] = Object.entries(sectorTotals)
  .map(([sector, value]) => ({
    sector,
    value: parseFloat(value.toFixed(0)),
    pct: parseFloat(((value / finalEquity) * 100).toFixed(1)),
    color: SECTOR_COLORS[sector] ?? "#6b7280",
  }))
  .concat([
    {
      sector: "Cash",
      value: parseFloat((finalEquity - totalExposed).toFixed(0)),
      pct: parseFloat((((finalEquity - totalExposed) / finalEquity) * 100).toFixed(1)),
      color: "#374151",
    },
  ])
  .sort((a, b) => b.value - a.value);

// ─── Strategy Exposure ────────────────────────────────────────────────────────

export const strategyExposure: StrategyExposure[] = [
  {
    strategy: "breakout_momentum",
    value: positions
      .filter((p) => p.strategy === "breakout_momentum")
      .reduce((a, p) => a + p.qty * p.last_price, 0),
    color: "#3b82f6",
  },
  {
    strategy: "post_earnings",
    value: positions
      .filter((p) => p.strategy === "post_earnings_continuation")
      .reduce((a, p) => a + p.qty * p.last_price, 0),
    color: "#8b5cf6",
  },
].map((s) => ({
  ...s,
  value: parseFloat(s.value.toFixed(0)),
  pct: parseFloat(((s.value / finalEquity) * 100).toFixed(1)),
}));

// ─── Watchlist Items ──────────────────────────────────────────────────────────

function genSparkline(seed: number, basePrice: number, len = 30): number[] {
  const out: number[] = [];
  let p = basePrice;
  for (let i = 0; i < len; i++) {
    p = p * (1 + (rand(seed + i * 7) - 0.5) * 0.03);
    out.push(parseFloat(p.toFixed(2)));
  }
  return out;
}

export const watchlistItems: WatchlistItem[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    price: 924.10,
    change: 12.40,
    change_pct: 1.36,
    sparkline: genSparkline(1, 870),
    last_date: "2026-03-11",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 218.45,
    change: -1.22,
    change_pct: -0.56,
    sparkline: genSparkline(2, 210),
    last_date: "2026-03-11",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    price: 415.30,
    change: 3.18,
    change_pct: 0.77,
    sparkline: genSparkline(3, 400),
    last_date: "2026-03-11",
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    sector: "Communication Services",
    price: 638.50,
    change: 8.70,
    change_pct: 1.38,
    sparkline: genSparkline(4, 600),
    last_date: "2026-03-11",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Communication Services",
    price: 192.80,
    change: -0.95,
    change_pct: -0.49,
    sparkline: genSparkline(5, 185),
    last_date: "2026-03-11",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    sector: "Consumer Discretionary",
    price: 224.15,
    change: 2.45,
    change_pct: 1.10,
    sparkline: genSparkline(6, 215),
    last_date: "2026-03-11",
  },
  {
    ticker: "IDXX",
    name: "IDEXX Laboratories, Inc.",
    sector: "Health Care",
    price: 501.80,
    change: 4.20,
    change_pct: 0.84,
    sparkline: genSparkline(7, 480),
    last_date: "2026-03-11",
  },
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    sector: "Health Care",
    price: 902.40,
    change: -6.30,
    change_pct: -0.69,
    sparkline: genSparkline(8, 880),
    last_date: "2026-03-11",
  },
];

// ─── Stock Histories ──────────────────────────────────────────────────────────

function genHistory(
  ticker: string,
  name: string,
  sector: string,
  industry: string,
  basePrice: number,
  seed: number
): StockHistory {
  const bars = tradingDays("2025-01-02", 252).map((date, i) => {
    const prev = i === 0 ? basePrice : basePrice * (1 + (rand(seed + (i - 1) * 13) - 0.48) * 0.02 * i * 0.015);
    const drift = (rand(seed + i * 13) - 0.48) * 0.025;
    const close = parseFloat((prev * (1 + drift)).toFixed(2));
    const range = close * 0.015;
    const open = parseFloat((close + (rand(seed + i * 17) - 0.5) * range).toFixed(2));
    const high = parseFloat((Math.max(open, close) + rand(seed + i * 19) * range * 0.8).toFixed(2));
    const low = parseFloat((Math.min(open, close) - rand(seed + i * 23) * range * 0.8).toFixed(2));
    const volume = Math.floor(500_000 + rand(seed + i * 29) * 10_000_000);
    return { date, open, high, low, close, volume };
  });

  const closes = bars.map((b) => b.close);
  const high_52w = parseFloat(Math.max(...closes).toFixed(2));
  const low_52w = parseFloat(Math.min(...closes).toFixed(2));
  const avg_volume = Math.floor(bars.reduce((s, b) => s + b.volume, 0) / bars.length);

  return { ticker, name, sector, industry, bars, high_52w, low_52w, avg_volume };
}

export const stockHistories: Record<string, StockHistory> = {
  NVDA: genHistory("NVDA", "NVIDIA Corporation", "Technology", "Semiconductors", 850, 101),
  AAPL: genHistory("AAPL", "Apple Inc.", "Technology", "Consumer Electronics", 205, 102),
  MSFT: genHistory("MSFT", "Microsoft Corporation", "Technology", "Software-Infrastructure", 390, 103),
  META: genHistory("META", "Meta Platforms, Inc.", "Communication Services", "Internet Content & Information", 590, 104),
  GOOGL: genHistory("GOOGL", "Alphabet Inc.", "Communication Services", "Internet Content & Information", 180, 105),
  AMZN: genHistory("AMZN", "Amazon.com, Inc.", "Consumer Discretionary", "Internet Retail", 210, 106),
  IDXX: genHistory("IDXX", "IDEXX Laboratories, Inc.", "Health Care", "Health Care Equipment", 470, 107),
  LLY: genHistory("LLY", "Eli Lilly and Company", "Health Care", "Drug Manufacturers", 860, 108),
};

// ─── Scanner Results ──────────────────────────────────────────────────────────

const SCAN_TICKERS = ["NVDA","META","MSFT","AAPL","GOOGL","AMZN","PANW","CRM","ANET","AMD","AXON","LLY","IDXX","GS","SMCI"];
const SCANNER_NAMES = ["breakout_momentum", "post_earnings_continuation"];

export const scanResults: ScanResult[] = SCAN_TICKERS.map((ticker, i) => ({
  id: 1000 + i,
  ticker,
  scan_date: "2026-03-11",
  scanner_name: SCANNER_NAMES[i % 2],
  score: parseFloat((55 + rand(i * 41) * 45).toFixed(1)),
  signals: {
    price_vs_20d_high: parseFloat((0.98 + rand(i * 43) * 0.05).toFixed(3)),
    volume_ratio: parseFloat((1.1 + rand(i * 47) * 1.8).toFixed(2)),
    rsi_14: parseFloat((52 + rand(i * 53) * 28).toFixed(1)),
  },
  scanned_at: `2026-03-11T09:${30 + i}:00Z`,
}));

// ─── Trade Ideas ──────────────────────────────────────────────────────────────

const IDEA_TICKERS = ["NVDA","META","MSFT","AAPL","PANW","CRM","LLY","IDXX"];
const STATUSES = ["approved","approved","approved","approved","rejected","rejected","approved","rejected"];
const CONVICTIONS = ["high","high","medium","medium","low","medium","high","low"];
const ADV_RECS = ["proceed","proceed","caution","proceed","reject","caution","proceed","reject"];

export const tradeIdeas: TradeIdea[] = IDEA_TICKERS.map((ticker, i) => {
  const basePrice = [924,638,415,218,199,320,902,501][i];
  const entry = parseFloat((basePrice * (1 + (rand(i * 61) - 0.5) * 0.01)).toFixed(2));
  const stop = parseFloat((entry * (1 - 0.04 - rand(i * 67) * 0.03)).toFixed(2));
  const target = parseFloat((entry * (1 + 0.08 + rand(i * 71) * 0.06)).toFixed(2));

  return {
    id: 2000 + i,
    ticker,
    idea_date: "2026-03-11",
    scanner_name: SCANNER_NAMES[i % 2],
    scanner_score: parseFloat((65 + rand(i * 73) * 30).toFixed(1)),
    status: STATUSES[i],
    rank: STATUSES[i] === "approved" ? i + 1 : null,
    catalyst_type: i % 2 === 0 ? "Earnings Beat" : "Technical Breakout",
    catalyst_confidence: parseFloat((0.55 + rand(i * 79) * 0.4).toFixed(2)),
    conviction: CONVICTIONS[i],
    thesis_summary: `${ticker} shows strong momentum following ${i % 2 === 0 ? "a significant earnings beat with raised guidance" : "a decisive breakout above key resistance on elevated volume"}. The setup offers an attractive risk/reward ratio with a clear catalyst driving institutional buying interest.`,
    entry_price: entry,
    stop_loss: stop,
    target_price: target,
    position_size_pct: parseFloat((0.02 + rand(i * 83) * 0.03).toFixed(3)),
    bear_case: `Key risks include broader market weakness, sector rotation away from ${ticker}'s industry, and potential disappointment in follow-through earnings. A break below the 20-day moving average would invalidate the setup.`,
    adversarial_recommendation: ADV_RECS[i],
    risk_approved: STATUSES[i] === "approved",
    risk_rejection_reason: STATUSES[i] === "rejected" ? "Concentration risk: sector exposure already at limit. Portfolio heat exceeds 6%." : null,
    catalyst_classification: {
      catalyst_type: i % 2 === 0 ? "Earnings Beat" : "Technical Breakout",
      summary: `${ticker} ${i % 2 === 0 ? "reported Q4 EPS of $X, beating estimates by 12%. Management raised full-year guidance by 8%, citing strong demand across all segments." : "cleared a multi-month base on 2.3x average volume. Price closed above the prior high on the weekly chart, signaling institutional accumulation."}`,
      confidence: parseFloat((0.55 + rand(i * 79) * 0.4).toFixed(2)),
    },
    thesis: {
      thesis: `${ticker} presents a compelling ${i % 2 === 0 ? "post-earnings continuation" : "breakout momentum"} trade. The stock has demonstrated relative strength against the sector and the broader market. Technical setup is constructive with volume confirmation. The risk-reward ratio of approximately ${((target - entry) / (entry - stop)).toFixed(1)}:1 is attractive.`,
      entry_rationale: `Entry near current price levels captures the momentum while limiting downside exposure. The suggested stop at $${stop.toFixed(2)} is just below a key support level, limiting risk to approximately ${(((entry - stop) / entry) * 100).toFixed(1)}% of position value.`,
      suggested_hold_days: 5 + Math.floor(rand(i * 89) * 10),
    },
    adversarial_review: {
      recommendation: ADV_RECS[i],
      critique: `The thesis has merit but carries several risks worth considering. Market breadth has been narrowing, which could limit upside. The entry point is extended from the 50-day moving average. Consider waiting for a slight pullback to improve the risk/reward.`,
      failure_probability: parseFloat((0.25 + rand(i * 97) * 0.35).toFixed(2)),
      failure_modes: [
        "Broader market selloff negating stock-specific catalyst",
        "Sector rotation reducing interest in this area",
        "Stop-loss triggered by intraday volatility before thesis plays out",
      ],
    },
    risk_check: {
      risk_approved: STATUSES[i] === "approved",
      rationale: STATUSES[i] === "approved"
        ? `Position passes all risk checks. Sizing at ${((0.02 + rand(i * 83) * 0.03) * 100).toFixed(1)}% of portfolio keeps single-name risk within acceptable bounds. Sector exposure remains diversified.`
        : `Position rejected due to concentration risk. Current ${ticker.slice(0,1) === "N" || ticker === "MSFT" || ticker === "AAPL" ? "Technology" : "sector"} exposure is at the 30% portfolio limit. Adding this position would exceed the threshold.`,
      sizing_pct: parseFloat((0.02 + rand(i * 83) * 0.03).toFixed(3)),
      concerns: [
        "Monitor position size relative to daily liquidity",
        "Set alerts for earnings dates within the hold window",
      ],
      check_failures: STATUSES[i] === "rejected" ? ["sector_concentration_limit_exceeded", "portfolio_heat_limit_exceeded"] : [],
    },
  };
});

// ─── Research News ────────────────────────────────────────────────────────────

export const researchNews: ResearchNewsItem[] = [
  {
    ticker: "NVDA",
    headline: "NVIDIA's Blackwell GPU Demand Exceeds Expectations, CEO Says",
    source: "Reuters",
    published_at: "2026-03-11T10:30:00Z",
    url: null,
    summary: "NVIDIA CEO Jensen Huang stated that demand for the new Blackwell architecture GPUs continues to outstrip supply, with data center customers expanding orders for AI training clusters.",
  },
  {
    ticker: "META",
    headline: "Meta Reports Record Ad Revenue, Raises Q2 Guidance",
    source: "Bloomberg",
    published_at: "2026-03-11T09:15:00Z",
    url: null,
    summary: "Meta Platforms announced Q1 advertising revenue of $42.3 billion, up 19% year-over-year, driven by AI-enhanced ad targeting across Instagram and Facebook.",
  },
  {
    ticker: "MSFT",
    headline: "Microsoft Azure Beats Cloud Growth Estimates for Fifth Consecutive Quarter",
    source: "CNBC",
    published_at: "2026-03-11T08:45:00Z",
    url: null,
    summary: "Microsoft's Azure cloud division grew 31% year-over-year, above the 29% analyst consensus, fueled by enterprise adoption of Microsoft Copilot AI services.",
  },
  {
    ticker: "PANW",
    headline: "Palo Alto Networks Wins $800M Federal Cybersecurity Contract",
    source: "Wall Street Journal",
    published_at: "2026-03-11T11:00:00Z",
    url: null,
    summary: "Palo Alto Networks secured a major multi-year cybersecurity contract with the Department of Defense, reinforcing its position as a leading federal security vendor.",
  },
  {
    ticker: "CRM",
    headline: "Salesforce Agentforce Platform Reaches 1 Million Enterprise Users",
    source: "TechCrunch",
    published_at: "2026-03-11T07:30:00Z",
    url: null,
    summary: "Salesforce's AI agent platform Agentforce hit a major milestone, with adoption accelerating across financial services and healthcare verticals.",
  },
  {
    ticker: "LLY",
    headline: "Eli Lilly's Tirzepatide Shows Promise in New Cardiovascular Indication",
    source: "Reuters",
    published_at: "2026-03-11T06:00:00Z",
    url: null,
    summary: "Phase 3 trial data published in the New England Journal of Medicine showed tirzepatide reduced major cardiovascular events by 18% versus placebo in high-risk patients.",
  },
  {
    ticker: "IDXX",
    headline: "IDEXX Laboratories Expands VetLab Analyzer Distribution in Asia-Pacific",
    source: "PR Newswire",
    published_at: "2026-03-11T13:00:00Z",
    url: null,
    summary: "IDEXX announced strategic distribution agreements in Japan, Australia, and South Korea, targeting the growing veterinary diagnostics market in Asia-Pacific.",
  },
  {
    ticker: "AAPL",
    headline: "Apple Intelligence Features Drive iPhone Upgrade Cycle, Analysts Say",
    source: "Bloomberg",
    published_at: "2026-03-11T12:15:00Z",
    url: null,
    summary: "Analysts at Morgan Stanley upgraded Apple citing evidence that the AI features introduced in iOS 19 are accelerating the replacement cycle among older iPhone users.",
  },
  {
    ticker: "NVDA",
    headline: "NVIDIA Partners With Saudi Aramco for Industrial AI Applications",
    source: "Financial Times",
    published_at: "2026-03-11T14:00:00Z",
    url: null,
    summary: "A new partnership will deploy NVIDIA Omniverse for industrial simulation and digital twin technology across Aramco's refining and petrochemical operations.",
  },
  {
    ticker: "GOOGL",
    headline: "Alphabet's Gemini Ultra Achieves Top Scores on New AI Benchmarks",
    source: "Wired",
    published_at: "2026-03-11T05:30:00Z",
    url: null,
    summary: "Google DeepMind released benchmark results showing Gemini Ultra 2.0 outperforms competing models on coding, reasoning, and multimodal tasks.",
  },
];

// ─── Ticker News ──────────────────────────────────────────────────────────────

function makeTickerNews(ticker: string, articles: { headline: string; source: string; summary: string }[]): TickerNewsResponse {
  return {
    ticker,
    from_date: "2026-02-09",
    to_date: "2026-03-11",
    articles: articles.map((a, i) => ({
      headline: a.headline,
      source: a.source,
      published_at: `2026-03-${String(11 - i).padStart(2, "0")}T${String(8 + i).padStart(2, "0")}:00:00Z`,
      url: null,
      summary: a.summary,
    })),
  };
}

export const tickerNews: Record<string, TickerNewsResponse> = {
  NVDA: makeTickerNews("NVDA", [
    { headline: "NVIDIA's Blackwell GPU Demand Exceeds Expectations, CEO Says", source: "Reuters", summary: "NVIDIA CEO Jensen Huang stated demand for Blackwell architecture GPUs continues to outstrip supply." },
    { headline: "NVIDIA Partners With Saudi Aramco for Industrial AI Applications", source: "Financial Times", summary: "New partnership deploys NVIDIA Omniverse for industrial simulation across Aramco's operations." },
    { headline: "Analysts Raise NVIDIA Price Targets Ahead of GTC Conference", source: "Bloomberg", summary: "Wall Street analysts raised price targets on NVIDIA ahead of the annual GTC developer conference." },
    { headline: "NVIDIA Announces Next-Generation Networking Switch for AI Data Centers", source: "The Verge", summary: "The new 800G InfiniBand switch reduces AI training communication overhead by 40%." },
    { headline: "NVIDIA Stock Reaches New 52-Week High on AI Infrastructure Spending", source: "CNBC", summary: "Shares of NVIDIA reached a new 52-week high as cloud providers continue to expand AI infrastructure." },
  ]),
  AAPL: makeTickerNews("AAPL", [
    { headline: "Apple Intelligence Features Drive iPhone Upgrade Cycle, Analysts Say", source: "Bloomberg", summary: "AI features in iOS 19 are accelerating replacement cycles among older iPhone users." },
    { headline: "Apple Vision Pro 2 Rumored for Fall 2026 Launch With Updated Chip", source: "MacRumors", summary: "Supply chain sources point to a second-generation Vision Pro with an M4 chip launching in Q3 2026." },
    { headline: "Apple Services Revenue Hits Record $28 Billion in Latest Quarter", source: "CNBC", summary: "The high-margin Services segment including App Store, iCloud, and Apple TV+ reached a new quarterly record." },
    { headline: "Apple Expands Manufacturing Partnership With TSMC in Arizona", source: "Reuters", summary: "Apple committed to purchasing additional chips from TSMC's new Arizona fab facility through 2028." },
    { headline: "Apple Gains Market Share in Enterprise Mobile Devices", source: "IDC Research", summary: "IDC data shows Apple gained 3 percentage points of enterprise smartphone market share year-over-year." },
  ]),
  MSFT: makeTickerNews("MSFT", [
    { headline: "Microsoft Azure Beats Cloud Growth Estimates for Fifth Consecutive Quarter", source: "CNBC", summary: "Azure grew 31% year-over-year, above the 29% analyst consensus, fueled by Copilot adoption." },
    { headline: "Microsoft Copilot Now Integrated Into All Microsoft 365 Plans", source: "ZDNet", summary: "Microsoft expanded Copilot AI assistant access to all commercial Microsoft 365 subscribers." },
    { headline: "Microsoft OpenAI Partnership Deepened With New $4B Investment Round", source: "Bloomberg", summary: "Microsoft increased its stake in OpenAI with an additional $4 billion investment." },
    { headline: "Microsoft Teams Reaches 500 Million Daily Active Users", source: "The Verge", summary: "Teams surpassed the 500 million DAU milestone driven by enterprise AI feature adoption." },
    { headline: "Analysts Upgrade Microsoft on Cloud Margin Expansion Outlook", source: "Barron's", summary: "Multiple analysts upgraded MSFT citing structural margin improvement in Azure as AI workloads scale." },
  ]),
  META: makeTickerNews("META", [
    { headline: "Meta Reports Record Ad Revenue, Raises Q2 Guidance", source: "Bloomberg", summary: "Meta Q1 advertising revenue of $42.3B, up 19% year-over-year, driven by AI-enhanced ad targeting." },
    { headline: "Meta's Ray-Ban Smart Glasses Sell Out in Major Markets", source: "Reuters", summary: "Strong consumer demand for the latest generation of Meta Ray-Ban glasses exceeded initial inventory." },
    { headline: "Meta AI Assistant Crosses 1 Billion Monthly Active Users", source: "TechCrunch", summary: "Meta's AI assistant became the first consumer AI product to reach 1 billion MAU." },
    { headline: "Meta Threads Platform Surpasses 300 Million Users", source: "The Information", summary: "Threads, Meta's X alternative, continued its growth trajectory with a 40% increase in MAU." },
    { headline: "Meta Increases Share Buyback Program by $50 Billion", source: "WSJ", summary: "Meta's board approved a $50 billion increase to its share repurchase authorization." },
  ]),
  GOOGL: makeTickerNews("GOOGL", [
    { headline: "Alphabet's Gemini Ultra Achieves Top Scores on New AI Benchmarks", source: "Wired", summary: "Gemini Ultra 2.0 outperforms competing models on coding, reasoning, and multimodal tasks." },
    { headline: "Google Search Revenue Accelerates on AI Overview Adoption", source: "Bloomberg", summary: "AI Overviews in Google Search drove a 15% increase in monetizable query volume." },
    { headline: "Waymo Expands Autonomous Ride Service to Five New Cities", source: "Reuters", summary: "Alphabet's Waymo subsidiary announced commercial robotaxi expansion across the Sun Belt." },
    { headline: "Google Cloud Wins Major Financial Services Contracts in APAC", source: "Financial Times", summary: "Google Cloud signed agreements with three major Asian banks totaling $1.2 billion over five years." },
    { headline: "Alphabet Reports $110 Billion Quarter, Announces Special Dividend", source: "CNBC", summary: "Alphabet exceeded consensus estimates and announced its first-ever special dividend of $0.50 per share." },
  ]),
  AMZN: makeTickerNews("AMZN", [
    { headline: "Amazon AWS Reinvent Announces New Trainium AI Chips for Cost Efficiency", source: "TechCrunch", summary: "AWS's new Trainium chips offer 40% better price/performance for AI training versus GPU alternatives." },
    { headline: "Amazon Prime Membership Crosses 300 Million Globally", source: "Bloomberg", summary: "Amazon Prime reached 300 million global members as international expansion accelerated." },
    { headline: "Amazon Advertising Revenue Surpasses $65 Billion Annual Run Rate", source: "Reuters", summary: "Amazon's fast-growing advertising segment hit a $65B annual run rate, driven by sponsored product growth." },
    { headline: "Amazon Pharmacy Expands Same-Day Prescription Delivery to 50 Cities", source: "CNBC", summary: "Amazon's healthcare push accelerated with same-day pharmacy delivery expanding to 50 major metros." },
    { headline: "Analysts See AWS Re-Acceleration as Key Catalyst for AMZN Stock", source: "Goldman Sachs Research", summary: "Goldman Sachs raised their AMZN price target citing evidence of AWS growth re-acceleration in enterprise." },
  ]),
  IDXX: makeTickerNews("IDXX", [
    { headline: "IDEXX Laboratories Expands VetLab Analyzer Distribution in Asia-Pacific", source: "PR Newswire", summary: "Strategic distribution agreements in Japan, Australia, and South Korea target the growing vet diagnostics market." },
    { headline: "IDEXX Reports 14% Revenue Growth in Companion Animal Diagnostics", source: "Reuters", summary: "IDEXX's flagship companion animal diagnostics segment exceeded expectations with accelerating growth." },
    { headline: "IDEXX Laboratories Launches AI-Powered Digital Pathology Platform", source: "Business Wire", summary: "The new IDEXX AI platform automates cell counting and abnormality detection in veterinary lab samples." },
    { headline: "Veterinary Visit Volumes Remain Strong Despite Economic Concerns", source: "Bloomberg", summary: "Pet healthcare spending continues to show resilience, with vet clinic visit rates at multi-year highs." },
    { headline: "IDEXX Board Approves $500 Million Share Repurchase Program", source: "PR Newswire", summary: "IDEXX Laboratories authorized a new $500 million share buyback to return capital to shareholders." },
  ]),
  LLY: makeTickerNews("LLY", [
    { headline: "Eli Lilly's Tirzepatide Shows Promise in New Cardiovascular Indication", source: "Reuters", summary: "Phase 3 trial data showed tirzepatide reduced major cardiovascular events by 18% versus placebo." },
    { headline: "Lilly's Mounjaro Obesity Indication Approved in Three New Markets", source: "Bloomberg", summary: "Regulatory approvals for Mounjaro (tirzepatide) for obesity were granted in the EU, Japan, and Brazil." },
    { headline: "Eli Lilly Expands Manufacturing Capacity With $4B Indiana Facility", source: "CNBC", summary: "Lilly announced a $4 billion expansion of its Indianapolis manufacturing complex to meet GLP-1 demand." },
    { headline: "Pipeline Update: Lilly's Orforglipron Oral GLP-1 Shows Strong Phase 3 Data", source: "Fierce Pharma", summary: "Lilly's oral GLP-1 drug orforglipron demonstrated 14.7% weight loss at 36 weeks in Phase 3 trials." },
    { headline: "Lilly Alzheimer's Drug donanemab Receives FDA Expanded Approval", source: "Reuters", summary: "The FDA expanded the approved patient population for donanemab to earlier-stage Alzheimer's patients." },
  ]),
};

// ─── Mock Stock Events ────────────────────────────────────────────────────────

export function getMockStockEvents(ticker: string, date: string): StockEventsResponse {
  const watchItem = watchlistItems.find((w) => w.ticker === ticker);
  const changePct = watchItem
    ? parseFloat(((rand(ticker.length * 7 + date.length * 13) - 0.45) * 8).toFixed(2))
    : null;
  const close = watchItem?.price ?? null;

  return {
    ticker,
    date,
    price_change_pct: changePct,
    close,
    news: [
      {
        headline: `${ticker}: Market activity noted on ${date}`,
        source: "Yakiquant Research",
        published_at: `${date}T10:00:00Z`,
        url: null,
        summary: `Elevated trading volume and price movement observed for ${ticker} on this date. Scanner systems flagged this as a notable price event.`,
      },
    ],
    scans: [
      {
        scanner_name: "breakout_momentum",
        score: parseFloat((65 + rand(ticker.length * 11) * 30).toFixed(1)),
        signals: {
          price_vs_20d_high: parseFloat((0.99 + rand(ticker.length * 17) * 0.04).toFixed(3)),
          volume_ratio: parseFloat((1.5 + rand(ticker.length * 19) * 1.5).toFixed(2)),
        },
      },
    ],
    ideas: [
      {
        id: 9000 + ticker.length,
        status: "approved",
        conviction: "medium",
        thesis_summary: `${ticker} shows strong technical and fundamental setup on ${date}. Momentum indicators confirm the move.`,
        bear_case: "Broader market risk could offset stock-specific catalyst.",
        risk_approved: true,
      },
    ],
  };
}

// ─── Data Status ──────────────────────────────────────────────────────────────

export const dataStatus: DataStatus = {
  latest_bar_date: "2026-03-11",
  bars_stale_days: 0,
  latest_news_date: "2026-03-11",
  universe_size: 503,
  snapshot_count: 287,
};
