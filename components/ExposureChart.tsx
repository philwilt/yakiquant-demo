"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TermTooltip } from "@/components/TermTooltip";
import { formatCurrency } from "@/lib/utils";
import type { SectorExposure } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as SectorExposure;
  return (
    <div className="bg-zinc-900 border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{d.sector}</p>
      <p className="text-sm font-mono-num font-semibold">{formatCurrency(d.value)}</p>
      <p className="text-xs text-muted-foreground">{d.pct}% of portfolio</p>
    </div>
  );
}

interface Props {
  sectors: SectorExposure[];
  strategies: { strategy: string; value: number; pct: number; color: string }[];
  totalEquity: number;
}

export function ExposureChart({ sectors, strategies, totalEquity }: Props) {
  const invested = sectors
    .filter((s) => s.sector !== "Cash")
    .reduce((a, s) => a + s.value, 0);
  const investedPct = ((invested / totalEquity) * 100).toFixed(1);

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
                <TermTooltip term="exposure">Exposure</TermTooltip>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {investedPct}% deployed · {(100 - parseFloat(investedPct)).toFixed(1)}% cash
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-4">
          <Tabs defaultValue="sector">
            <TabsList className="mb-3">
              <TabsTrigger value="sector">Sector</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="sector">
              <div className="space-y-2">
                {sectors.map((s) => (
                  <div key={s.sector} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {s.sector}
                        </span>
                        <span className="text-xs font-mono-num text-foreground ml-2 flex-shrink-0">
                          {s.pct}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(s.pct, 100)}%` }}
                          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: s.color, opacity: s.sector === "Cash" ? 0.4 : 1 }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono-num text-muted-foreground flex-shrink-0 w-16 text-right">
                      {formatCurrency(s.value, true)}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategy">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={strategies} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="strategy"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    width={90}
                    tickFormatter={(v: string) =>
                      v === "breakout_momentum" ? "Breakout" : "Post-Earnings"
                    }
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Value"]}
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {strategies.map((s, i) => (
                      <Cell key={i} fill={s.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {strategies.map((s) => (
                  <div key={s.strategy} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {s.strategy === "breakout_momentum" ? "Breakout" : "Post-Earnings"}{" "}
                      <span className="font-mono-num">{s.pct}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
