"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
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
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Position } from "@/lib/types";

function ScoreDot({ score }: { score: number }) {
  const color =
    score >= 80
      ? "#10b981"
      : score >= 65
      ? "#f59e0b"
      : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono-num text-xs" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

interface Props {
  positions: Position[];
  onRefresh?: () => void;
}

export function PositionsTable({ positions }: Props) {
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalValue = positions.reduce((s, p) => s + p.qty * p.last_price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Open Positions
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {positions.length} positions
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Exposure</p>
                <p className="text-sm font-mono-num font-semibold">
                  {formatCurrency(totalValue, true)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Open P&L</p>
                <p
                  className={`text-sm font-mono-num font-semibold ${
                    totalPnl >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {totalPnl >= 0 ? "+" : ""}
                  {formatCurrency(totalPnl)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="pl-5">Symbol</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg Cost</TableHead>
                <TableHead className="text-right">Last</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Return</TableHead>
                <TableHead className="text-right pr-5">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos, i) => (
                <motion.tr
                  key={pos.symbol}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="border-b border-border transition-colors hover:bg-white/[0.025]"
                >
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1 h-6 rounded-full flex-shrink-0 ${
                          pos.pnl >= 0 ? "bg-profit" : "bg-loss"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-sm tracking-wide">
                          {pos.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pos.entry_date}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {pos.strategy === "breakout_momentum"
                        ? "Breakout"
                        : pos.strategy
                        ? "Post-Earn"
                        : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {pos.sector}
                  </TableCell>
                  <TableCell className="text-right font-mono-num text-sm">
                    {pos.qty.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono-num text-sm text-muted-foreground">
                    {formatCurrency(pos.avg_cost)}
                  </TableCell>
                  <TableCell className="text-right font-mono-num text-sm">
                    {formatCurrency(pos.last_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-end gap-1 font-mono-num text-sm font-medium ${
                        pos.pnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {pos.pnl >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {pos.pnl >= 0 ? "+" : ""}
                      {formatCurrency(pos.pnl)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-mono-num text-sm font-medium ${
                        pos.pnl_pct >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatPercent(pos.pnl_pct)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <ScoreDot score={pos.score ?? 0} />
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
