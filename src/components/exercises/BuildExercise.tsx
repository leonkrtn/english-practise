"use client";

import { useMemo, useState } from "react";
import { levenshtein, normalize, shuffle } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { Badge, ContextNote, FeedbackPanel, ExerciseFooter, HintButton, PrimaryButton, DetailRow } from "./shared";
import type { ExerciseProps } from "./types";

interface Token {
  t: string;
  key: string;
}

export default function BuildExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const word = item.words[0];
  const sentence = word.enSentence;
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
    onAnswered([{ wordId: word.id, format: "build", result: res, errorType: skipped ? "skipped" : res === "correct" ? null : "word order", hintsUsed: 0 }]);
  }

  const usedKeys = new Set(placed.map((p) => p.key));

  return (
    <>
      <Badge word={word} />
      <div className="text-[14.5px] text-ink-faint mb-5">
        Reorder the words to build the sentence (word: <b className="text-ink font-semibold">{word.en}</b>)
      </div>
      <div className="flex flex-wrap gap-2 min-h-[44px] mb-4 p-3 bg-bg rounded-xl border-[1.5px] border-dashed border-line">
        {placed.length === 0 && <span className="text-ink-faint text-[13px]">Tap words below to build the sentence…</span>}
        {placed.map((p) => (
          <button
            key={p.key}
            onClick={() => unplace(p.key)}
            className="border-[1.5px] border-blue bg-blue-light rounded-lg px-3.5 py-2 text-[14.5px] font-semibold"
          >
            {p.t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {shuffled.map((x) => (
          <button
            key={x.key}
            onClick={() => place(x)}
            disabled={usedKeys.has(x.key)}
            className={
              "border-[1.5px] border-line bg-card rounded-lg px-3.5 py-2 text-[14.5px] font-semibold select-none transition-opacity hover:border-blue " +
              (usedKeys.has(x.key) ? "opacity-30 pointer-events-none" : "")
            }
          >
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
          <DetailRow label="Correct sentence">
            {sentence}
            <br />
            <span className="text-ink-faint">{word.deSentence}</span>
          </DetailRow>
          <ContextNote word={word} />
        </FeedbackPanel>
      )}
    </>
  );
}
