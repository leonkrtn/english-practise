"use client";

import { ArrowRight, Lightbulb, Quote } from "lucide-react";
import { MEMO_RULES_BY_ID } from "@/lib/memo";
import Formula from "@/components/Formula";
import { PrimaryButton } from "@/components/exercises/shared";
import { FactList, MemoBadge } from "./shared";
import type { MemoExerciseProps } from "./types";

export default function MemoLearnExercise({ item, onAnswered, onNext }: MemoExerciseProps) {
  const rule = MEMO_RULES_BY_ID[item.ruleId];

  function acknowledge() {
    onAnswered({ ruleId: rule.id, format: "memo-learn", result: "correct", hintsUsed: 0 });
    onNext();
  }

  return (
    <>
      <MemoBadge rule={rule} />
      <div className="text-[20px] font-bold tracking-tight mb-3 leading-tight">{rule.title}</div>

      {/* The statement is the thing to memorise, so it gets the visual weight the formula gets in
          the Mathematics mode. */}
      <div className="bg-gradient-to-br from-amber-light to-amber-light/40 rounded-xl p-4 mb-4 flex gap-3">
        <Quote size={16} className="text-amber shrink-0 mt-1" />
        <div className="text-[16px] text-ink font-semibold leading-relaxed">{rule.statement}</div>
      </div>

      {rule.formulaTex && (
        <div className="bg-bg rounded-xl p-4 mb-4 text-center overflow-x-auto">
          <Formula tex={rule.formulaTex} display className="text-[17px]" />
        </div>
      )}

      <div className="text-[15px] text-ink-soft leading-relaxed mb-4">{rule.explanation}</div>

      {rule.facts.length > 0 && (
        <>
          <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-2">Key facts</div>
          <div className="mb-4">
            <FactList facts={rule.facts} />
          </div>
        </>
      )}

      {rule.example && (
        <>
          <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-2">Example</div>
          <div className="bg-bg rounded-xl px-4 py-3 text-[14px] text-ink-soft leading-relaxed mb-4">{rule.example}</div>
        </>
      )}

      {rule.mnemonic && (
        <div className="rounded-xl bg-purple-light/50 ring-1 ring-inset ring-purple/15 p-4 mb-5 flex gap-2.5">
          <Lightbulb size={14} className="text-purple shrink-0 mt-0.5" />
          <div className="text-[13.5px] text-ink-soft leading-relaxed">{rule.mnemonic}</div>
        </div>
      )}

      <PrimaryButton onClick={acknowledge} autoFocus>
        Got it, continue
        <ArrowRight size={16} />
      </PrimaryButton>
    </>
  );
}
