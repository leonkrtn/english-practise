"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Lightbulb } from "lucide-react";
import { MATH_RULES_BY_ID, MATH_TOPIC_META, rulesForTopic, type MathRule } from "@/lib/math";
import Formula from "@/components/Formula";
import { Button } from "@/components/ui/button";

/** Topic + rule label above every math exercise, in the topic's own colour. */
export function MathBadge({ rule }: { rule: MathRule }) {
  const meta = MATH_TOPIC_META[rule.topic];
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span
        className={
          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm bg-gradient-to-r " +
          meta.grad
        }
      >
        {meta.label}
      </span>
      <span className="text-[12px] font-semibold text-ink-soft">{rule.title}</span>
    </div>
  );
}

/**
 * Stepwise hints. Each press reveals one more, and the count is reported back so the session can
 * charge the XP — the same contract the vocabulary exercises' useHints() uses.
 */
export function useMathHints(hints: string[]) {
  const [revealed, setRevealed] = useState(0);
  const reveal = () => setRevealed((n) => Math.min(hints.length, n + 1));
  return { revealed, reveal, hintsUsed: revealed, exhausted: revealed >= hints.length };
}

export function HintStack({ hints, revealed, onReveal }: { hints: string[]; revealed: number; onReveal: () => void }) {
  if (hints.length === 0) return null;
  return (
    <div className="mt-3">
      {revealed > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {hints.slice(0, revealed).map((h, i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-amber-light/60 px-3 py-2 text-[13px] text-ink-soft leading-snug">
              <Lightbulb size={13} className="text-amber shrink-0 mt-0.5" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      )}
      {revealed < hints.length && (
        <Button
          onClick={onReveal}
          variant="ghost"
          className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-amber-light hover:border-amber/40 hover:text-amber-dark transition-colors"
        >
          <Lightbulb size={13} />
          {revealed === 0 ? "Tipp" : "Nächster Tipp"}
          <span className="text-[11px] text-ink-faint">
            ({revealed}/{hints.length})
          </span>
        </Button>
      )}
    </div>
  );
}

/** The worked path, shown inside the feedback panel after answering. */
export function SolutionPath({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {steps.map((s, i) => (
        <div key={i} className="flex items-baseline gap-2">
          <span className="text-[10px] font-bold text-ink-faint tabular-nums shrink-0 w-4">{i + 1}</span>
          <Formula tex={s} className="text-[14px]" />
        </div>
      ))}
    </div>
  );
}

/** Collapsible reference of every rule in the current topic, available mid-question. */
export function FormulaSheet({ rule }: { rule: MathRule }) {
  const [open, setOpen] = useState(false);
  const siblings = rulesForTopic(rule.topic);
  return (
    <div className="mt-3">
      <Button
        onClick={() => setOpen((o) => !o)}
        variant="ghost"
        aria-expanded={open}
        className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-blue-lighter hover:border-blue/30 hover:text-blue-dark transition-colors"
      >
        <BookOpen size={13} />
        Formelsammlung
        <ChevronDown size={13} className={"transition-transform " + (open ? "rotate-180" : "")} />
      </Button>
      {open && (
        <div className="mt-2 rounded-xl border border-line-soft bg-bg p-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
          {siblings.map((r) => (
            <div key={r.id} className={"rounded-lg px-3 py-2 " + (r.id === rule.id ? "bg-blue-light/60" : "bg-card")}>
              <div className="text-[11px] font-semibold text-ink-faint mb-0.5">{r.title}</div>
              <Formula tex={r.formulaTex} className="text-[13px]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The one-line syntax reminder under every typed math input. */
export function MathSyntaxHint() {
  return (
    <div className="text-[12px] text-ink-faint mt-1.5">
      Use <code className="font-mono">*</code> for multiplication, <code className="font-mono">^</code> for powers,{" "}
      <code className="font-mono">sqrt()</code> / <code className="font-mono">ln()</code> for roots and logs — e.g.{" "}
      <code className="font-mono">3*x^2</code>, <code className="font-mono">e^(2x)</code>.
    </div>
  );
}

export function ruleFor(ruleId: string): MathRule {
  return MATH_RULES_BY_ID[ruleId];
}
