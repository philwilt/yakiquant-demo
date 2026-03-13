"use client";

import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { WatchlistItem } from "@/lib/types";

interface Props {
  item: WatchlistItem;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  index: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function WatchlistCard({ item, selected, onSelect, index }: Props) {
  const positive = (item.change_pct ?? 0) >= 0;
  const accentColor = positive ? "#10b981" : "#ef4444";
  const sparkData = item.sparkline.map((v) => ({ v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onSelect}
      className={`relative group cursor-pointer rounded-lg border transition-all duration-200 overflow-hidden
        ${selected
          ? "border-zinc-500 bg-zinc-800/80 shadow-lg shadow-black/30"
          : "border-border bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/60"
        }`}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 transition-opacity"
        style={{ backgroundColor: accentColor, opacity: selected ? 1 : 0.4 }}
      />

      <div className="px-4 pt-3 pb-0">
        {/* Header */}
        <div className="flex items-start justify-between pr-4">
          <div>
            <p className="text-sm font-bold tracking-tight">{item.ticker}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[130px] mt-0.5">
              {item.name ?? "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono-num font-semibold">
              {item.price != null ? `$${fmt(item.price)}` : "—"}
            </p>
            <p
              className="text-[11px] font-mono-num font-medium"
              style={{ color: accentColor }}
            >
              {item.change_pct != null
                ? `${positive ? "+" : ""}${item.change_pct.toFixed(2)}%`
                : "—"}
            </p>
          </div>
        </div>

        {/* Sector pill */}
        {item.sector && (
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-2">
            {item.sector}
          </p>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-14 mt-1">
        {sparkData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">No data</span>
          </div>
        )}
      </div>

      {/* Last date */}
      {item.last_date && (
        <p className="text-[9px] text-muted-foreground/50 text-right px-3 pb-2 -mt-1">
          {item.last_date}
        </p>
      )}
    </motion.div>
  );
}
