"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  Shield,
  Activity,
  DollarSign,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { DashboardMetrics } from "@/lib/types";
import { TermTooltip } from "@/components/TermTooltip";
import type { GlossaryKey } from "@/lib/glossary";

interface MetricCardProps {
  label: string;
  term?: GlossaryKey;
  value: string;
  subvalue?: string;
  delta?: number;
  icon: React.ReactNode;
  accentColor: string;
  index: number;
}

function MetricCard({
  label,
  term,
  value,
  subvalue,
  delta,
  icon,
  accentColor,
  index,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden hover:border-white/10 transition-colors group">
        {/* Accent glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, ${accentColor}08 0%, transparent 60%)`,
          }}
        />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {term ? (
                <TermTooltip term={term} side="bottom">{label}</TermTooltip>
              ) : (
                label
              )}
            </span>
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <div style={{ color: accentColor }} className="w-3.5 h-3.5">
                {icon}
              </div>
            </div>
          </div>
          <p className="text-xl font-bold font-mono-num tracking-tight">
            {value}
          </p>
          {subvalue && (
            <p
              className={`text-xs font-mono-num mt-1 ${
                delta !== undefined
                  ? delta >= 0
                    ? "text-profit"
                    : "text-loss"
                  : "text-muted-foreground"
              }`}
            >
              {subvalue}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface Props {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: Props) {
  const cards: Omit<MetricCardProps, "index">[] = [
    {
      label: "Total P&L",
      term: "total_pnl" as GlossaryKey,
      value: formatCurrency(metrics.total_pnl),
      subvalue: `${formatPercent(metrics.total_pnl_pct)} all-time`,
      delta: metrics.total_pnl,
      icon: <DollarSign className="w-full h-full" />,
      accentColor: metrics.total_pnl >= 0 ? "#10b981" : "#ef4444",
    },
    {
      label: "Sharpe Ratio",
      term: "sharpe_ratio" as GlossaryKey,
      value: formatNumber(metrics.sharpe_ratio),
      subvalue: metrics.sharpe_ratio >= 1.5 ? "Excellent" : metrics.sharpe_ratio >= 1 ? "Good" : "Below avg",
      delta: metrics.sharpe_ratio - 1,
      icon: <BarChart2 className="w-full h-full" />,
      accentColor: "#3b82f6",
    },
    {
      label: "Max Drawdown",
      term: "max_drawdown" as GlossaryKey,
      value: `${metrics.max_drawdown.toFixed(2)}%`,
      subvalue: `Current ${metrics.current_drawdown.toFixed(2)}%`,
      delta: metrics.max_drawdown,
      icon: <TrendingDown className="w-full h-full" />,
      accentColor: "#ef4444",
    },
    {
      label: "Win Rate",
      term: "win_rate" as GlossaryKey,
      value: `${metrics.win_rate}%`,
      subvalue: `${metrics.total_trades} trades`,
      delta: metrics.win_rate - 50,
      icon: <Target className="w-full h-full" />,
      accentColor: "#10b981",
    },
    {
      label: "Profit Factor",
      term: "profit_factor" as GlossaryKey,
      value: formatNumber(metrics.profit_factor),
      subvalue: `Avg win ${formatCurrency(metrics.avg_win, true)}`,
      delta: metrics.profit_factor - 1,
      icon: <Activity className="w-full h-full" />,
      accentColor: "#8b5cf6",
    },
    {
      label: "Open Positions",
      term: "open_positions" as GlossaryKey,
      value: String(metrics.open_positions),
      subvalue: `${formatCurrency(metrics.buying_power, true)} buying power`,
      icon: <Shield className="w-full h-full" />,
      accentColor: "#f59e0b",
    },
    {
      label: "Avg Win",
      term: "avg_win" as GlossaryKey,
      value: formatCurrency(metrics.avg_win),
      subvalue: `Loss ${formatCurrency(metrics.avg_loss)}`,
      delta: metrics.avg_win,
      icon: <TrendingUp className="w-full h-full" />,
      accentColor: "#10b981",
    },
    {
      label: "Daily P&L",
      term: "daily_pnl" as GlossaryKey,
      value: formatCurrency(metrics.daily_pnl),
      subvalue: formatPercent(metrics.daily_pnl_pct),
      delta: metrics.daily_pnl,
      icon: <Percent className="w-full h-full" />,
      accentColor: metrics.daily_pnl >= 0 ? "#10b981" : "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map((card, i) => (
        <MetricCard key={card.label} {...card} index={i} />
      ))}
    </div>
  );
}
