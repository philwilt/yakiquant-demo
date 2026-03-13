"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Trade } from "@/lib/types";

function StatusBadge({ status }: { status: Trade["status"] }) {
  if (status === "FILLED") return <Badge variant="profit">Filled</Badge>;
  if (status === "PARTIAL") return <Badge variant="warning">Partial</Badge>;
  if (status === "CANCELED" || status === "EXPIRED") return <Badge variant="outline">Cancelled</Badge>;
  if (status === "SUBMITTED" || status === "NEW" || status === "ACCEPTED" || status === "PENDING_NEW")
    return <Badge variant="neutral">Pending</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function SideBadge({ side }: { side: Trade["side"] }) {
  return (
    <Badge variant={side === "BUY" ? "neutral" : "warning"}>
      {side}
    </Badge>
  );
}

interface Props {
  trades: Trade[];
}

export function TradeLog({ trades }: Props) {
  const [filter, setFilter] = useState<"all" | "filled" | "open">("all");

  const closed = trades.filter((t) => t.status === "FILLED" && t.side === "SELL");
  const open = trades.filter((t) =>
    ["SUBMITTED", "NEW", "ACCEPTED", "PENDING_NEW"].includes(t.status)
  );
  const visible =
    filter === "all" ? trades : filter === "filled" ? closed : open;

  const realizedPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winCount = closed.filter((t) => (t.pnl ?? 0) > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <Card>
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Trade Log
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {trades.length} total
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Realized P&L</p>
                <p
                  className={`text-sm font-mono-num font-semibold ${
                    realizedPnl >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {realizedPnl >= 0 ? "+" : ""}
                  {formatCurrency(realizedPnl)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-sm font-mono-num font-semibold">
                  {closed.length > 0
                    ? ((winCount / closed.length) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 p-1 bg-muted rounded-md w-fit mt-2">
            {(["all", "filled", "open"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded transition-all capitalize ${
                  filter === f
                    ? "bg-background text-foreground shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "filled" ? "Closed" : "Open"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5">ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.slice(0, 40).map((trade, i) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className="border-b border-border transition-colors hover:bg-white/[0.025]"
                  >
                    <TableCell className="pl-5">
                      <span className="text-xs font-mono text-muted-foreground">
                        {trade.id}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {trade.date}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm tracking-wide">
                        {trade.symbol}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {trade.strategy === "breakout_momentum"
                          ? "Breakout"
                          : "Post-Earn"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <SideBadge side={trade.side} />
                    </TableCell>
                    <TableCell className="text-right font-mono-num text-sm">
                      {trade.qty.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono-num text-sm text-muted-foreground">
                      {trade.price != null ? formatCurrency(trade.price) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.pnl !== null ? (
                        <span
                          className={`font-mono-num text-sm font-medium ${
                            trade.pnl >= 0 ? "text-profit" : "text-loss"
                          }`}
                        >
                          {trade.pnl >= 0 ? "+" : ""}
                          {formatCurrency(trade.pnl)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <StatusBadge status={trade.status} />
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
