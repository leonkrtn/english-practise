"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Quote } from "lucide-react";
import { memoSetMeta, memoRulesForSet, type MemoRule } from "@/lib/memo";
import { Button } from "@/components/ui/button";
import Formula from "@/components/Formula";

/** Set + rule label above every memo exercise — same pill shape the other modes use. */
export function MemoBadge({ rule }: { rule: MemoRule }) {
  const meta = memoSetMeta(rule.setId);
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <span
        className={
          "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm bg-gradient-to-r " +
          meta.grad
        }
      >
        {meta.label}
      </span>
      <span className="text-[12px] font-semibold text-ink-soft">{rule.category}</span>
    </div>
  );
}

/**
 * The thing to be memorised, given the visual weight: the sentence for a prose rule, the formula
 * itself for a formula rule. A formula rule's `statement` is only a gloss, and repeating it here
 * would compete with the formula for attention, so it is left to the explanation below.
 */
export function RuleHeadline({ rule, compact = false }: { rule: MemoRule; compact?: boolean }) {
  if (rule.display === "formula" && rule.formulaTex) {
    return (
      <div className="rounded-xl border border-line-soft bg-card px-4 py-5 mb-3 text-center overflow-x-auto">
        <Formula tex={rule.formulaTex} display className={compact ? "text-[17px]" : "text-[19px]"} />
      </div>
    );
  }
  return (
    <>
      <div className="bg-gradient-to-br from-amber-light to-amber-light/40 rounded-xl p-4 mb-3 flex gap-3">
        <Quote size={16} className="text-amber shrink-0 mt-1" />
        <div className={(compact ? "text-[15.5px]" : "text-[16px]") + " text-ink font-semibold leading-relaxed"}>{rule.statement}</div>
      </div>
      {rule.formulaTex && (
        <div className="bg-bg rounded-xl p-4 mb-3 text-center overflow-x-auto">
          <Formula tex={rule.formulaTex} display className={compact ? "text-[16px]" : "text-[17px]"} />
        </div>
      )}
    </>
  );
}

/** The rule's key facts as a label/value list — the memorisable core. */
export function FactList({ facts, muted = false }: { facts: MemoRule["facts"]; muted?: boolean }) {
  if (facts.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {facts.map((f, i) => (
        <div key={i} className={"flex gap-3 rounded-lg px-3 py-2 " + (muted ? "bg-bg" : "bg-amber-light/40")}>
          <span className="text-[11px] uppercase tracking-wide font-bold text-ink-faint shrink-0 w-32 pt-0.5">{f.label}</span>
          <span className="text-[13.5px] text-ink leading-snug">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Collapsible reference of the other rules in the same set, available mid-question. */
export function RuleSheet({ rule }: { rule: MemoRule }) {
  const [open, setOpen] = useState(false);
  const siblings = memoRulesForSet(rule.setId);
  return (
    <div className="mt-3">
      <Button
        onClick={() => setOpen((o) => !o)}
        variant="ghost"
        aria-expanded={open}
        className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-blue-lighter hover:border-blue/30 hover:text-blue-dark transition-colors"
      >
        <BookOpen size={13} />
        Rule sheet
        <ChevronDown size={13} className={"transition-transform " + (open ? "rotate-180" : "")} />
      </Button>
      {open && (
        <div className="mt-2 rounded-xl border border-line-soft bg-bg p-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
          {siblings.map((r) => (
            <div key={r.id} className={"rounded-lg px-3 py-2 " + (r.id === rule.id ? "bg-blue-light/60" : "bg-card")}>
              <div className="text-[11px] font-semibold text-ink-faint mb-0.5">{r.title}</div>
              {r.display === "formula" && r.formulaTex ? (
                <div className="overflow-x-auto">
                  <Formula tex={r.formulaTex} className="text-[14px]" />
                </div>
              ) : (
                <div className="text-[12.5px] text-ink-soft leading-snug">{r.statement}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
