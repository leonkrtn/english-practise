"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, Clock, X } from "lucide-react";
import type { MathTestAnswer, MathTestQuestion } from "@/lib/mathTest";
import Formula from "@/components/Formula";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Exam conditions, same contract as the English TestScreen: no hints, no formula sheet, no
 * per-question feedback, and nothing that touches the learning stages. Answers stay editable and
 * the question map allows free navigation until the paper is handed in — which is why the progress
 * bar counts *answered* questions rather than position in the list.
 */
export default function MathTestScreen({
  questions,
  answers,
  index,
  startedAt,
  onAnswer,
  onNavigate,
  onSubmit,
  onExit,
}: {
  questions: MathTestQuestion[];
  answers: Record<string, MathTestAnswer>;
  index: number;
  startedAt: number;
  onAnswer: (questionId: string, answer: MathTestAnswer) => void;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
  onExit: () => void;
}) {
  const question = questions[index];
  const answered = useMemo(() => questions.filter((q) => isAnswered(answers[q.id])).length, [questions, answers]);
  const isLast = index === questions.length - 1;
  const inputRef = useRef<HTMLInputElement>(null);

  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - startedAt) / 1000));
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  useEffect(() => {
    if (question?.kind === "typed") inputRef.current?.focus();
  }, [question?.id, question?.kind]);

  const goNext = useCallback(() => {
    if (isLast) onSubmit();
    else onNavigate(index + 1);
  }, [isLast, index, onNavigate, onSubmit]);

  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(index - 1);
  }, [index, onNavigate]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const typing = !!target && ["INPUT", "TEXTAREA"].includes(target.tagName);

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (typing) return;
      if (e.key === "Enter") {
        const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
        if (activeTag === "BUTTON" || activeTag === "A") return;
        e.preventDefault();
        goNext();
        return;
      }
      if (question?.kind === "mc" && question.options) {
        const num = Number(e.key);
        if (!Number.isInteger(num) || num < 1 || num > 9) return;
        const optionIndex = num - 1;
        if (optionIndex >= question.options.length) return;
        e.preventDefault();
        onAnswer(question.id, { kind: "mc", chosen: optionIndex });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, onAnswer, goNext, goPrev]);

  if (!question) return null;
  const current = answers[question.id];

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 shrink-0 w-full max-w-2xl mx-auto">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="Cancel test (Esc)"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:text-ink-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>Cancel test (Esc)</TooltipContent>
        </Tooltip>
        <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ink to-ink/70 rounded-full transition-[width] duration-300"
            style={{ width: Math.round((answered / questions.length) * 100) + "%" }}
          />
        </div>
        <div className="text-[12.5px] text-ink-faint font-semibold whitespace-nowrap tabular-nums">
          {answered} / {questions.length}
        </div>
        <div className="flex items-center gap-1 text-[12.5px] font-semibold tabular-nums text-ink-soft border border-line-soft rounded-full px-2.5 py-1 shrink-0">
          <Clock size={12} /> {formatDuration(elapsed)}
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full max-w-2xl mx-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-card border border-line-soft rounded-[22px] p-5 lg:p-7 shadow-[0_2px_8px_rgba(15,23,42,0.05),0_24px_48px_-18px_rgba(15,23,42,0.18)] flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide bg-line-soft text-ink-soft">
            {question.category}
          </span>
          <span className="text-[12px] text-ink-faint font-semibold tabular-nums shrink-0">Question {index + 1}</span>
        </div>

        {question.question && <div className="text-[16px] text-ink leading-relaxed mb-3">{question.question}</div>}

        {question.promptTex && (
          <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-center overflow-x-auto">
            <Formula tex={question.promptTex} display className="text-[19px]" />
          </div>
        )}

        {question.kind === "mc" && question.options ? (
          <div className="flex flex-col gap-2 mt-1">
            {question.options.map((option, i) => {
              const selected = current?.kind === "mc" && current.chosen === i;
              return (
                <button
                  key={i}
                  onClick={() => onAnswer(question.id, { kind: "mc", chosen: i })}
                  className={
                    "flex items-center gap-3 text-left rounded-xl border-[1.5px] px-3.5 py-3 transition-all overflow-x-auto " +
                    (selected
                      ? "border-ink bg-ink text-white shadow-[0_8px_20px_-10px_rgba(15,23,42,0.6)]"
                      : "border-line bg-bg text-ink hover:border-ink/40 hover:-translate-y-0.5")
                  }
                >
                  <span
                    className={
                      "w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0 " +
                      (selected ? "bg-white/20 text-white" : "bg-line-soft text-ink-soft")
                    }
                  >
                    {i + 1}
                  </span>
                  <Formula tex={option} className="text-[15px]" />
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              value={current?.kind === "typed" ? current.text : ""}
              onChange={(e) => onAnswer(question.id, { kind: "typed", text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goNext();
                }
              }}
              placeholder="Your answer…"
              className="w-full text-[16px] px-3.5 py-3 rounded-xl border-[1.5px] border-line bg-bg outline-none transition-all font-sans focus:bg-white focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.08)]"
            />
            <div className="text-[12px] text-ink-faint mt-1.5">
              <code className="font-mono">*</code> multiplication · <code className="font-mono">^</code> powers ·{" "}
              <code className="font-mono">sqrt()</code>, <code className="font-mono">ln()</code>
            </div>
          </>
        )}

        <div className="flex-1" />

        <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-line-soft">
          {questions.map((q, i) => {
            const done = isAnswered(answers[q.id]);
            return (
              <button
                key={q.id}
                onClick={() => onNavigate(i)}
                title={`Question ${i + 1}${done ? " · answered" : ""}`}
                aria-label={`Go to question ${i + 1}`}
                className={
                  "w-6 h-6 rounded-md text-[10.5px] font-bold tabular-nums transition-all " +
                  (i === index
                    ? "bg-ink text-white"
                    : done
                    ? "bg-green-light text-[#0d7a4f] hover:bg-green/25"
                    : "bg-line-soft text-ink-faint hover:bg-line")
                }
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 shrink-0 w-full max-w-2xl mx-auto">
        <Button
          onClick={goPrev}
          disabled={index === 0}
          variant="ghost"
          className="h-auto rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft hover:text-ink disabled:opacity-35 disabled:pointer-events-none text-ink font-semibold px-4 py-2.5 text-[14px] transition-all active:scale-[0.97] flex items-center gap-1"
        >
          <ChevronLeft size={15} /> Back
        </Button>
        <div className="flex-1" />
        {!isLast && (
          <Button
            onClick={goNext}
            variant="ghost"
            className="h-auto rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft hover:text-ink text-ink font-semibold px-4 py-2.5 text-[14px] transition-all active:scale-[0.97] flex items-center gap-1"
          >
            Next <ChevronRight size={15} />
          </Button>
        )}
        <Button
          onClick={onSubmit}
          variant="ghost"
          className="h-auto rounded-full bg-gradient-to-r from-ink to-ink/80 hover:brightness-125 hover:text-white text-white font-semibold px-5 py-2.5 text-[14px] transition-all active:scale-[0.97] shadow-[0_10px_24px_-10px_rgba(15,23,42,0.6)] flex items-center gap-1.5"
        >
          <CircleCheck size={15} /> Submit test
        </Button>
      </div>
    </section>
  );
}

function isAnswered(a: MathTestAnswer | undefined): boolean {
  if (!a) return false;
  return a.kind === "mc" ? a.chosen !== null : a.text.trim().length > 0;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
