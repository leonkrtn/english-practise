"use client";

import { useMemo, useState } from "react";
import { choice, levenshtein, normalize } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { AnswerInput, ExerciseFooter, FeedbackPanel, HintButton, PrimaryButton } from "@/components/exercises/shared";
import { CategoryBadge, Prompt, type GrammarExerciseProps } from "./shared";

/** Real production, not just recognition: type the full English translation of a German sentence
 * that demonstrates this rule. Graded the same way as Sentence Building — normalized Levenshtein
 * distance, tolerant of small typos but not of a genuinely different sentence. */
export default function GrammarTranslateExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const variant = useMemo(() => choice(rule.translate), [rule]);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  function check(skipped: boolean) {
    if (result) return;
    const built = normalize(skipped ? "" : value);
    const target = normalize(variant.en);
    let res: AnswerResultKind;
    if (skipped || !built) res = "incorrect";
    else if (built === target) res = "correct";
    else if (levenshtein(built, target) <= Math.max(2, Math.round(target.length * 0.15))) res = "almost";
    else res = "incorrect";
    setResult(res);
    onAnswered([{ ruleId: rule.id, format: "g-translate", result: res, errorType: skipped ? "skipped" : res === "correct" ? null : "wrong", hintsUsed: 0 }]);
  }

  return (
    <>
      <CategoryBadge category={rule.category} />
      <Prompt>Translate into English</Prompt>
      <div className="text-[18px] font-semibold tracking-tight mb-3">{variant.de}</div>
      <AnswerInput value={value} onChange={setValue} status={result} disabled={!!result} placeholder="Type the English translation…" onEnter={() => check(false)} textarea />
      {!result && (
        <ExerciseFooter>
          <HintButton onClick={() => check(true)}>Skip</HintButton>
          <PrimaryButton onClick={() => check(false)}>Check</PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-3">
            <b className="font-semibold text-ink">{variant.en}</b>
          </div>
          {rule.explanation}
        </FeedbackPanel>
      )}
    </>
  );
}
