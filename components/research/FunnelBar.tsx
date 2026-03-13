"use client";

import type { ScanResult, TradeIdea } from "@/lib/types";

interface FunnelBarProps {
  scans: ScanResult[];
  ideas: TradeIdea[];
}

export function FunnelBar({ scans, ideas }: FunnelBarProps) {
  const scanHits = scans.length;
  const ideasGenerated = ideas.length;
  const approved = ideas.filter((i) => i.status === "approved").length;

  const stats = [
    { label: "Scanner Hits", value: scanHits, color: "text-blue-400" },
    { label: "Ideas Generated", value: ideasGenerated, color: "text-purple-400" },
    { label: "Approved", value: approved, color: "text-green-400" },
  ];

  return (
    <div className="flex items-center gap-2">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="bg-card border border-border rounded-lg px-4 py-2 flex flex-col items-center min-w-[110px]">
            <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
          </div>
          {i < stats.length - 1 && (
            <span className="text-muted-foreground text-lg">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
