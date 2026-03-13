"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStockEvents } from "@/hooks/useWatchlist";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

interface Props {
  ticker: string;
  date: string;
  onClose: () => void;
}

export function StockEventDrawer({ ticker, date, onClose }: Props) {
  const { data, isLoading } = useStockEvents(ticker, date);

  const changePct = data?.price_change_pct ?? null;
  const isPositive = (changePct ?? 0) >= 0;
  const changeColor = changePct === null ? "#71717a" : isPositive ? "#10b981" : "#ef4444";
  const isSpike = changePct !== null && Math.abs(changePct) >= 3;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <motion.aside
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-[480px] max-w-full bg-zinc-950 border-l border-border z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">
                {ticker}
              </span>
              {isSpike && (
                <span
                  className="text-[10px] uppercase tracking-widest rounded px-1.5 py-0.5 font-semibold"
                  style={{ backgroundColor: isPositive ? "#10b98122" : "#ef444422", color: changeColor }}
                >
                  {isPositive ? "spike" : "drop"}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold mt-1">{fmtDate(date)}</h3>
          </div>
          <div className="flex items-center gap-4">
            {changePct !== null && (
              <div className="text-right">
                {data?.close != null && (
                  <p className="text-sm font-mono-num font-semibold">${fmt(data.close)}</p>
                )}
                <p className="text-sm font-mono-num font-medium" style={{ color: changeColor }}>
                  {isPositive ? "+" : ""}{changePct.toFixed(2)}%
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">No data available for this date.</p>
          ) : (
            <>
              {/* Scanner hits */}
              {data.scans.length > 0 && (
                <section>
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Scanner Hits
                  </h4>
                  <div className="space-y-2">
                    {data.scans.map((s, i) => (
                      <div key={i} className="rounded-md border border-border bg-zinc-900 px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{s.scanner_name.replace(/_/g, " ")}</span>
                          <span className="text-xs font-mono-num text-amber-400">
                            score {s.score.toFixed(2)}
                          </span>
                        </div>
                        {s.signals && Object.keys(s.signals).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                            {Object.entries(s.signals).map(([k, v]) => (
                              <span key={k} className="text-[10px] text-muted-foreground">
                                {k}: <span className="text-foreground/70">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trade ideas */}
              {data.ideas.length > 0 && (
                <section>
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Trade Ideas
                  </h4>
                  <div className="space-y-2">
                    {data.ideas.map((idea) => (
                      <div key={idea.id} className="rounded-md border border-border bg-zinc-900 px-3 py-2.5 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase rounded px-1.5 py-0.5 font-semibold ${
                              idea.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : idea.status === "rejected"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {idea.status}
                          </span>
                          {idea.conviction && (
                            <span className="text-[10px] text-muted-foreground">
                              conviction: <span className="text-foreground/70">{idea.conviction}</span>
                            </span>
                          )}
                        </div>
                        {idea.thesis_summary && (
                          <p className="text-xs text-foreground/80 leading-relaxed">{idea.thesis_summary}</p>
                        )}
                        {idea.bear_case && (
                          <p className="text-[11px] text-red-400/70 leading-relaxed italic">
                            Bear: {idea.bear_case}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* News */}
              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  News
                  {data.news.length > 0 && (
                    <span className="ml-1.5 text-zinc-600">({data.news.length})</span>
                  )}
                </h4>
                {data.news.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No news found for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {data.news.map((article, i) => (
                      <div key={i} className="rounded-md border border-border bg-zinc-900 px-3 py-2.5">
                        {article.url ? (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-400 hover:text-blue-300 leading-snug"
                          >
                            {article.headline}
                          </a>
                        ) : (
                          <p className="text-xs font-medium leading-snug">{article.headline}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {article.source && (
                            <span className="text-[10px] text-muted-foreground">{article.source}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground/60">
                            {fmtTime(article.published_at)}
                          </span>
                        </div>
                        {article.summary && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {data.news.length === 0 && data.scans.length === 0 && data.ideas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No research data found for {fmtDate(date)}.
                </p>
              )}
            </>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
