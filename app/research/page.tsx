"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunnelBar } from "@/components/research/FunnelBar";
import { ScanResultsTable } from "@/components/research/ScanResultsTable";
import { IdeasTable } from "@/components/research/IdeasTable";
import { scanResults, tradeIdeas, researchNews } from "@/lib/mock-data";
import type { ResearchNewsItem } from "@/lib/types";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function NewsTab({ items }: { items: ResearchNewsItem[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No news found for scanner tickers on this date.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((article, i) => (
        <div key={i} className="rounded-md border border-border bg-zinc-900 px-3 py-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
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
                <span className="text-[10px] text-muted-foreground/60">{fmtTime(article.published_at)}</span>
              </div>
              {article.summary && (
                <p className="mt-1.5 text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-2">
                  {article.summary}
                </p>
              )}
            </div>
            <span className="text-[10px] font-mono font-semibold text-amber-400 shrink-0 mt-0.5">
              {article.ticker}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResearchPage() {
  const [selectedDate, setSelectedDate] = useState("2026-03-11");

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Research
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-muted border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {/* Demo mode: disabled pipeline trigger */}
          <button
            disabled
            className="px-4 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground bg-muted cursor-not-allowed opacity-60"
          >
            Run Pipeline
          </button>
        </div>
      </div>

      {/* Funnel bar */}
      <FunnelBar scans={scanResults} ideas={tradeIdeas} />

      {/* Tabs */}
      <Card>
        <Tabs defaultValue="scans">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pipeline Results</CardTitle>
              <TabsList className="h-7">
                <TabsTrigger value="scans" className="text-xs px-3">
                  Scanner Results
                </TabsTrigger>
                <TabsTrigger value="ideas" className="text-xs px-3">
                  Trade Ideas
                </TabsTrigger>
                <TabsTrigger value="news" className="text-xs px-3">
                  News
                  {researchNews && researchNews.length > 0 && (
                    <span className="ml-1.5 text-zinc-500">({researchNews.length})</span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <TabsContent value="scans">
              <ScanResultsTable data={scanResults} isLoading={false} />
            </TabsContent>
            <TabsContent value="ideas">
              <IdeasTable data={tradeIdeas} isLoading={false} />
            </TabsContent>
            <TabsContent value="news">
              <NewsTab items={researchNews} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </main>
  );
}
