"use client";

import { useMemo, useRef, useState } from "react";
import { shuffle } from "@/lib/utils";
import { Prompt, FeedbackPanel } from "./shared";
import type { ExerciseProps } from "./types";
import type { ResultEntry } from "@/lib/types";
import { playCorrect, playIncorrect } from "@/lib/sound";
import { Badge } from "@/components/ui/badge";

export default function MatchExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const words = item.words;
  const left = useMemo(() => shuffle(words.map((w) => ({ id: w.id, text: w.en }))), [words]);
  const right = useMemo(() => shuffle(words.map((w) => ({ id: w.id, text: w.de[0] }))), [words]);

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [shaking, setShaking] = useState<Set<string>>(new Set());
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const wrongRef = useRef<Set<string>>(new Set());

  function finish() {
    setDone(true);
    const entries: ResultEntry[] = words.map((w) => {
      const isWrong = wrongRef.current.has(w.id);
      return { wordId: w.id, format: "match", result: isWrong ? "almost" : "correct", errorType: isWrong ? "confused" : null, hintsUsed: 0 };
    });
    onAnswered(entries);
  }

  function clickSide(side: "left" | "right", id: string) {
    if (matched.has(id) || done) return;
    if (side === "left") setSelLeft(id);
    else setSelRight(id);

    const otherSel = side === "left" ? selRight : selLeft;
    if (otherSel === null) return;

    if (otherSel === id) {
      playCorrect();
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelLeft(null);
      setSelRight(null);
      if (next.size === words.length) finish();
    } else {
      playIncorrect();
      wrongRef.current.add(id);
      wrongRef.current.add(otherSel);
      setWrongIds(new Set(wrongRef.current));
      setShaking(new Set([id, otherSel]));
      setTimeout(() => {
        setShaking(new Set());
        setSelLeft(null);
        setSelRight(null);
      }, 450);
    }
  }

  function itemClasses(id: string, selected: boolean) {
    if (matched.has(id)) return "border-green bg-green-light text-[#0d7a4f] opacity-70 cursor-default";
    if (shaking.has(id)) return "border-red bg-red-light animate-shake";
    if (selected) return "border-blue bg-gradient-to-br from-blue to-blue-dark text-white shadow-[0_4px_14px_-4px_rgba(0,113,227,0.45)]";
    return "border-line bg-card hover:border-blue/40 hover:bg-blue-lighter hover:-translate-y-0.5 hover:shadow-sm";
  }

  return (
    <>
      <Prompt>Match each English word with its German translation</Prompt>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {left.map((x) => (
            <button
              key={x.id}
              onClick={() => clickSide("left", x.id)}
              className={"border-[1.5px] rounded-xl px-4 py-3 text-[15px] font-medium text-center transition-all " + itemClasses(x.id, selLeft === x.id)}
            >
              {x.text}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((x) => (
            <button
              key={x.id}
              onClick={() => clickSide("right", x.id)}
              className={"border-[1.5px] rounded-xl px-4 py-3 text-[15px] font-medium text-center transition-all " + itemClasses(x.id, selRight === x.id)}
            >
              {x.text}
            </button>
          ))}
        </div>
      </div>
      {done && (
        <FeedbackPanel result={wrongIds.size === 0 ? "correct" : "almost"} onContinue={onNext}>
          {words.map((w) => (
            <div className="mb-2 last:mb-0" key={w.id}>
              <b className="font-semibold text-ink">{w.en}</b> → <b className="font-semibold text-ink">{w.de.join(" / ")}</b>
              {wrongIds.has(w.id) && (
                <Badge className="h-auto inline-block text-[11px] font-semibold px-2 py-1 rounded-full bg-red-light text-[#b8271b] ml-2">retry</Badge>
              )}
            </div>
          ))}
        </FeedbackPanel>
      )}
    </>
  );
}
