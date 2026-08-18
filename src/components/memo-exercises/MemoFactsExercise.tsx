"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { classifyAnswer } from "@/lib/answerCheck";
import type { AnswerResultKind } from "@/lib/types";
import { ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import { MemoBadge, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

/**
 * Recall every key fact of one rule at once — the label is given, the value has to come back.
 *
 * Graded as a whole: all correct is "correct", none correct is "incorrect", anything in between is
 * the "almost" tier, which holds the rule at its current stage rather than promoting or demoting it.
 * That is the honest reading of a partial recall.
 */
export default function MemoFactsExercise({ rule, onAnswered, onNext }: MemoExerciseProps) {
  const [values, setValues] = useState<string[]>(() => rule.facts.map(() => ""));
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const [marks, setMarks] = useState<boolean[]>([]);

  const anyFilled = values.some((v) => v.trim());

  function check() {
    if (result) return;
    const got = rule.facts.map((f, i) => classifyAnswer(values[i], [f.value, ...(f.accepted ?? [])]).result !== "incorrect");
    const correctCount = got.filter(Boolean).length;
    const res: AnswerResultKind = correctCount === rule.facts.length ? "correct" : correctCount === 0 ? "incorrect" : "almost";
    setMarks(got);
    setResult(res);
    onAnswered({ ruleId: rule.id, format: "memo-facts", result: res, hintsUsed: 0 });
  }

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>Recall the key facts</Prompt>

      <div className="text-[19px] font-bold tracking-tight mb-4 leading-tight">{rule.title}</div>

      <div className="flex flex-col gap-2.5">
        {rule.facts.map((f, i) => (
          <div key={i}>
            <label className="text-[11px] uppercase tracking-wide font-bold text-ink-faint block mb-1">{f.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={values[i]}
                disabled={!!result}
                autoFocus={i === 0}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setValues((v) => v.map((old, j) => (j === i ? e.target.value : old)))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    check();
                  }
                }}
                placeholder="…"
                className={
                  "flex-1 text-[15px] px-3.5 py-2.5 rounded-xl border-[1.5px] outline-none transition-colors font-sans " +
                  (!result
                    ? "border-line bg-bg focus:bg-white focus:border-blue"
                    : marks[i]
                    ? "border-green bg-green-light"
                    : "border-red bg-red-light")
                }
              />
              {result && (
                <span className={"shrink-0 " + (marks[i] ? "text-green" : "text-red")}>
                  {marks[i] ? <Check size={15} /> : <X size={15} />}
                </span>
              )}
            </div>
            {result && !marks[i] && <div className="text-[12.5px] text-ink-soft mt-1 pl-1">{f.value}</div>}
          </div>
        ))}
      </div>

      {!result && (
        <>
          <RuleSheet rule={rule} />
          <ExerciseFooter>
            <div />
            <PrimaryButton onClick={check} disabled={!anyFilled}>
              Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
            </PrimaryButton>
          </ExerciseFooter>
        </>
      )}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="text-[12px] uppercase tracking-wide font-bold text-ink-faint mb-1">
            {marks.filter(Boolean).length} of {rule.facts.length} recalled
          </div>
          <div className="text-[13.5px] leading-relaxed">{rule.statement}</div>
        </FeedbackPanel>
      )}
    </>
  );
}
