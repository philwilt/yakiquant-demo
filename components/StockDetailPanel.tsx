"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStockHistory, useTickerNews } from "@/hooks/useWatchlist";
import { StockEventDrawer } from "@/components/StockEventDrawer";
import type { WatchlistItem } from "@/lib/types";

const RANGES = ["1W", "1M", "3M", "6M", "1Y", "ALL"] as const;
type Range = (typeof RANGES)[number];

const SPIKE_THRESHOLD = 3; // % daily move to highlight

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtVol(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const close = payload[0]?.value as number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bar = payload[0]?.payload as any;
  const changePct: number | undefined = bar?.changePct;
  const isSpike: boolean = bar?.isSpike ?? false;
  return (
    <div className="bg-zinc-900 border border-border rounded-lg p-2.5 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono-num font-semibold">${fmt(close)}</p>
      {changePct !== undefined && (
        <p
          className="font-mono-num mt-0.5"
          style={{ color: changePct >= 0 ? "#10b981" : "#ef4444" }}
        >
          {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
        </p>
      )}
      {isSpike && (
        <p className="text-amber-400 mt-1">Click to view research</p>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SpikeDot(props: any) {
  const { cx, cy, payload, key } = props;
  if (!payload?.isSpike || cx == null || cy == null) return <g key={key} />;
  const color = (payload.changePct ?? 0) >= 0 ? "#10b981" : "#ef4444";
  return (
    <circle
      key={key}
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      fillOpacity={0.85}
      stroke={color}
      strokeWidth={1.5}
      style={{ cursor: "pointer" }}
    />
  );
}

interface Props {
  item: WatchlistItem;
}

export function StockDetailPanel({ item }: Props) {
  const [range, setRange] = useState<Range>("3M");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data, isLoading } = useStockHistory(item.ticker, range);
  const { data: newsData, isLoading: newsLoading } = useTickerNews(item.ticker);

  const positive = (item.change_pct ?? 0) >= 0;
  const accentColor = positive ? "#10b981" : "#ef4444";

  // Compute daily % changes and flag spikes
  const rawBars = data?.bars ?? [];
  const chartData = rawBars.map((b, i) => {
    const prevClose = i > 0 ? rawBars[i - 1].close : null;
    const changePct =
      prevClose != null && prevClose !== 0
        ? ((b.close - prevClose) / prevClose) * 100
        : undefined;
    return {
      date: b.date,
      close: b.close,
      open: b.open,
      high: b.high,
      low: b.low,
      changePct,
      isSpike: changePct !== undefined && Math.abs(changePct) >= SPIKE_THRESHOLD,
    };
  });

  const first = chartData[0]?.close;
  const last = chartData[chartData.length - 1]?.close;
  const rangeReturn = first && last ? ((last - first) / first) * 100 : null;
  const rangePositive = (rangeReturn ?? 0) >= 0;

  const yMin = chartData.length ? Math.min(...chartData.map((d) => d.close)) : 0;
  const yMax = chartData.length ? Math.max(...chartData.map((d) => d.close)) : 0;
  const yPad = (yMax - yMin) * 0.1;

  const spikeCount = chartData.filter((d) => d.isSpike).length;

  function handleChartClick(chartEvent: { activePayload?: { payload: { date: string; isSpike: boolean } }[] } | null) {
    const payload = chartEvent?.activePayload?.[0]?.payload;
    if (payload?.date) {
      setSelectedDate(payload.date);
    }
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={item.ticker}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="rounded-lg border border-border bg-zinc-900 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">{item.ticker}</h2>
                {item.sector && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    {item.sector}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.name}</p>
              {data?.industry && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{data.industry}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono-num font-bold">
                {item.price != null ? `$${fmt(item.price)}` : "—"}
              </p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="text-sm font-mono-num" style={{ color: accentColor }}>
                  {item.change != null
                    ? `${positive ? "+" : ""}$${fmt(Math.abs(item.change))}`
                    : ""}
                </span>
                <span className="text-sm font-mono-num font-medium" style={{ color: accentColor }}>
                  {item.change_pct != null
                    ? `(${positive ? "+" : ""}${item.change_pct.toFixed(2)}%)`
                    : "—"}
                </span>
              </div>
              {item.last_date && (
                <p className="text-[10px] text-muted-foreground/50 mt-1">
                  as of {item.last_date}
                </p>
              )}
            </div>
          </div>

          {/* Range selector + range return */}
          <div className="px-5 pt-3 flex items-center justify-between">
            <div className="flex gap-0.5 p-1 bg-muted rounded-md">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-1 text-xs rounded transition-all ${
                    range === r
                      ? "bg-background text-foreground shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {spikeCount > 0 && !isLoading && (
                <span className="text-[10px] text-muted-foreground">
                  {spikeCount} spike{spikeCount !== 1 ? "s" : ""} — click to research
                </span>
              )}
              {rangeReturn != null && (
                <span
                  className="text-xs font-mono-num font-medium"
                  style={{ color: rangePositive ? "#10b981" : "#ef4444" }}
                >
                  {rangePositive ? "+" : ""}{rangeReturn.toFixed(2)}% ({range})
                </span>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="px-2 pt-2 pb-4">
            {isLoading ? (
              <div className="h-[220px] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No data for this range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  onClick={handleChartClick}
                  style={{ cursor: "pointer" }}
                >
                  <defs>
                    <linearGradient id={`grad-${item.ticker}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                    interval={Math.max(1, Math.floor(chartData.length / 6))}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`}
                    domain={[yMin - yPad, yMax + yPad]}
                    width={52}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={accentColor}
                    strokeWidth={1.5}
                    fill={`url(#grad-${item.ticker})`}
                    dot={SpikeDot}
                    activeDot={{ r: 4, fill: accentColor, stroke: accentColor }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats row */}
          {data && (
            <div className="border-t border-border px-5 py-3 grid grid-cols-4 gap-4">
              {[
                { label: "52W High", value: data.high_52w != null ? `$${fmt(data.high_52w)}` : "—" },
                { label: "52W Low", value: data.low_52w != null ? `$${fmt(data.low_52w)}` : "—" },
                { label: "Avg Vol", value: data.avg_volume != null ? fmtVol(data.avg_volume) : "—" },
                {
                  label: "Bars",
                  value: `${data.bars.length} days`,
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-mono-num font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent news */}
          <div className="border-t border-border px-5 py-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Recent News
            </p>
            {newsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5 animate-pulse">
                    <div className="h-3 bg-zinc-800 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : !newsData?.articles.length ? (
              <p className="text-xs text-muted-foreground">No recent news found</p>
            ) : (
              <div className="space-y-0">
                {newsData.articles.slice(0, 10).map((article, i) => {
                  const isLast = i === Math.min(newsData.articles.length, 10) - 1;
                  const pubDate = article.published_at
                    ? new Date(article.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  return (
                    <div
                      key={i}
                      className={`py-3 ${!isLast ? "border-b border-border" : ""}`}
                    >
                      {article.url ? (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium leading-snug hover:text-blue-400 transition-colors"
                        >
                          {article.headline}
                        </a>
                      ) : (
                        <p className="text-sm font-medium leading-snug">{article.headline}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {[article.source, pubDate].filter(Boolean).join(" · ")}
                      </p>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Event research drawer */}
      <AnimatePresence>
        {selectedDate && (
          <StockEventDrawer
            ticker={item.ticker}
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
