"use client";

import { useState } from "react";
import { Check, ChevronDown, Clock, RotateCcw, X } from "lucide-react";
import { mathBandFor, scoreMathAnswer, type MathTestAnswer, type MathTestQuestion, type MathTestResultSummary } from "@/lib/mathTest";
import Formula from "@/components/Formula";
import { Button } from "@/components/ui/button";
import { formatDuration } from "./MathTestScreen";

export interface MathTestResult {
  summary: MathTestResultSummary;
  questions: MathTestQuestion[];
  answers: Record<string, MathTestAnswer>;
  durationSeconds: number;
  scopeLabel: string;
}

export default function MathTestResultScreen({
  result,
  onRetry,
  onHome,
}: {
  result: MathTestResult;
  onRetry: () => void;
  onHome: () => void;
}) {
  const { summary, questions, answers } = result;
  const band = mathBandFor(summary.percent);
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section className="animate-fade-in pb-6">
      <div className={"rounded-2xl p-6 text-center text-white bg-gradient-to-br mb-4 shadow-sm " + band.grad}>
        <div className="text-[12px] font-bold uppercase tracking-wide opacity-80 mb-1">{result.scopeLabel}</div>
        <div className="text-[52px] font-extrabold leading-none tabular-nums">{summary.percent}%</div>
        <div className="text-[15px] font-semibold mt-1">{band.label}</div>
        <div className="text-[13px] opacity-85 mt-2 tabular-nums">
          {summary.points} von {summary.total} Punkten
        </div>
        <div className="inline-flex items-center gap-1.5 text-[12px] opacity-85 mt-2 bg-white/15 rounded-full px-2.5 py-1">
          <Clock size={11} /> {formatDuration(result.durationSeconds)}
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <Button
          onClick={onRetry}
          variant="ghost"
          className="h-auto flex-1 rounded-full bg-gradient-to-r from-ink to-ink/80 hover:brightness-125 hover:text-white text-white font-semibold py-3 text-[14.5px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={15} /> Nochmal
        </Button>
        <Button
          onClick={onHome}
          variant="ghost"
          className="h-auto flex-1 rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft hover:text-ink text-ink font-semibold py-3 text-[14.5px] transition-all active:scale-[0.97]"
        >
          Fertig
        </Button>
      </div>

      <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Lösungen</h2>
      <div className="flex flex-col gap-2">
        {questions.map((q, i) => {
          const answer = answers[q.id];
          const correct = scoreMathAnswer(q, answer) === 1;
          const open = openKey === q.id;
          const given =
            answer?.kind === "mc"
              ? answer.chosen !== null && q.options
                ? q.options[answer.chosen]
                : null
              : answer?.kind === "typed" && answer.text.trim()
              ? answer.text
              : null;

          return (
            <div key={q.id} className="bg-card border border-line-soft rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenKey((cur) => (cur === q.id ? null : q.id))}
                aria-expanded={open}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-bg transition-colors"
              >
                <span
                  className={
                    "w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 " + (correct ? "bg-green" : "bg-red")
                  }
                >
                  {correct ? <Check size={13} /> : <X size={13} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-ink-faint truncate">
                    {i + 1}. {q.category}
                  </div>
                  <div className="overflow-x-auto">
                    {q.promptTex ? (
                      <Formula tex={q.promptTex} className="text-[14px]" />
                    ) : (
                      <span className="text-[13.5px] text-ink">{q.question}</span>
                    )}
                  </div>
                </div>
                <ChevronDown size={15} className={"text-ink-faint shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
              </button>

              {open && (
                <div className="px-4 pb-4 pt-1">
                  {q.question && q.promptTex && <div className="text-[13.5px] text-ink-soft leading-relaxed mb-3">{q.question}</div>}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={"rounded-xl px-3 py-2 " + (correct ? "bg-green-light/60" : "bg-red-light/50")}>
                      <div className="text-[10px] uppercase tracking-wide font-bold text-ink-faint mb-0.5">Deine Antwort</div>
                      <div className="text-[13.5px] text-ink overflow-x-auto">
                        {given === null ? (
                          <span className="text-ink-faint italic">nicht beantwortet</span>
                        ) : q.kind === "mc" ? (
                          <Formula tex={given} className="text-[13.5px]" />
                        ) : (
                          <code className="font-mono">{given}</code>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl px-3 py-2 bg-green-light/60">
                      <div className="text-[10px] uppercase tracking-wide font-bold text-ink-faint mb-0.5">Richtig</div>
                      <div className="text-[13.5px] text-ink overflow-x-auto">
                        {q.kind === "mc" ? (
                          <Formula tex={q.solution} className="text-[13.5px]" />
                        ) : (
                          <code className="font-mono font-semibold">{q.solution}</code>
                        )}
                      </div>
                    </div>
                  </div>

                  {q.solutionSteps.length > 0 && (
                    <div className="rounded-xl bg-bg p-3">
                      <div className="text-[10px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Lösungsweg</div>
                      <div className="flex flex-col gap-1.5 overflow-x-auto">
                        {q.solutionSteps.map((s, j) => (
                          <div key={j} className="flex items-baseline gap-2">
                            <span className="text-[10px] font-bold text-ink-faint tabular-nums shrink-0 w-4">{j + 1}</span>
                            <Formula tex={s} className="text-[13.5px]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
