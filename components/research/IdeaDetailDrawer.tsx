"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TradeIdea } from "@/lib/types";

const ADV_COLORS: Record<string, string> = {
  proceed: "bg-green-500/15 text-green-400 border-green-500/30",
  caution: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  reject: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  pending: "bg-gray-500/15 text-gray-400 border-gray-500/30",
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

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/40 rounded-lg px-4 py-3 flex-1 min-w-[100px]">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-mono font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4 mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface IdeaDetailDrawerProps {
  idea: TradeIdea;
  onClose: () => void;
}

export function IdeaDetailDrawer({ idea, onClose }: IdeaDetailDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const cat = idea.catalyst_classification ?? {};
  const thesis = idea.thesis ?? {};
  const adv = idea.adversarial_review ?? {};
  const riskRaw = idea.risk_check ?? {};
  const risk = (typeof riskRaw.risk_review === "object" && riskRaw.risk_review !== null
    ? riskRaw.risk_review
    : riskRaw) as Record<string, unknown>;
  const checkFailures = Array.isArray(riskRaw.check_failures)
    ? (riskRaw.check_failures as string[])
    : [];

  const entry = idea.entry_price;
  const stop = idea.stop_loss;
  const target = idea.target_price;

  const stopPct = entry && stop ? (((stop - entry) / entry) * 100).toFixed(1) : null;
  const targetPct = entry && target ? (((target - entry) / entry) * 100).toFixed(1) : null;
  const riskReward =
    entry && stop && target ? ((target - entry) / (entry - stop)).toFixed(2) : null;

  const riskFactors = Array.isArray(adv.failure_modes) ? (adv.failure_modes as string[]) : [];
  const concerns = Array.isArray(risk.concerns) ? (risk.concerns as string[]) : [];
  const riskApproved = idea.risk_approved;

  const catType = typeof cat.catalyst_type === "string" ? cat.catalyst_type : null;
  const catSummary = typeof cat.summary === "string" ? cat.summary : null;
  const thesisText = typeof thesis.thesis === "string" ? thesis.thesis : null;
  const thesisEntryRationale = typeof thesis.entry_rationale === "string" ? thesis.entry_rationale : null;
  const thesisHoldDays = typeof thesis.suggested_hold_days === "number" ? thesis.suggested_hold_days : null;
  const advRecommendation = typeof adv.recommendation === "string" ? adv.recommendation : null;
  const advCritique = typeof adv.critique === "string" ? adv.critique : null;
  const advFailureProb = typeof adv.failure_probability === "number" ? adv.failure_probability : null;
  const riskRationale = typeof risk.rationale === "string" ? risk.rationale : null;
  const riskSizingPct = typeof risk.sizing_pct === "number" ? risk.sizing_pct : null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        key="drawer"
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold font-mono">{idea.ticker}</span>
              <Chip
                label={idea.status}
                colorClass={STATUS_COLORS[idea.status] ?? "bg-muted text-muted-foreground border-border"}
              />
              {idea.rank !== null && (
                <Chip label={`Rank #${idea.rank}`} colorClass="bg-muted text-muted-foreground border-border" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {idea.scanner_name && <span>{idea.scanner_name.replace(/_/g, " ")}</span>}
              {idea.scanner_score !== null && <span>· Score {idea.scanner_score.toFixed(1)}</span>}
              <span>· {idea.idea_date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none mt-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Section 1: Trade Setup */}
          <Section title="Trade Setup">
            <div className="flex gap-2 flex-wrap">
              <StatBox label="Entry" value={entry !== null ? `$${entry.toFixed(2)}` : "—"} />
              <StatBox
                label="Stop Loss"
                value={stop !== null ? `$${stop.toFixed(2)}` : "—"}
                sub={stopPct !== null ? `${stopPct}%` : undefined}
              />
              <StatBox
                label="Target"
                value={target !== null ? `$${target.toFixed(2)}` : "—"}
                sub={targetPct !== null ? `+${targetPct}%` : undefined}
              />
              <StatBox
                label="Position Size"
                value={
                  idea.position_size_pct !== null
                    ? `${(idea.position_size_pct * 100).toFixed(1)}%`
                    : "—"
                }
                sub={riskReward !== null ? `R:R ${riskReward}x` : undefined}
              />
            </div>
          </Section>

          {/* Section 2: Catalyst */}
          <Section title="Catalyst">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium">{catType ?? "Unknown"}</span>
              {idea.catalyst_confidence !== null && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${((idea.catalyst_confidence ?? 0) * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {((idea.catalyst_confidence ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            {catSummary && <p className="text-sm text-muted-foreground">{catSummary}</p>}
          </Section>

          {/* Section 3: Trade Thesis */}
          {(thesisText || thesisEntryRationale) && (
            <Section title="Trade Thesis">
              {thesisText && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{thesisText}</p>
              )}
              {thesisEntryRationale && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Entry rationale</div>
                  <p className="text-sm text-muted-foreground">{thesisEntryRationale}</p>
                </div>
              )}
              {thesisHoldDays !== null && (
                <div className="mt-2 text-xs text-muted-foreground">Hold: {thesisHoldDays} days</div>
              )}
            </Section>
          )}

          {/* Section 4: Adversarial Review */}
          {(advCritique || advRecommendation) && (
            <Section title="Adversarial Review">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Recommendation:</span>
                {advRecommendation && (
                  <Chip
                    label={advRecommendation}
                    colorClass={ADV_COLORS[advRecommendation] ?? "bg-muted text-muted-foreground border-border"}
                  />
                )}
                {advFailureProb !== null && (
                  <span className="text-xs text-muted-foreground">
                    Failure prob: {(advFailureProb * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              {advCritique && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{advCritique}</p>
              )}
              {riskFactors.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Risk factors</div>
                  <ul className="space-y-1">
                    {riskFactors.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-red-400 shrink-0">·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {/* Section 5: Risk Check */}
          {Object.keys(riskRaw).length > 0 && (
            <Section title="Risk Check">
              <div className="flex items-center gap-2 mb-3">
                <Chip
                  label={riskApproved ? "Approved" : "Rejected"}
                  colorClass={
                    riskApproved
                      ? "bg-green-500/15 text-green-400 border-green-500/30"
                      : "bg-red-500/15 text-red-400 border-red-500/30"
                  }
                />
                {riskSizingPct !== null && (
                  <span className="text-xs text-muted-foreground">
                    Suggested size: {(riskSizingPct * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              {riskRationale && (
                <p className="text-sm text-muted-foreground mb-3">{riskRationale}</p>
              )}
              {concerns.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Concerns</div>
                  <ul className="space-y-1">
                    {concerns.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-amber-400 shrink-0">·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {checkFailures.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Rule failures</div>
                  <ul className="space-y-1">
                    {checkFailures.map((f, i) => (
                      <li key={i} className="text-xs text-red-400 flex gap-2">
                        <span className="shrink-0">✕</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Demo footer — no trade actions */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Trade execution not available in demo mode.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
