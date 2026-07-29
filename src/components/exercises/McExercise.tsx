"use client";

import { useMemo, useState } from "react";
import { VOCAB } from "@/lib/vocab";
import { choice, findGap, sample, shuffle } from "@/lib/utils";
import { Prompt, Badge, ContextNote, FeedbackPanel, useNumberShortcuts } from "./shared";
import type { ExerciseProps } from "./types";

export default function McExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const word = item.words[0];
  const toGerman = item.direction === "en-de";

  const built = useMemo(() => {
    // Distractors are drawn from the same word class *and* the same track, so a statistics
    // question never offers accounting terms as its alternatives (and vice versa).
    const samePool = VOCAB.filter((w) => w.type === word.type && w.category === word.category && w.id !== word.id);

    // Jargon anchored to an English definition asks for the term itself rather than a German
    // translation — same reasoning as TranslateExercise.
    if (word.definition) {
      const distractors = sample(samePool, 3).map((w) => w.en);
      const options = shuffle([word.en].concat(distractors));
      return { variant: "definition", options, correctIdx: options.indexOf(word.en), gapInfo: null };
    }

    const variants = toGerman ? ["word2trans", "gapsentence"] : ["de2word"];
    let variant = choice(variants);
    let options: string[];
    let correctIdx: number;
    let gapInfo: { before: string; after: string } | null = null;

    if (variant === "gapsentence") {
      const gap = findGap(word.enSentence, word);
      if (!gap) variant = "de2word";
      else {
        gapInfo = { before: word.enSentence.slice(0, gap.index), after: word.enSentence.slice(gap.index + gap.matched.length) };
        const distractors = sample(samePool, 3).map((w) => w.en);
        options = shuffle([word.en].concat(distractors));
        correctIdx = options.indexOf(word.en);
        return { variant, options, correctIdx, gapInfo };
      }
    }
    if (variant === "word2trans") {
      const distractors = sample(samePool, 3).map((w) => w.de[0]);
      options = shuffle([word.de[0]].concat(distractors));
      correctIdx = options.indexOf(word.de[0]);
    } else {
      const distractors = sample(samePool, 3).map((w) => w.en);
      options = shuffle([word.en].concat(distractors));
      correctIdx = options.indexOf(word.en);
    }
    return { variant, options, correctIdx, gapInfo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id]);

  const [chosen, setChosen] = useState<number | null>(null);

  function select(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = i === built.correctIdx;
    onAnswered([{ wordId: word.id, format: "mc", result: isCorrect ? "correct" : "incorrect", errorType: isCorrect ? null : "wrong", hintsUsed: 0 }]);
  }

  useNumberShortcuts(built.options.length, select, chosen !== null);

  let promptNode: React.ReactNode;
  if (built.variant === "definition") {
    promptNode = (
      <>
        <Badge word={word} />
        <div className="text-[17px] font-semibold leading-snug mb-1">{word.definition}</div>
        <Prompt>Which term matches this definition?</Prompt>
      </>
    );
  } else if (built.variant === "word2trans") {
    promptNode = (
      <>
        <Badge word={word} />
        <div className="text-[24px] font-bold tracking-tight mb-1 leading-tight">{word.en}</div>
        <Prompt>Choose the correct German translation</Prompt>
      </>
    );
  } else if (built.variant === "de2word") {
    promptNode = (
      <>
        <Badge word={word} />
        <div className="text-[24px] font-bold tracking-tight mb-1 leading-tight">{word.de[0]}</div>
        <Prompt>Choose the correct English word</Prompt>
      </>
    );
  } else {
    promptNode = (
      <>
        <Badge word={word} />
        <Prompt>Choose the word that fits the sentence</Prompt>
        <div className="text-[16px] leading-relaxed">
          {built.gapInfo!.before}
          <span className="inline-block min-w-[90px] px-1 border-b-2 border-blue text-blue font-semibold text-center">____</span>
          {built.gapInfo!.after}
        </div>
      </>
    );
  }

  const result = chosen === null ? null : chosen === built.correctIdx ? "correct" : "incorrect";

  return (
    <>
      {promptNode}
      {/* The gap above the options is owned here alone, so every question shape (plain word,
          gapped sentence, …) drops its list at the same distance from the prompt. */}
      <div className="flex flex-col gap-2 mt-4">
        {built.options.map((o, i) => {
          let cls = "border-line bg-card hover:border-blue/40 hover:bg-blue-lighter hover:-translate-y-0.5 hover:shadow-md";
          let keyCls = "border-line text-ink-faint bg-bg";
          if (chosen !== null) {
            if (i === built.correctIdx) {
              cls = "border-green bg-green-light shadow-[0_4px_14px_-4px_rgba(30,182,118,0.35)]";
              keyCls = "bg-gradient-to-br from-green to-green-dark border-green text-white shadow-sm";
            } else if (i === chosen) {
              cls = "border-red bg-red-light shadow-[0_4px_14px_-4px_rgba(232,72,58,0.3)]";
              keyCls = "bg-gradient-to-br from-red to-red-dark border-red text-white shadow-sm";
            } else {
              cls = "border-line bg-card opacity-40";
            }
          }
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={chosen !== null}
              className={"text-left border-[1.5px] rounded-xl px-4 py-3 text-[15px] font-medium text-ink flex items-center gap-3 transition-all " + cls}
            >
              <span className={"w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors " + keyCls}>
                {i + 1}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <ContextNote word={word} />
        </FeedbackPanel>
      )}
    </>
  );
}
