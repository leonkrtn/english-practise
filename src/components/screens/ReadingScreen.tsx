"use client";

import { useMemo, useState } from "react";
import { Newspaper, X } from "lucide-react";
import { READING_TOPIC_META, type ReadingText } from "@/lib/financeReading";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel } from "@/components/exercises/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ReadingCheckResult {
  correctCount: number;
  totalCount: number;
}

type Phase = "passage" | "questions" | "summary";

export default function ReadingScreen({
  text,
  onExit,
  onFinish,
}: {
  text: ReadingText;
  onExit: () => void;
  onFinish: (result: ReadingCheckResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("passage");
  const [answers, setAnswers] = useState<(number | null)[]>(() => text.questions.map(() => null));
  const [graded, setGraded] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSample, setShowSample] = useState(false);

  const paragraphs = useMemo(() => text.body.split("\n\n"), [text.body]);
  const allAnswered = answers.every((a) => a !== null);
  const correctCount = text.questions.filter((q, i) => answers[i] === q.correctIndex).length;
  const overall: AnswerResultKind = correctCount === text.questions.length ? "correct" : correctCount === 0 ? "incorrect" : "almost";
  const wordCount = useMemo(() => (summary.trim() ? summary.trim().split(/\s+/).length : 0), [summary]);

  function selectAnswer(qi: number, oi: number) {
    if (graded) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
  }

  function check() {
    if (graded || !allAnswered) return;
    setGraded(true);
  }

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3 shrink-0 w-full max-w-2xl mx-auto">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="End reading"
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>End reading</TooltipContent>
        </Tooltip>
        <div className="text-[13px] font-semibold text-ink-soft flex items-center gap-1.5">
          <Newspaper size={14} /> Reading
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full max-w-2xl mx-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-card border border-line-soft rounded-[22px] p-5 lg:p-7 shadow-[0_2px_8px_rgba(15,23,42,0.05),0_24px_48px_-18px_rgba(15,23,42,0.18)] flex flex-col animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="h-auto rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm bg-gradient-to-r from-red to-red-dark">
            {READING_TOPIC_META[text.topic].label}
          </Badge>
        </div>
        <div className="text-[18px] font-bold tracking-tight mb-4 leading-snug">{text.title}</div>

        {phase === "passage" && (
          <>
            <div className="flex flex-col gap-4 text-[15px] leading-[1.8] text-ink mb-5">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Button
              onClick={() => setPhase("questions")}
              variant="ghost"
              className="mt-auto h-auto w-full rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-transparent hover:text-white text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)]"
            >
              Continue to questions
            </Button>
          </>
        )}

        {phase === "questions" && (
          <>
            <div className="flex flex-col gap-5 mb-2">
              {text.questions.map((q, qi) => (
                <div key={qi}>
                  <div className="text-[14px] font-semibold text-ink mb-2 leading-snug">
                    {qi + 1}. {q.question}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, oi) => {
                      const isPicked = answers[qi] === oi;
                      let cls = "border-line bg-card hover:border-blue/40 hover:bg-blue-lighter";
                      if (graded) {
                        if (oi === q.correctIndex) cls = "border-green bg-green-light text-[#0d7a4f]";
                        else if (isPicked) cls = "border-red bg-red-light text-[#b8271b]";
                        else cls = "border-line bg-card opacity-40";
                      } else if (isPicked) {
                        cls = "border-blue bg-blue-light text-blue-dark";
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => selectAnswer(qi, oi)}
                          disabled={graded}
                          className={"text-left rounded-xl border-[1.5px] px-3.5 py-2.5 text-[13.5px] font-medium transition-all " + cls}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!graded && (
              <Button
                onClick={check}
                disabled={!allAnswered}
                variant="ghost"
                className="mt-4 h-auto w-full rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-transparent hover:text-white disabled:opacity-100 disabled:from-[#d1d1d6] disabled:to-[#d1d1d6] disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)]"
              >
                Check answers
              </Button>
            )}

            {graded && (
              <FeedbackPanel result={overall} onContinue={() => setPhase("summary")}>
                {correctCount}/{text.questions.length} questions correct.
              </FeedbackPanel>
            )}
          </>
        )}

        {phase === "summary" && (
          <>
            <div className="text-[13px] text-ink-faint mb-3">
              Write a short summary of the text in your own words (2-4 sentences), then compare it with a model summary.
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write your summary in English here…"
              rows={5}
              className="w-full text-[15px] leading-relaxed px-3.5 py-3 rounded-xl border-[1.5px] border-line bg-bg focus:bg-white focus:border-blue focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] outline-none transition-all font-sans resize-y mb-1.5"
            />
            <div className="text-[12px] text-ink-faint mb-4">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>

            {!showSample ? (
              <Button
                onClick={() => setShowSample(true)}
                disabled={summary.trim().length === 0}
                variant="ghost"
                className="h-auto w-full rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-transparent hover:text-white disabled:opacity-100 disabled:from-[#d1d1d6] disabled:to-[#d1d1d6] disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)]"
              >
                Show sample summary
              </Button>
            ) : (
              <div className="animate-fade-in">
                <div className="rounded-xl p-4 text-[14px] leading-relaxed text-ink-soft ring-1 ring-inset ring-blue/15 bg-blue-light/50 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-blue-dark mb-1.5">Sample summary</div>
                  {text.sampleSummary}
                </div>
                <Button
                  onClick={() => onFinish({ correctCount, totalCount: text.questions.length })}
                  variant="ghost"
                  className="h-auto w-full rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-transparent hover:text-white text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)]"
                >
                  Finish
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
