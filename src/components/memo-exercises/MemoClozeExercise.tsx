"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { classifyAnswer } from "@/lib/answerCheck";
import type { AnswerResultKind } from "@/lib/types";
import { AnswerInput, ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import { Button } from "@/components/ui/button";
import { MemoBadge, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

/** Cued recall: the rule statement with one word or number removed. */
export default function MemoClozeExercise({ item, rule, onAnswered, onNext }: MemoExerciseProps) {
  const problem = rule.cloze[item.problemIndex] ?? rule.cloze[0];

  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const [hintShown, setHintShown] = useState(false);

  const [before, after] = problem.text.split("___");

  function check() {
    if (result) return;
    // Reuses the vocabulary answer checker, so a near-miss spelling counts as "almost" rather than
    // wrong — the point is whether the rule is remembered, not whether it was typed perfectly.
    const cls = classifyAnswer(value, [problem.answer, ...(problem.accepted ?? [])]);
    setResult(cls.result);
    onAnswered({ ruleId: rule.id, format: "memo-cloze", result: cls.result, hintsUsed: hintShown ? 1 : 0 });
  }

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>Fill in the blank</Prompt>

      <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-[16px] text-ink leading-relaxed">
        {before}
        <span className="inline-block min-w-[80px] border-b-2 border-blue mx-1 align-baseline" />
        {after}
      </div>

      <AnswerInput value={value} onChange={setValue} status={result} disabled={!!result} placeholder="Your answer…" onEnter={check} />

      {!result && (
        <>
          {problem.hint && (
            <div className="mt-3">
              {hintShown ? (
                <div className="flex gap-2 rounded-xl bg-amber-light/60 px-3 py-2 text-[13px] text-ink-soft leading-snug">
                  <Lightbulb size={13} className="text-amber shrink-0 mt-0.5" />
                  <span>{problem.hint}</span>
                </div>
              ) : (
                <Button
                  onClick={() => setHintShown(true)}
                  variant="ghost"
                  className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-amber-light hover:border-amber/40 hover:text-amber-dark transition-colors"
                >
                  <Lightbulb size={13} /> Hint
                </Button>
              )}
            </div>
          )}
          <RuleSheet rule={rule} />
          <ExerciseFooter>
            <div />
            <PrimaryButton onClick={check} disabled={!value.trim()}>
              Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
            </PrimaryButton>
          </ExerciseFooter>
        </>
      )}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-2">
            Answer: <b className="text-ink font-semibold">{problem.answer}</b>
          </div>
          <div className="text-[13.5px] leading-relaxed">{rule.statement}</div>
        </FeedbackPanel>
      )}
    </>
  );
}
