"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { TradeIdea } from "@/lib/types";
import { IdeaDetailDrawer } from "./IdeaDetailDrawer";

const SCANNER_COLORS: Record<string, string> = {
  breakout_momentum: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  post_earnings_continuation: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const CONVICTION_COLORS: Record<string, string> = {
  high: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const ADV_COLORS: Record<string, string> = {
  proceed: "bg-green-500/15 text-green-400 border-green-500/30",
  caution: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  reject: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  pending: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  executed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  closed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

function Chip({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded border font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

const STATUS_FILTERS = ["All", "Approved", "Rejected", "Pending"] as const;

interface IdeasTableProps {
  data: TradeIdea[] | undefined;
  isLoading: boolean;
}

export function IdeasTable({ data, isLoading }: IdeasTableProps) {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [selectedIdea, setSelectedIdea] = useState<TradeIdea | null>(null);

  const filtered =
    data?.filter((i) => filter === "All" || i.status === filter.toLowerCase()) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex gap-1 mb-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded transition-all ${
              filter === f
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {data && data.length > 0
            ? `No ${filter.toLowerCase()} ideas.`
            : "No trade ideas for this date. Run the pipeline to generate research."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6">#</TableHead>
              <TableHead className="w-20">Ticker</TableHead>
              <TableHead className="w-44">Scanner</TableHead>
              <TableHead className="w-16">Score</TableHead>
              <TableHead className="w-36">Catalyst</TableHead>
              <TableHead className="w-24">Conviction</TableHead>
              <TableHead className="w-20">Entry</TableHead>
              <TableHead className="w-20">Stop</TableHead>
              <TableHead className="w-20">Target</TableHead>
              <TableHead className="w-20">Adv.</TableHead>
              <TableHead className="w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((idea) => (
              <TableRow
                key={idea.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedIdea(idea)}
              >
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {idea.rank ?? "—"}
                </TableCell>
                <TableCell className="font-mono font-medium">{idea.ticker}</TableCell>
                <TableCell>
                  {idea.scanner_name ? (
                    <Chip
                      label={idea.scanner_name.replace(/_/g, " ")}
                      colorClass={
                        SCANNER_COLORS[idea.scanner_name] ??
                        "bg-muted text-muted-foreground border-border"
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {idea.scanner_score !== null ? idea.scanner_score.toFixed(1) : "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {idea.catalyst_type ?? "—"}
                </TableCell>
                <TableCell>
                  {idea.conviction ? (
                    <Chip
                      label={idea.conviction}
                      colorClass={
                        CONVICTION_COLORS[idea.conviction] ??
                        "bg-muted text-muted-foreground border-border"
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {idea.entry_price !== null ? `$${idea.entry_price.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {idea.stop_loss !== null ? `$${idea.stop_loss.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {idea.target_price !== null ? `$${idea.target_price.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell>
                  {idea.adversarial_recommendation ? (
                    <Chip
                      label={idea.adversarial_recommendation}
                      colorClass={
                        ADV_COLORS[idea.adversarial_recommendation] ??
                        "bg-muted text-muted-foreground border-border"
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={idea.status}
                    colorClass={
                      STATUS_COLORS[idea.status] ??
                      "bg-muted text-muted-foreground border-border"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedIdea && (
        <IdeaDetailDrawer idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
      )}
    </>
  );
}
