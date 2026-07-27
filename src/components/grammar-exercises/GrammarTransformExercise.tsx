"use client";

import { useMemo, useState } from "react";
import { choice, levenshtein, normalize } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { AnswerInput, ExerciseFooter, FeedbackPanel, HintButton, PrimaryButton } from "@/components/exercises/shared";
import { CategoryBadge, Prompt, type GrammarExerciseProps } from "./shared";

/** Sentence-rewrite production: given a source sentence and an instruction, type the rewritten
 * sentence that applies this rule — the most demanding of the review formats, since there's no
 * option list to recognize from at all. Graded like Translate/Sentence Building (normalized
 * Levenshtein distance). */
export default function GrammarTransformExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const variant = useMemo(() => choice(rule.transform), [rule]);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  function check(skipped: boolean) {
    if (result) return;
    const built = normalize(skipped ? "" : value);
    const target = normalize(variant.answer);
    let res: AnswerResultKind;
    if (skipped || !built) res = "incorrect";
    else if (built === target) res = "correct";
    else if (levenshtein(built, target) <= Math.max(2, Math.round(target.length * 0.15))) res = "almost";
    else res = "incorrect";
    setResult(res);
    onAnswered([{ ruleId: rule.id, format: "g-transform", result: res, errorType: skipped ? "skipped" : res === "correct" ? null : "wrong", hintsUsed: 0 }]);
  }

  return (
    <>
      <CategoryBadge category={rule.category} />
      <Prompt>{variant.prompt}</Prompt>
      <div className="text-[18px] font-semibold tracking-tight mb-3">{variant.source}</div>
      <AnswerInput value={value} onChange={setValue} status={result} disabled={!!result} placeholder="Type the rewritten sentence…" onEnter={() => check(false)} textarea />
      {!result && (
        <ExerciseFooter>
          <HintButton onClick={() => check(true)}>Skip</HintButton>
          <PrimaryButton onClick={() => check(false)}>Check</PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-3">
            <b className="font-semibold text-ink">{variant.answer}</b>
          </div>
          {rule.explanation}
        </FeedbackPanel>
      )}
    </>
  );
}
