"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

interface Props {
  term: GlossaryKey;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function TermTooltip({ term, children, side = "top" }: Props) {
  const entry = GLOSSARY[term];

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            {children}
            <Info className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[260px] space-y-1.5 p-3">
          <span className="block font-semibold text-foreground text-xs">{entry.label}</span>
          <span className="block text-muted-foreground leading-relaxed text-xs">{entry.explanation}</span>
          <a
            href={entry.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors text-xs inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more →
          </a>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
