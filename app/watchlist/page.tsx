"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { WatchlistCard } from "@/components/WatchlistCard";
import { StockDetailPanel } from "@/components/StockDetailPanel";
import { watchlistItems } from "@/lib/mock-data";
import type { WatchlistItem } from "@/lib/types";

export default function WatchlistPage() {
  const items = watchlistItems;
  const [selected, setSelected] = useState<WatchlistItem | null>(null);

  function handleSelect(item: WatchlistItem) {
    setSelected((prev) => (prev?.ticker === item.ticker ? null : item));
  }

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Watchlist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? "stock" : "stocks"} tracked · S&P 500 universe
          </p>
        </div>

        {/* Add ticker input — disabled in demo */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                disabled
                placeholder="Demo mode"
                className="pl-7 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md w-36
                  focus:outline-none font-mono placeholder:font-sans
                  placeholder:text-muted-foreground uppercase opacity-50 cursor-not-allowed"
              />
            </div>
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-600
                rounded-md opacity-40 cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Card grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        >
          {items.map((item, i) => (
            <WatchlistCard
              key={item.ticker}
              item={item}
              index={i}
              selected={selected?.ticker === item.ticker}
              onSelect={() => handleSelect(item)}
              onRemove={() => {}}
            />
          ))}
        </motion.div>

        {/* Detail panel */}
        {selected && (
          <StockDetailPanel item={selected} />
        )}
      </div>
    </main>
  );
}
