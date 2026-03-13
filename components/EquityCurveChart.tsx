"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TermTooltip } from "@/components/TermTooltip";
import type { EquityPoint } from "@/lib/types";

const RANGES = ["1M", "3M", "6M", "YTD", "1Y", "ALL"] as const;
type Range = (typeof RANGES)[number];

function filterByRange(data: EquityPoint[], range: Range): EquityPoint[] {
  if (!data.length) return data;
  const last = new Date(data[data.length - 1].date);
  const cutoff = new Date(last);
  switch (range) {
    case "1M": cutoff.setMonth(cutoff.getMonth() - 1); break;
    case "3M": cutoff.setMonth(cutoff.getMonth() - 3); break;
    case "6M": cutoff.setMonth(cutoff.getMonth() - 6); break;
    case "YTD": cutoff.setMonth(0); cutoff.setDate(1); break;
    case "1Y": cutoff.setFullYear(cutoff.getFullYear() - 1); break;
    case "ALL": return data;
  }
  return data.filter((d) => new Date(d.date) >= cutoff);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const eq = payload.find((p: { dataKey: string }) => p.dataKey === "equity");
  const bm = payload.find((p: { dataKey: string }) => p.dataKey === "benchmark");
  const alpha = eq && bm ? eq.value - bm.value : 0;
  return (
    <div className="bg-zinc-900 border border-border rounded-lg p-3 shadow-xl min-w-[180px]">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {eq && (
        <div className="flex justify-between gap-4 text-xs mb-1">
          <span className="text-emerald-400">Portfolio</span>
          <span className="font-mono-num font-semibold">{formatCurrency(eq.value)}</span>
        </div>
      )}
      {bm && (
        <div className="flex justify-between gap-4 text-xs mb-1">
          <span className="text-blue-400">Benchmark</span>
          <span className="font-mono-num font-semibold">{formatCurrency(bm.value)}</span>
        </div>
      )}
      <div className="border-t border-border mt-2 pt-2">
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Alpha</span>
          <span className={`font-mono-num font-semibold ${alpha >= 0 ? "text-profit" : "text-loss"}`}>
            {alpha >= 0 ? "+" : ""}{formatCurrency(alpha)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  data: EquityPoint[];
  startCapital: number;
}

export function EquityCurveChart({ data, startCapital }: Props) {
  const [range, setRange] = useState<Range>("ALL");
  const filtered = useMemo(() => filterByRange(data, range), [data, range]);

  if (!filtered.length) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No equity data yet</p>
      </Card>
    );
  }

  const first = filtered[0];
  const last = filtered[filtered.length - 1];
  const totalReturn = ((last.equity - first.equity) / first.equity) * 100;
  const benchReturn = ((last.benchmark - first.benchmark) / first.benchmark) * 100;
  const isPositive = totalReturn >= 0;

  const yMin = Math.min(...filtered.map((d) => Math.min(d.equity, d.benchmark)));
  const yMax = Math.max(...filtered.map((d) => Math.max(d.equity, d.benchmark)));
  const yPad = (yMax - yMin) * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                <TermTooltip term="equity_curve" side="bottom">Equity Curve</TermTooltip>
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-lg font-bold font-mono-num ${
                    isPositive ? "text-profit" : "text-loss"
                  }`}
                >
                  {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs SPY {benchReturn >= 0 ? "+" : ""}{benchReturn.toFixed(2)}%
                </span>
                <TermTooltip term="alpha" side="bottom">
                  <span
                    className={`text-xs font-mono-num ${
                      totalReturn - benchReturn >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    α {totalReturn - benchReturn >= 0 ? "+" : ""}{(totalReturn - benchReturn).toFixed(2)}%
                  </span>
                </TermTooltip>
              </div>
            </div>
            {/* Range selector */}
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
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-400 rounded" />
              <span className="text-xs text-muted-foreground">Portfolio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-400 rounded opacity-60" />
              <span className="text-xs text-muted-foreground">SPY (scaled)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                interval={Math.floor(filtered.length / 6)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                domain={[yMin - yPad, yMax + yPad]}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={startCapital} stroke="#3f3f46" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#3b82f6"
                strokeWidth={1.5}
                fill="url(#benchGradient)"
                strokeOpacity={0.6}
                dot={false}
                activeDot={{ r: 3, fill: "#3b82f6" }}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
