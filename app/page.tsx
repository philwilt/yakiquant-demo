"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCards } from "@/components/MetricsCards";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { DrawdownChart } from "@/components/DrawdownChart";
import { DailyPnLChart } from "@/components/DailyPnLChart";
import { ExposureChart } from "@/components/ExposureChart";
import { PositionsTable } from "@/components/PositionsTable";
import { TradeLog } from "@/components/TradeLog";
import {
  metrics,
  equitySeries,
  positions,
  trades,
  sectorExposure,
  strategyExposure,
} from "@/lib/mock-data";

const STRATEGY_COLORS: Record<string, string> = {
  breakout_momentum: "#3b82f6",
  post_earnings_continuation: "#8b5cf6",
};

const strategyExposureWithColors = strategyExposure.map((s) => ({
  ...s,
  color: STRATEGY_COLORS[s.strategy] ?? "#6b7280",
}));

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader metrics={metrics} onRefresh={async () => {}} />

      <main className="px-6 py-5 space-y-4 max-w-[1600px] mx-auto">
        {/* Row 1: Metric cards */}
        <MetricsCards metrics={metrics} />

        {/* Row 2: Equity curve (2/3) + Exposure (1/3) */}
        <div className="grid grid-cols-3 gap-4 h-[360px]">
          <div className="col-span-2 h-full">
            <EquityCurveChart data={equitySeries} startCapital={100_000} />
          </div>
          <div className="col-span-1 h-full">
            <ExposureChart
              sectors={sectorExposure}
              strategies={strategyExposureWithColors}
              totalEquity={metrics.total_equity}
            />
          </div>
        </div>

        {/* Row 3: Drawdown (1/2) + Daily PnL (1/2) */}
        <div className="grid grid-cols-2 gap-4 h-[280px]">
          <div className="h-full">
            <DrawdownChart
              data={equitySeries}
              maxDrawdown={(metrics.max_drawdown ?? 0) * 100}
            />
          </div>
          <div className="h-full">
            <DailyPnLChart data={equitySeries} />
          </div>
        </div>

        {/* Row 4: Positions table */}
        <PositionsTable positions={positions} />

        {/* Row 5: Trade log */}
        <TradeLog trades={trades} />

        {/* Footer */}
        <div className="flex items-center justify-between py-4 text-xs text-muted-foreground border-t border-border">
          <span>Yakiquant Research Lab · Demo Mode</span>
          <span>Static mock data · Not financial advice</span>
        </div>
      </main>
    </div>
  );
}
