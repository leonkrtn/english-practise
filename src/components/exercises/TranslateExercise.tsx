"use client";

import { useState } from "react";
import { classifyAnswer } from "@/lib/answerCheck";
import type { AnswerResultKind } from "@/lib/types";
import { Prompt, Badge, ContextNote, FeedbackPanel, AnswerInput, ExerciseFooter, HintButton, HintIcon, KeyBadge, PrimaryButton, useHints, useHintShortcut, DetailRow } from "./shared";
import type { ExerciseProps } from "./types";

export default function TranslateExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const word = item.words[0];
  // Jargon anchored to an English definition is always asked term-first, whichever direction the
  // queue picked: asking someone to type the German for "EBITDA" tests nothing.
  const byDefinition = !!word.definition;
  const toGerman = !byDefinition && item.direction === "en-de";
  const promptStr = byDefinition ? word.definition! : toGerman ? word.en : word.de.join(" / ");
  const accepted = toGerman ? word.de : [word.en];

  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const { reveal, showHint, hintsUsed } = useHints(word, toGerman);
  useHintShortcut(showHint, !!result);

  function check(skipped: boolean) {
    if (result) return;
    const raw = skipped ? "" : value;
    const cls = classifyAnswer(raw, accepted);
    const res: AnswerResultKind = skipped ? "incorrect" : cls.result;
    const errorType = skipped ? "skipped" : cls.errorType;
    setResult(res);
    onAnswered([{ wordId: word.id, format: "translate", result: res, errorType, hintsUsed }]);
  }

  return (
    <>
      <Badge word={word} />
      {/* A definition is a full sentence, so it can't carry the 24px display size a single word
          gets without dominating the card. */}
      <div className={byDefinition ? "text-[17px] font-semibold leading-snug mb-1" : "text-[24px] font-bold tracking-tight mb-1 leading-tight"}>
        {promptStr}
      </div>
      <Prompt>{byDefinition ? "Which term matches this definition?" : `Translate to ${toGerman ? "German" : "English"}`}</Prompt>
      <AnswerInput
        value={value}
        onChange={setValue}
        status={result}
        disabled={!!result}
        placeholder="Type your answer…"
        onEnter={() => check(false)}
      />
      {reveal && <div className="text-[13px] text-blue-dark bg-blue-light rounded-lg px-3 py-2 mt-2">{reveal}</div>}
      {!result && (
        <ExerciseFooter>
          <div className="flex gap-2">
            <HintButton onClick={showHint}>
              <HintIcon /> Hint <KeyBadge>1</KeyBadge>
            </HintButton>
            <HintButton onClick={() => check(true)}>Skip</HintButton>
          </div>
          <PrimaryButton onClick={() => check(false)}>
            Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
          </PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          {result !== "correct" && (
            <DetailRow label="Correct answer">
              <b className="font-semibold text-ink">{accepted.join(" / ")}</b>
            </DetailRow>
          )}
          <ContextNote word={word} />
        </FeedbackPanel>
      )}
    </>
  );
}
