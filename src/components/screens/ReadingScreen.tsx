"use client";

import { useMemo, useState } from "react";
import { Newspaper, X } from "lucide-react";
import type { ReadingGap, ReadingText } from "@/lib/financeReading";
import { shuffle } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel } from "@/components/exercises/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const LEVEL_TINT: Record<string, string> = {
  B2: "from-blue to-blue-dark",
  C1: "from-purple to-purple-dark",
  C2: "from-red to-red-dark",
};

export interface ReadingCheckResult {
  correctCount: number;
  totalCount: number;
}

export default function ReadingScreen({
  text,
  eligibleGapIds,
  onExit,
  onFinish,
}: {
  text: ReadingText;
  eligibleGapIds: Set<string>;
  onExit: () => void;
  onFinish: (result: ReadingCheckResult) => void;
}) {
  const activeGaps = useMemo(() => text.gaps.filter((g) => eligibleGapIds.has(g.id)), [text, eligibleGapIds]);
  const optionsByGap = useMemo(() => {
    const map: Record<string, string[]> = {};
    activeGaps.forEach((g) => {
      map[g.id] = shuffle([g.answer, ...g.distractors]);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.id]);

  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState(false);

  const allAnswered = activeGaps.every((g) => chosen[g.id]);
  const correctCount = activeGaps.filter((g) => chosen[g.id] === g.answer).length;
  const overall: AnswerResultKind = !graded
    ? "correct"
    : correctCount === activeGaps.length
    ? "correct"
    : correctCount === 0
    ? "incorrect"
    : "almost";

  function check() {
    if (graded || !allAnswered) return;
    setGraded(true);
  }

  const segments = useMemo(() => splitBody(text.body), [text.body]);
  const gapById: Record<string, ReadingGap> = useMemo(() => {
    const map: Record<string, ReadingGap> = {};
    text.gaps.forEach((g) => (map[g.id] = g));
    return map;
  }, [text]);

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
          <Badge
            className={"h-auto rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm bg-gradient-to-r " + LEVEL_TINT[text.level]}
          >
            {text.level}
          </Badge>
          <span className="text-[11.5px] font-semibold text-ink-faint">{text.topic}</span>
        </div>
        <div className="text-[18px] font-bold tracking-tight mb-3 leading-snug">{text.title}</div>

        <div className="text-[15px] leading-[1.9] text-ink mb-5">
          {segments.map((seg, i) => {
            if (seg.type === "text") return <span key={i}>{seg.value}</span>;
            const gap = gapById[seg.gapId];
            const isActive = eligibleGapIds.has(seg.gapId);
            if (!isActive) return <span key={i}>{gap.answer}</span>;
            const picked = chosen[seg.gapId];
            const idx = activeGaps.findIndex((g) => g.id === seg.gapId) + 1;
            let cls = "border-line bg-bg text-ink-soft";
            if (graded) {
              cls = picked === gap.answer ? "border-green bg-green-light text-[#0d7a4f]" : "border-red bg-red-light text-[#b8271b]";
            } else if (picked) {
              cls = "border-blue bg-blue-light text-blue-dark";
            }
            return (
              <span
                key={i}
                className={"inline-flex items-center gap-1 mx-0.5 rounded-md border-[1.5px] px-1.5 py-0.5 text-[13.5px] font-semibold align-baseline " + cls}
              >
                <span className="text-[10px] opacity-70">{idx}</span>
                {picked || "____"}
              </span>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-3 border-t border-line-soft">
          {activeGaps.map((g, i) => (
            <div key={g.id}>
              <div className="text-[11.5px] font-bold text-ink-faint mb-1.5">Gap {i + 1}</div>
              <div className="flex flex-wrap gap-1.5">
                {optionsByGap[g.id].map((opt) => {
                  const isPicked = chosen[g.id] === opt;
                  let cls = "border-line bg-card hover:border-blue/40 hover:bg-blue-lighter";
                  if (graded) {
                    if (opt === g.answer) cls = "border-green bg-green-light text-[#0d7a4f]";
                    else if (isPicked) cls = "border-red bg-red-light text-[#b8271b]";
                    else cls = "border-line bg-card opacity-40";
                  } else if (isPicked) {
                    cls = "border-blue bg-blue-light text-blue-dark";
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => !graded && setChosen((c) => ({ ...c, [g.id]: opt }))}
                      disabled={graded}
                      className={"rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-medium transition-all " + cls}
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
            className="mt-5 h-auto w-full rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-transparent hover:text-white disabled:opacity-100 disabled:from-[#d1d1d6] disabled:to-[#d1d1d6] disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)]"
          >
            Check
          </Button>
        )}

        {graded && (
          <FeedbackPanel result={overall} onContinue={() => onFinish({ correctCount, totalCount: activeGaps.length })}>
            {correctCount}/{activeGaps.length} gaps correct.
          </FeedbackPanel>
        )}
      </div>
    </section>
  );
}

type Segment = { type: "text"; value: string } | { type: "gap"; gapId: string };

function splitBody(body: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\{\{(\w+)\}\}/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m.index > lastIndex) segments.push({ type: "text", value: body.slice(lastIndex, m.index) });
    segments.push({ type: "gap", gapId: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < body.length) segments.push({ type: "text", value: body.slice(lastIndex) });
  return segments;
}
