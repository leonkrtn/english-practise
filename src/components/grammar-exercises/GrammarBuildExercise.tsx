"use client";

import { useMemo, useState } from "react";
import { choice, levenshtein, normalize, shuffle } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { ExerciseFooter, FeedbackPanel, HintButton, PrimaryButton, useTileShortcuts } from "@/components/exercises/shared";
import { CategoryBadge, Prompt, type GrammarExerciseProps } from "./shared";

interface Token {
  t: string;
  key: string;
}

export default function GrammarBuildExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const variant = useMemo(() => choice(rule.build), [rule]);
  const sentence = variant.sentence;
  const shuffled = useMemo<Token[]>(() => {
    const tokens = sentence.split(/\s+/);
    return shuffle(tokens.map((t, i) => ({ t, key: String(i) })));
  }, [sentence]);

  const [placed, setPlaced] = useState<Token[]>([]);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  function place(tok: Token) {
    if (result) return;
    setPlaced((p) => [...p, tok]);
  }
  function unplace(key: string) {
    if (result) return;
    setPlaced((p) => p.filter((x) => x.key !== key));
  }

  function check(skipped: boolean) {
    if (result) return;
    const built = normalize(placed.map((p) => p.t).join(" "));
    const target = normalize(sentence);
    let res: AnswerResultKind;
    if (skipped) res = "incorrect";
    else if (built === target) res = "correct";
    else if (levenshtein(built, target) <= Math.max(2, Math.round(target.length * 0.1))) res = "almost";
    else res = "incorrect";
    setResult(res);
    onAnswered([{ ruleId: rule.id, format: "g-build", result: res, errorType: skipped ? "skipped" : res === "correct" ? null : "word order", hintsUsed: 0 }]);
  }

  const usedKeys = new Set(placed.map((p) => p.key));

  useTileShortcuts(
    shuffled,
    usedKeys,
    place,
    () => setPlaced((p) => p.slice(0, -1)),
    () => check(false),
    placed.length === shuffled.length,
    !!result
  );

  return (
    <>
      <CategoryBadge category={rule.category} />
      <Prompt>Put the words in the correct order — {rule.title}</Prompt>
      <div className="flex flex-wrap gap-2 min-h-[44px] mb-3 p-3 bg-bg rounded-xl border-[1.5px] border-dashed border-line">
        {placed.length === 0 && <span className="text-ink-faint text-[13px]">Tap words below to build the sentence…</span>}
        {placed.map((p) => (
          <button
            key={p.key}
            onClick={() => unplace(p.key)}
            className="border-[1.5px] border-purple bg-gradient-to-br from-purple to-purple-dark text-white rounded-lg px-3 py-2 text-[15px] font-semibold shadow-sm transition-transform hover:scale-[1.03]"
          >
            {p.t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {shuffled.map((x, idx) => (
          <button
            key={x.key}
            onClick={() => place(x)}
            disabled={usedKeys.has(x.key)}
            className={
              "inline-flex items-center gap-1.5 border-[1.5px] border-line bg-card rounded-lg px-3 py-2 text-[15px] font-semibold select-none transition-all hover:border-purple/40 hover:bg-purple-light hover:-translate-y-0.5 hover:shadow-sm " +
              (usedKeys.has(x.key) ? "opacity-30 pointer-events-none" : "")
            }
          >
            {idx < 9 && <span className="text-[10px] font-mono bg-line-soft border border-line rounded px-1 text-ink-faint">{idx + 1}</span>}
            {x.t}
          </button>
        ))}
      </div>
      {!result && (
        <ExerciseFooter>
          <div className="flex gap-2">
            <HintButton onClick={() => setPlaced([])}>Clear</HintButton>
            <HintButton onClick={() => check(true)}>Skip</HintButton>
          </div>
          <PrimaryButton onClick={() => check(false)}>Check</PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-3">
            <b className="font-semibold text-ink">{sentence}</b>
          </div>
          {rule.explanation}
        </FeedbackPanel>
      )}
    </>
  );
}
