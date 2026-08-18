"use client";

import { useMemo, useState } from "react";
import { Check, Undo2, X } from "lucide-react";
import { MEMO_RULES_BY_ID } from "@/lib/memo";
import { shuffle } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import { Button } from "@/components/ui/button";
import { MemoBadge, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

/** Put the steps of a procedure back into order — tap to place, in sequence. */
export default function MemoOrderExercise({ item, onAnswered, onNext }: MemoExerciseProps) {
  const rule = MEMO_RULES_BY_ID[item.ruleId];
  const problem = rule.order[item.problemIndex] ?? rule.order[0];

  // Shuffled once per mount. Keyed on the rule + index so a re-shown item gets a fresh order.
  const tiles = useMemo(
    () => shuffle(problem.steps.map((text, i) => ({ text, correctIndex: i }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rule.id, item.problemIndex]
  );

  const [placed, setPlaced] = useState<number[]>([]);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  const remaining = tiles.map((_, i) => i).filter((i) => !placed.includes(i));
  const complete = placed.length === tiles.length;

  function check() {
    if (result || !complete) return;
    const ok = placed.every((tileIdx, position) => tiles[tileIdx].correctIndex === position);
    const res: AnswerResultKind = ok ? "correct" : "incorrect";
    setResult(res);
    onAnswered({ ruleId: rule.id, format: "memo-order", result: res, hintsUsed: 0 });
  }

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>{problem.prompt}</Prompt>

      <div className="flex flex-col gap-1.5 mb-3">
        {placed.map((tileIdx, position) => {
          const correct = tiles[tileIdx].correctIndex === position;
          const cls = !result
            ? "border-blue/40 bg-blue-lighter"
            : correct
            ? "border-green/40 bg-green-light"
            : "border-red/40 bg-red-light";
          return (
            <div key={position} className={"flex items-start gap-2.5 rounded-xl border-[1.5px] px-3 py-2.5 " + cls}>
              <span className="w-5 h-5 rounded-full bg-white/70 text-ink-soft text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {position + 1}
              </span>
              <span className="text-[13.5px] text-ink leading-snug flex-1">{tiles[tileIdx].text}</span>
              {result && (
                <span className={"shrink-0 mt-0.5 " + (correct ? "text-green" : "text-red")}>
                  {correct ? <Check size={13} /> : <X size={13} />}
                </span>
              )}
            </div>
          );
        })}
        {!result &&
          Array.from({ length: tiles.length - placed.length }).map((_, i) => (
            <div key={"slot" + i} className="rounded-xl border-[1.5px] border-dashed border-line px-3 py-2.5 text-[12.5px] text-ink-faint">
              Step {placed.length + i + 1}
            </div>
          ))}
      </div>

      {!result && (
        <>
          <div className="flex flex-col gap-1.5">
            {remaining.map((tileIdx) => (
              <button
                key={tileIdx}
                onClick={() => setPlaced((p) => [...p, tileIdx])}
                className="text-left rounded-xl border-[1.5px] border-line bg-card px-3 py-2.5 text-[13.5px] text-ink leading-snug transition-colors hover:border-blue hover:bg-blue-lighter"
              >
                {tiles[tileIdx].text}
              </button>
            ))}
          </div>

          <RuleSheet rule={rule} />

          <ExerciseFooter>
            <Button
              onClick={() => setPlaced((p) => p.slice(0, -1))}
              disabled={placed.length === 0}
              variant="ghost"
              className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-line-soft disabled:opacity-40"
            >
              <Undo2 size={13} /> Undo
            </Button>
            <PrimaryButton onClick={check} disabled={!complete}>
              Check
            </PrimaryButton>
          </ExerciseFooter>
        </>
      )}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="text-[12px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Correct order</div>
          <ol className="flex flex-col gap-1">
            {problem.steps.map((s, i) => (
              <li key={i} className="text-[13.5px] leading-snug flex gap-2">
                <span className="text-ink-faint font-bold shrink-0">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </FeedbackPanel>
      )}
    </>
  );
}
