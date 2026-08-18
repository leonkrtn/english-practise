"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel, Prompt } from "@/components/exercises/shared";
import { MemoBadge, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

/** True/false — the fastest way to drill the specific misconceptions a rule attracts. */
export default function MemoTrueFalseExercise({ item, rule, onAnswered, onNext }: MemoExerciseProps) {
  const problem = rule.trueFalse[item.problemIndex] ?? rule.trueFalse[0];

  const [chosen, setChosen] = useState<boolean | null>(null);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  const answer = useCallback(
    (value: boolean) => {
      if (result) return;
      setChosen(value);
      const res: AnswerResultKind = value === problem.isTrue ? "correct" : "incorrect";
      setResult(res);
      onAnswered({ ruleId: rule.id, format: "memo-truefalse", result: res, hintsUsed: 0 });
    },
    [result, problem.isTrue, onAnswered, rule.id]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || result) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "1") { e.preventDefault(); answer(true); }
      if (e.key === "2") { e.preventDefault(); answer(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, result]);

  const options: { value: boolean; label: string; icon: React.ReactNode }[] = [
    { value: true, label: "True", icon: <Check size={16} /> },
    { value: false, label: "False", icon: <X size={16} /> },
  ];

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>True or false?</Prompt>

      <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-[16px] text-ink leading-relaxed">{problem.statement}</div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((o, i) => {
          const isCorrect = o.value === problem.isTrue;
          const isChosen = o.value === chosen;
          const stateClass = !result
            ? "border-line bg-card hover:border-blue hover:bg-blue-lighter text-ink"
            : isCorrect
            ? "border-green bg-green-light text-[#0d7a4f]"
            : isChosen
            ? "border-red bg-red-light text-[#b8271b]"
            : "border-line-soft bg-card opacity-60 text-ink";
          return (
            <button
              key={o.label}
              onClick={() => answer(o.value)}
              disabled={!!result}
              className={"flex flex-col items-center gap-1 rounded-xl border-[1.5px] px-4 py-5 transition-colors " + stateClass}
            >
              {o.icon}
              <span className="text-[15px] font-bold">{o.label}</span>
              <span className="text-[10px] font-mono opacity-60">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {!result && <RuleSheet rule={rule} />}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="text-[12px] uppercase tracking-wide font-bold text-ink-faint mb-1">
            The statement is {problem.isTrue ? "true" : "false"}
          </div>
          <div className="text-[13.5px] leading-relaxed">{problem.explanation}</div>
        </FeedbackPanel>
      )}
    </>
  );
}
