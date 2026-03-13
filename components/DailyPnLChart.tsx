"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  Cell,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const pnl = payload[0]?.value as number;
  const ret = payload[0]?.payload?.return as number;
  return (
    <div className="bg-zinc-900 border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm font-mono-num font-semibold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
        {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
      </p>
      <p className={`text-xs font-mono-num mt-0.5 ${ret >= 0 ? "text-profit" : "text-loss"}`}>
        {ret >= 0 ? "+" : ""}{ret.toFixed(3)}%
      </p>
    </div>
  );
}

interface Props {
  data: EquityPoint[];
}

export function DailyPnLChart({ data }: Props) {
  const dailyReturns = useMemo(() => {
    if (data.length < 2) return [];
    return data.slice(1).map((point, i) => {
      const prev = data[i].equity;
      const ret = prev > 0 ? ((point.equity - prev) / prev) * 100 : 0;
      const pnl = point.equity - prev;
      return {
        date: point.date,
        return: parseFloat(ret.toFixed(4)),
        pnl: parseFloat(pnl.toFixed(2)),
      };
    });
  }, [data]);

  const recent = useMemo(() => dailyReturns.slice(-60), [dailyReturns]);

  const winDays = recent.filter((d) => d.pnl > 0).length;
  const loseDays = recent.filter((d) => d.pnl < 0).length;
  const totalPnl = recent.reduce((s, d) => s + d.pnl, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                <TermTooltip term="daily_pnl">Daily P&L</TermTooltip>
              </CardTitle>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <span className="text-xs text-muted-foreground">60d Total </span>
                  <span className={`text-sm font-mono-num font-semibold ${totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Wins</p>
                <p className="text-sm font-semibold text-profit">{winDays}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Losses</p>
                <p className="text-sm font-semibold text-loss">{loseDays}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="text-sm font-semibold text-foreground">
                  {recent.length > 0 ? ((winDays / recent.length) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={recent} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
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
                interval={Math.floor(recent.length / 6)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#3f3f46" />
              <Bar dataKey="pnl" radius={[2, 2, 0, 0]} maxBarSize={12}>
                {recent.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
