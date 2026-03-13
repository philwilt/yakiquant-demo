"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScanResult } from "@/lib/types";

const SCANNER_COLORS: Record<string, string> = {
  breakout_momentum: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  post_earnings_continuation: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{score.toFixed(1)}</span>
    </div>
  );
}

function KeySignals({ signals }: { signals: Record<string, unknown> | null }) {
  if (!signals) return <span className="text-muted-foreground text-xs">—</span>;
  const entries = Object.entries(signals).slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <span key={k} className="text-xs text-muted-foreground">
          {k.replace(/_/g, " ")}: <span className="text-foreground">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

interface ScanResultsTableProps {
  data: ScanResult[] | undefined;
  isLoading: boolean;
}

export function ScanResultsTable({ data, isLoading }: ScanResultsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No scanner results for this date. Run the pipeline to scan for setups.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Ticker</TableHead>
          <TableHead className="w-44">Scanner</TableHead>
          <TableHead className="w-36">Score</TableHead>
          <TableHead>Key Signals</TableHead>
          <TableHead className="w-40">Scanned At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono font-medium">{row.ticker}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs rounded border font-medium ${
                  SCANNER_COLORS[row.scanner_name] ?? "bg-muted text-muted-foreground border-border"
                }`}
              >
                {row.scanner_name.replace(/_/g, " ")}
              </span>
            </TableCell>
            <TableCell>
              <ScoreBar score={row.score} />
            </TableCell>
            <TableCell>
              <KeySignals signals={row.signals} />
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-mono">
              {new Date(row.scanned_at).toLocaleTimeString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
