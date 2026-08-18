"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import { PrimaryButton } from "@/components/exercises/shared";
import { FactList, MemoBadge, RuleHeadline } from "./shared";
import type { MemoExerciseProps } from "./types";

export default function MemoLearnExercise({ rule, onAnswered, onNext }: MemoExerciseProps) {

  function acknowledge() {
    onAnswered({ ruleId: rule.id, format: "memo-learn", result: "correct", hintsUsed: 0 });
    onNext();
  }

  return (
    <>
      <MemoBadge rule={rule} />
      <div className="text-[20px] font-bold tracking-tight mb-3 leading-tight">{rule.title}</div>

      {/* Whatever has to come back from memory gets the weight — the sentence, or the formula. */}
      <RuleHeadline rule={rule} />

      <div className="text-[15px] text-ink-soft leading-relaxed mb-4 mt-4">{rule.explanation}</div>

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
