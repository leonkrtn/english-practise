"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, Clock, X } from "lucide-react";
import type { TestAnswer, TestQuestion } from "@/lib/testMode";

/**
 * Exam conditions, on purpose: no hints, no per-question feedback, no sounds, and nothing that
 * touches the learning stages. The learner can move freely between questions and change answers
 * until they hand the paper in — which is why the progress bar counts *answered* questions rather
 * than how far through the list they've walked.
 */
export default function TestScreen({
  questions,
  answers,
  index,
  startedAt,
  onAnswer,
  onNavigate,
  onSubmit,
  onExit,
}: {
  questions: TestQuestion[];
  answers: Record<string, TestAnswer>;
  index: number;
  startedAt: number;
  onAnswer: (questionId: string, answer: TestAnswer) => void;
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

  // Every question is a fresh input; focusing it on arrival means a typed answer needs no click at
  // all, which matters when working through 40 of them.
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

  // A-D picks an option, arrows walk the paper, Enter advances. Deliberately skipped while a text
  // field has focus (except for the arrows-with-modifier case), so letters typed into a gap answer
  // aren't swallowed as shortcuts.
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
        const key = e.key.toUpperCase();
        if (key.length !== 1 || key < "A" || key > "Z") return;
        const optionIndex = key.charCodeAt(0) - 65;
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
        <button
          onClick={onExit}
          title="Test abbrechen (Esc)"
          className="w-8 h-8 rounded-full border border-line bg-card text-ink-soft flex items-center justify-center shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
        >
          <X size={16} />
        </button>
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
          <span className="text-[12px] text-ink-faint font-semibold tabular-nums shrink-0">Frage {index + 1}</span>
        </div>

        <div className="text-[22px] font-bold tracking-tight leading-snug mb-1">{question.prompt}</div>
        {question.sub && <div className="text-[13.5px] text-ink-faint mb-4">{question.sub}</div>}

        {question.kind === "mc" && question.options ? (
          <div className="flex flex-col gap-2 mt-2">
            {question.options.map((option, i) => {
              const selected = current?.kind === "mc" && current.chosen === i;
              return (
                <button
                  key={i}
                  onClick={() => onAnswer(question.id, { kind: "mc", chosen: i })}
                  className={
                    "flex items-center gap-3 text-left rounded-xl border-[1.5px] px-3.5 py-3 text-[15px] transition-all " +
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
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
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
            placeholder="Deine Antwort…"
            className="w-full text-[16px] px-3.5 py-3 rounded-xl border-[1.5px] border-line bg-bg outline-none transition-all font-sans focus:bg-white focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.08)]"
          />
        )}

        <div className="flex-1" />

        {/* Question map: lets the learner jump straight back to anything they skipped, which is the
            whole reason answers stay editable until submission. */}
        <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-line-soft">
          {questions.map((q, i) => {
            const done = isAnswered(answers[q.id]);
            return (
              <button
                key={q.id}
                onClick={() => onNavigate(i)}
                title={`Frage ${i + 1}${done ? " · beantwortet" : ""}`}
                aria-label={`Zu Frage ${i + 1}`}
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
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft disabled:opacity-35 disabled:pointer-events-none text-ink font-semibold px-4 py-2.5 text-[14px] transition-all active:scale-[0.97] flex items-center gap-1"
        >
          <ChevronLeft size={15} /> Zurück
        </button>
        <div className="flex-1" />
        {!isLast && (
          <button
            onClick={goNext}
            className="rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft text-ink font-semibold px-4 py-2.5 text-[14px] transition-all active:scale-[0.97] flex items-center gap-1"
          >
            Weiter <ChevronRight size={15} />
          </button>
        )}
        <button
          onClick={onSubmit}
          className="rounded-full bg-gradient-to-r from-ink to-ink/80 hover:brightness-125 text-white font-semibold px-5 py-2.5 text-[14px] transition-all active:scale-[0.97] shadow-[0_10px_24px_-10px_rgba(15,23,42,0.6)] flex items-center gap-1.5"
        >
          <CircleCheck size={15} /> Test abgeben
        </button>
      </div>
    </section>
  );
}

function isAnswered(a: TestAnswer | undefined): boolean {
  if (!a) return false;
  return a.kind === "mc" ? a.chosen !== null : a.text.trim().length > 0;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
