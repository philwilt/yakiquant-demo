"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, Settings, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { DashboardMetrics } from "@/lib/types";

interface Props {
  metrics: DashboardMetrics;
  onRefresh?: () => Promise<void>;
}

export function DashboardHeader({ metrics }: Props) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
    >
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Yakiquant
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            Research Lab
          </span>
        </div>
        <div className="ml-2 h-4 w-px bg-border" />
        <Badge variant="profit" className="gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Paper Trading
        </Badge>
      </div>

      {/* Center: equity summary */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            Portfolio Value
          </p>
          <p className="text-base font-semibold font-mono-num">
            {formatCurrency(metrics.total_equity)}
          </p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            Today
          </p>
          <p
            className={`text-sm font-semibold font-mono-num ${
              metrics.daily_pnl >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {metrics.daily_pnl >= 0 ? "+" : ""}
            {formatCurrency(metrics.daily_pnl)} ({metrics.daily_pnl_pct >= 0 ? "+" : ""}
            {metrics.daily_pnl_pct.toFixed(2)}%)
          </p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            Cash
          </p>
          <p className="text-sm font-semibold font-mono-num text-muted-foreground">
            {formatCurrency(metrics.cash, true)}
          </p>
        </div>
      </div>

      {/* Right: meta */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{dateStr}</p>
          <p className="text-xs text-muted-foreground">{timeStr} EST</p>
        </div>
        <div className="h-4 w-px bg-border" />
        <Link href="/settings" className="p-2 rounded-md hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="w-3.5 h-3.5" />
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3 h-3 text-amber-400" />
          <span className="text-amber-400">Demo</span>
        </div>
      </div>
    </motion.header>
  );
}
