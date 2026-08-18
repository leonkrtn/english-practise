"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import type { AnswerResultKind } from "@/lib/types";
import { Prompt } from "@/components/exercises/shared";
import { playFeedbackSound } from "@/lib/sound";
import { FactList, MemoBadge, RuleHeadline, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

/**
 * Free recall, self-graded — the classic rote-memorisation drill and the only format that tests
 * whether the rule is actually in your head rather than merely recognisable.
 *
 * Nothing on screen but the rule's name. You say the statement to yourself, reveal, and grade
 * honestly. The three buttons map onto the shared stage ladder: "Didn't know" is a wrong answer and
 * demotes, "Shaky" is the almost tier and holds position, "Knew it" advances. Self-grading is the
 * point — no typed answer can tell the difference between "I knew it" and "I typed something close".
 */
const GRADES: { result: AnswerResultKind; label: string; hint: string; cls: string }[] = [
  {
    result: "incorrect",
    label: "Didn't know",
    hint: "Show again soon",
    cls: "border-red/40 bg-red-light text-[#b8271b] hover:bg-red/15",
  },
  {
    result: "almost",
    label: "Shaky",
    hint: "Partly there",
    cls: "border-amber/40 bg-amber-light text-[#96690f] hover:bg-amber/15",
  },
  {
    result: "correct",
    label: "Knew it",
    hint: "Solid",
    cls: "border-green/40 bg-green-light text-[#0d7a4f] hover:bg-green/15",
  },
];

export default function MemoFlashcardExercise({ rule, onAnswered, onNext }: MemoExerciseProps) {
  const isFormula = rule.display === "formula";
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(false);

  // Space reveals, then 1/2/3 grade — so a whole flashcard round can be done from the keyboard.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || graded) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed) {
        const n = Number(e.key);
        if (n >= 1 && n <= 3) {
          e.preventDefault();
          grade(GRADES[n - 1].result);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function grade(result: AnswerResultKind) {
    if (graded) return;
    setGraded(true);
    playFeedbackSound(result);
    onAnswered({ ruleId: rule.id, format: "memo-flashcard", result, hintsUsed: 0 });
    onNext();
  }

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>{isFormula ? "Write the formula from memory, then reveal" : "Say the rule from memory, then reveal"}</Prompt>

      <div className="text-[22px] font-bold tracking-tight mb-1 leading-tight">{rule.title}</div>
      <div className="text-[13px] text-ink-faint mb-5">
        {rule.facts.length > 0
          ? `${rule.facts.length} key facts to recall`
          : isFormula
          ? "Recall the formula"
          : "Recall the statement"}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          autoFocus
          className="w-full rounded-2xl border-[1.5px] border-dashed border-line px-5 py-10 text-center transition-colors hover:border-blue hover:bg-blue-lighter"
        >
          <Eye size={20} className="text-ink-faint mx-auto mb-2" />
          <div className="text-[14.5px] font-semibold text-ink-soft">Reveal</div>
          <div className="text-[12px] text-ink-faint mt-0.5">
            or press <span className="font-mono bg-line-soft border border-line rounded px-1.5">Space</span>
          </div>
        </button>
      ) : (
        <div className="animate-fade-in">
          <RuleHeadline rule={rule} compact />

          {rule.facts.length > 0 && (
            <div className="mb-4">
              <FactList facts={rule.facts} muted />
            </div>
          )}

          <div className="text-[12px] text-ink-faint mb-2">How well did you know it?</div>
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map((g, i) => (
              <button
                key={g.result}
                onClick={() => grade(g.result)}
                className={"rounded-xl border-[1.5px] px-2 py-3 text-center transition-colors " + g.cls}
              >
                <div className="text-[13.5px] font-bold leading-tight">{g.label}</div>
                <div className="text-[11px] opacity-70 mt-0.5">{g.hint}</div>
                <div className="text-[10px] font-mono opacity-60 mt-1">{i + 1}</div>
              </button>
            ))}
          </div>

          <RuleSheet rule={rule} />
        </div>
      )}
    </>
  );
}
