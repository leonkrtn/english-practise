"use client";

import { useState } from "react";
import { normalize } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import {
  Badge,
  ContextNote,
  FeedbackPanel,
  AnswerInput,
  ExerciseFooter,
  HintButton,
  HintIcon,
  KeyBadge,
  PrimaryButton,
  useHints,
  useHintShortcut,
  DetailRow,
  Prompt,
  boldenWord,
} from "./shared";
import type { ExerciseProps } from "./types";

export default function SentenceExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const word = item.words[0];
  const toGerman = item.direction === "en-de";
  const sourceSentence = toGerman ? word.enSentence : word.deSentence;
  const modelAnswer = toGerman ? word.deSentence : word.enSentence;
  const targetForms = toGerman ? word.de : [word.en];

  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const { reveal, showHint, hintsUsed } = useHints(word, toGerman);
  useHintShortcut(showHint, !!result);

  function check(skipped: boolean) {
    if (result) return;
    const raw = skipped ? "" : value;
    const normUser = normalize(raw);
    const containsTarget = targetForms.some((f) => normUser.includes(normalize(f)));
    const modelLen = normalize(modelAnswer).split(" ").length;
    const userLen = normUser ? normUser.split(" ").length : 0;
    const lenOk = userLen >= modelLen * 0.45 && userLen <= modelLen * 2.2;
    let res: AnswerResultKind;
    if (skipped) res = "incorrect";
    else if (containsTarget && lenOk) res = "correct";
    else if (containsTarget && !lenOk) res = "almost";
    else res = "incorrect";
    setResult(res);
    onAnswered([
      {
        wordId: word.id,
        format: "sentence",
        result: res,
        errorType: skipped ? "skipped" : res === "correct" ? null : "unnatural",
        hintsUsed,
      },
    ]);
  }

  return (
    <>
      <Badge word={word} />
      <Prompt>
        Translate this sentence to {toGerman ? "German" : "English"} — use the word{" "}
        <b className="text-ink font-semibold">{toGerman ? word.en : word.de[0]}</b>
      </Prompt>
      <div className="text-[16px] leading-relaxed mb-3">{sourceSentence}</div>
      <AnswerInput
        value={value}
        onChange={setValue}
        status={result}
        disabled={!!result}
        placeholder="Type your translation…"
        onEnter={() => check(false)}
        textarea
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
          <PrimaryButton onClick={() => check(false)}>Check</PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <DetailRow label="Model answer">{boldenWord(modelAnswer, word)}</DetailRow>
          <ContextNote word={word} />
        </FeedbackPanel>
      )}
    </>
  );
}
