"use client";

import { useMemo, useState } from "react";
import { choice, classifyAnswer } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { AnswerInput, ExerciseFooter, FeedbackPanel, HintButton, KeyBadge, PrimaryButton, useHintShortcut } from "@/components/exercises/shared";
import { CategoryBadge, Prompt, type GrammarExerciseProps } from "./shared";

export default function GrammarGapExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const variant = useMemo(() => choice(rule.gap), [rule]);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const [showHint, setShowHint] = useState(false);
  useHintShortcut(() => setShowHint(true), !!result);

  const [before, after] = variant.template.split("___");

  function check(skipped: boolean) {
    if (result) return;
    const raw = skipped ? "" : value;
    const cls = classifyAnswer(raw, [variant.answer]);
    const res: AnswerResultKind = skipped ? "incorrect" : cls.result;
    setResult(res);
    onAnswered([{ ruleId: rule.id, format: "g-gap", result: res, errorType: skipped ? "skipped" : cls.errorType, hintsUsed: showHint ? 1 : 0 }]);
  }

  return (
    <>
      <CategoryBadge category={rule.category} />
      <Prompt>Fill in the missing word</Prompt>
      <div className="text-[16px] leading-relaxed mb-3">
        {before}
        <span className="inline-block min-w-[70px] border-b-2 border-blue text-blue font-semibold text-center">{result ? variant.answer : "?"}</span>
        {after}
      </div>
      <AnswerInput value={value} onChange={setValue} status={result} disabled={!!result} placeholder="Type the missing word…" onEnter={() => check(false)} />
      {showHint && <div className="text-[13px] text-blue-dark bg-blue-light rounded-lg px-3 py-2 mt-2">{variant.hint}</div>}
      {!result && (
        <ExerciseFooter>
          <div className="flex gap-2">
            <HintButton onClick={() => setShowHint(true)}>
              Hint <KeyBadge>1</KeyBadge>
            </HintButton>
            <HintButton onClick={() => check(true)}>Skip</HintButton>
          </div>
          <PrimaryButton onClick={() => check(false)}>Check</PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          {rule.explanation}
        </FeedbackPanel>
      )}
    </>
  );
}
