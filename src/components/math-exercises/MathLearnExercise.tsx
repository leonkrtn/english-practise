"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, TriangleAlert } from "lucide-react";
import { MATH_DIFFICULTY_LABEL, MATH_RULES_BY_ID } from "@/lib/math";
import Formula from "@/components/Formula";
import FormulaAnatomy from "@/components/FormulaAnatomy";
import { PrimaryButton } from "@/components/exercises/shared";
import { Button } from "@/components/ui/button";
import { MathBadge } from "./shared";
import type { MathExerciseProps } from "./types";

export default function MathLearnExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];
  const [showDerivation, setShowDerivation] = useState(false);

  function acknowledge() {
    onAnswered({ ruleId: rule.id, format: "math-learn", result: "correct", hintsUsed: 0 });
    onNext();
  }

  return (
    <>
      <MathBadge rule={rule} />
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{rule.category}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-line-soft px-2 py-0.5 text-ink-soft">
          {MATH_DIFFICULTY_LABEL[rule.difficulty]}
        </span>
      </div>

      <div className="text-[20px] font-bold tracking-tight mb-3 leading-tight">{rule.title}</div>

      <div className="bg-gradient-to-br from-blue-lighter to-purple-light/40 rounded-xl p-5 mb-4">
        <FormulaAnatomy ruleId={rule.id} formulaTex={rule.formulaTex} />
      </div>

      <div className="text-[15px] text-ink-soft leading-relaxed mb-4">{rule.explanation}</div>

      {rule.derivation && rule.derivation.length > 0 && (
        <div className="mb-4">
          <Button
            onClick={() => setShowDerivation((v) => !v)}
            variant="ghost"
            aria-expanded={showDerivation}
            className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-blue-lighter hover:border-blue/30 hover:text-blue-dark transition-colors"
          >
            Where it comes from
            <ChevronDown size={13} className={"transition-transform " + (showDerivation ? "rotate-180" : "")} />
          </Button>
          {showDerivation && (
            <div className="mt-2 rounded-xl bg-bg p-4 flex flex-col gap-2 overflow-x-auto">
              {rule.derivation.map((line, i) => (
                <Formula key={i} tex={line} className="text-[14px]" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-2">Examples</div>
      <div className="flex flex-col gap-2.5 mb-4">
        {rule.examples.map((ex, i) => (
          <div key={i} className="bg-bg rounded-xl px-4 py-3 overflow-x-auto">
            <Formula tex={ex.problemTex} className="text-[15px]" />
            {ex.steps.map((s, j) => (
              <div key={j} className="flex items-baseline gap-2 mt-1.5">
                <span className="text-ink-faint text-[13px] shrink-0">=</span>
                <Formula tex={s} className="text-[14px]" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {rule.pitfalls.length > 0 && (
        <div className="rounded-xl bg-red-light/40 ring-1 ring-inset ring-red/15 p-4 mb-5">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-bold text-red mb-2">
            <TriangleAlert size={12} /> Common mistakes
          </div>
          <ul className="flex flex-col gap-1.5">
            {rule.pitfalls.map((p, i) => (
              <li key={i} className="text-[13.5px] text-ink-soft leading-snug flex gap-2">
                <span className="text-red shrink-0">·</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <PrimaryButton onClick={acknowledge} autoFocus>
        Got it, continue
        <ArrowRight size={16} />
      </PrimaryButton>
    </>
  );
}
