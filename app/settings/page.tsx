"use client";

import { motion } from "framer-motion";
import { RefreshCw, Database, BarChart2, Zap, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataStatus } from "@/lib/mock-data";

interface JobCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  afterText: string;
}

function JobCard({ icon, title, description, buttonLabel, afterText }: JobCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-zinc-400 font-medium">After running: </span>
          {afterText}
        </p>
        <button
          disabled
          className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-foreground transition-colors border border-border"
          title="Not available in demo"
        >
          {buttonLabel}
        </button>
        <p className="text-[10px] text-amber-500/70 italic">Not available in demo</p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-8 max-w-[900px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manually trigger pipeline jobs and data syncs.</p>
          <p className="text-xs text-amber-500/80 mt-2 italic">Pipeline controls are disabled in demo mode.</p>
        </motion.div>

        {/* Section: Data Freshness */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-muted-foreground"><TrendingUp className="w-4 h-4" /></span>
                    Data Freshness
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Latest bar date</span>
                      <span className="font-mono text-foreground">{dataStatus.latest_bar_date ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Trading days stale</span>
                      <span className={`font-mono font-semibold ${(dataStatus.bars_stale_days ?? 0) > 1 ? "text-amber-400" : "text-emerald-400"}`}>
                        <span className="flex items-center gap-1">
                          {(dataStatus.bars_stale_days ?? 0) > 1 && <AlertTriangle className="w-3 h-3" />}
                          {dataStatus.bars_stale_days ?? 0}d
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Latest news date</span>
                      <span className="font-mono text-foreground">{dataStatus.latest_news_date ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Universe size</span>
                      <span className="font-mono text-foreground">{dataStatus.universe_size.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Portfolio snapshots</span>
                      <span className="font-mono text-foreground">{dataStatus.snapshot_count.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
              <JobCard
                icon={<Database className="w-4 h-4" />}
                title="Ingest Bars"
                description="Pulls daily OHLCV bars from Alpaca for all S&P 500 symbols, incrementally from the latest stored date to today. Keeps scanners and indicators current. Takes 1–3 minutes for a typical incremental update."
                afterText="Bar ingest updates market_data_daily. Latest bar date above refreshes. Scanners and the Watchlist price data will reflect the new bars on next page load."
                buttonLabel="Ingest Bars"
              />
            </motion.div>
          </div>
        </section>

        {/* Section: Broker Sync */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Broker Sync</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <JobCard
                icon={<RefreshCw className="w-4 h-4" />}
                title="Sync Broker Data"
                description="Pulls the current status of all open orders and open positions directly from Alpaca and writes the results to the local database. This is fast — it only reads from the broker, no LLM calls or scanner runs."
                afterText="The Trade Log updates to show filled or cancelled orders instead of Pending. The Positions table reflects the broker's current holdings."
                buttonLabel="Sync Now"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <JobCard
                icon={<Database className="w-4 h-4" />}
                title="Record Portfolio Snapshot"
                description="Captures today's equity, cash balance, open P&L, and position count from Alpaca and saves it as a row in the portfolio_snapshots table. One snapshot per day is the norm; re-running the same day overwrites the previous entry."
                afterText="The Equity Curve chart gets a new data point for today. The Daily P&L bar chart and Drawdown chart update. Portfolio Value in the header reflects the latest Alpaca equity."
                buttonLabel="Record Snapshot"
              />
            </motion.div>
          </div>
        </section>

        {/* Section: Pipeline */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <JobCard
                icon={<BarChart2 className="w-4 h-4" />}
                title="Run Research Pipeline"
                description="Runs both stock scanners (Post-Earnings Continuation and Breakout Momentum), sends each hit through the Claude LLM to generate a trade thesis and adversarial review, then gates each idea through the risk manager. No orders are submitted. Takes 1–3 minutes depending on how many tickers hit the scanners."
                afterText="The Research page shows new scanner hits, trade ideas with conviction scores, and risk approvals or rejections for today's date. Ideas marked Approved are ready for order submission."
                buttonLabel="Run Research"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <JobCard
                icon={<Zap className="w-4 h-4" />}
                title="Run Full Daily Pipeline"
                description="The complete morning workflow in one shot: syncs positions, runs both scanners, generates LLM theses, evaluates risk, and submits paper buy orders to Alpaca for all approved ideas. This is the main job that should run once each market morning after bars are ingested. Takes 2–5 minutes."
                afterText="New positions appear in the Positions table. New orders appear in the Trade Log as Pending, then fill shortly after (use Sync Broker Data to update their status). A portfolio snapshot is recorded automatically."
                buttonLabel="Run Daily Pipeline"
              />
            </motion.div>
          </div>
        </section>

        {/* Section: Info */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-md border border-border bg-zinc-900/50 px-5 py-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            Typical daily workflow
          </div>
          <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
            <li>Run <span className="text-zinc-300">Full Daily Pipeline</span> each morning after market open to scan, analyze, and place orders.</li>
            <li>Run <span className="text-zinc-300">Sync Broker Data</span> mid-day or after market close to update order fill statuses.</li>
            <li>Run <span className="text-zinc-300">Record Portfolio Snapshot</span> after market close to capture the day&apos;s equity for the charts.</li>
          </ol>
        </motion.section>
      </main>
    </div>
  );
}
