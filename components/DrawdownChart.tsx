"use client";

import { useMemo } from "react";
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
import type { EquityPoint } from "@/lib/types";
import { TermTooltip } from "@/components/TermTooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const dd = payload[0]?.value as number;
  return (
    <div className="bg-zinc-900 border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm font-mono-num font-semibold ${dd < 0 ? "text-loss" : "text-muted-foreground"}`}>
        {dd.toFixed(2)}%
      </p>
    </div>
  );
}

interface Props {
  data: EquityPoint[];
  maxDrawdown: number;
}

export function DrawdownChart({ data, maxDrawdown }: Props) {
  const drawdownSeries = useMemo(() => {
    let peak = data[0]?.equity ?? 0;
    return data.map((point) => {
      if (point.equity > peak) peak = point.equity;
      const dd = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
      return { date: point.date, drawdown: parseFloat(dd.toFixed(3)) };
    });
  }, [data]);

  if (!drawdownSeries.length) return null;

  const yMin = Math.min(...drawdownSeries.map((d) => d.drawdown));
  const currentDD = drawdownSeries[drawdownSeries.length - 1].drawdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                <TermTooltip term="drawdown">Drawdown</TermTooltip>
              </CardTitle>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <span className="text-xs text-muted-foreground">Max </span>
                  <span className="text-sm font-mono-num font-semibold text-loss">
                    {maxDrawdown.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Current </span>
                  <span
                    className={`text-sm font-mono-num font-semibold ${
                      currentDD < -1 ? "text-loss" : "text-muted-foreground"
                    }`}
                  >
                    {currentDD.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Recovery</p>
              <p className={`text-sm font-semibold ${currentDD > -2 ? "text-profit" : "text-loss"}`}>
                {currentDD > -2 ? "At Peak" : "In DD"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={drawdownSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
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
                interval={Math.floor(drawdownSeries.length / 6)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={[yMin * 1.1, 1]}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#3f3f46" />
              <ReferenceLine y={maxDrawdown} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                strokeWidth={1.5}
                fill="url(#ddGradient)"
                dot={false}
                activeDot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
