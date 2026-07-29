"use client";

import { useMemo, useState } from "react";
import { BookMarked } from "lucide-react";
import { buildConnectorQuiz } from "@/lib/connectorQuiz";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel, useNumberShortcuts } from "@/components/exercises/shared";
import SessionScreen from "./SessionScreen";
import { Badge } from "@/components/ui/badge";

const NOOP = () => {};

export interface ConnectorLearnResult {
  correctCount: number;
  totalCount: number;
}

export default function ConnectorLearnScreen({ onExit, onFinish }: { onExit: () => void; onFinish: (result: ConnectorLearnResult) => void }) {
  const quiz = useMemo(() => buildConnectorQuiz(), []);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const item = quiz[index];

  function select(optionIndex: number) {
    if (chosen !== null) return;
    const value = item.options[optionIndex];
    setChosen(value);
    if (value === item.answer) setCorrectCount((c) => c + 1);
  }

  useNumberShortcuts(item.options.length, select, chosen !== null);

  const result: AnswerResultKind | null = chosen === null ? null : chosen === item.answer ? "correct" : "incorrect";

  function next() {
    if (index + 1 >= quiz.length) {
      onFinish({ correctCount: correctCount, totalCount: quiz.length });
    } else {
      setIndex(index + 1);
      setChosen(null);
    }
  }

  return (
    <SessionScreen
      renderKey={index}
      progressPct={Math.round((index / quiz.length) * 100)}
      progressLabel={`${index + 1} / ${quiz.length}`}
      favorite={false}
      showFavorite={false}
      onExit={onExit}
      onToggleFav={NOOP}
    >
      <Badge className="h-auto self-start px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 text-white shadow-sm bg-gradient-to-r from-green to-green-dark">
        <BookMarked size={11} /> Bindewörter
      </Badge>
      <div className="text-[14.5px] text-ink-faint mb-1">Welches Wort drückt diese Beziehung aus?</div>
      <div className="text-[22px] font-bold tracking-tight mb-5 leading-tight">{item.category.labelDe}</div>
      <div className="flex flex-col gap-2 mt-1">
        {item.options.map((o, i) => {
          let cls = "border-line bg-card hover:border-green/40 hover:bg-green-light hover:-translate-y-0.5 hover:shadow-md";
          let keyCls = "border-line text-ink-faint bg-bg";
          if (chosen !== null) {
            if (o === item.answer) {
              cls = "border-green bg-green-light shadow-[0_4px_14px_-4px_rgba(30,182,118,0.35)]";
              keyCls = "bg-gradient-to-br from-green to-green-dark border-green text-white shadow-sm";
            } else if (o === chosen) {
              cls = "border-red bg-red-light shadow-[0_4px_14px_-4px_rgba(232,72,58,0.3)]";
              keyCls = "bg-gradient-to-br from-red to-red-dark border-red text-white shadow-sm";
            } else {
              cls = "border-line bg-card opacity-40";
            }
          }
          return (
            <button
              key={o}
              onClick={() => select(i)}
              disabled={chosen !== null}
              className={"text-left border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium text-ink flex items-center gap-3 transition-all " + cls}
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
        <FeedbackPanel result={result} onContinue={next}>
          <b className="font-semibold text-ink">{item.answer}</b> gehört zu &quot;{item.category.labelDe}&quot; — auch möglich:{" "}
          {item.category.connectors.filter((c) => c !== item.answer).slice(0, 5).join(", ")}…
        </FeedbackPanel>
      )}
    </SessionScreen>
  );
}
