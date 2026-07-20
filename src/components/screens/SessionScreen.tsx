"use client";

import ExerciseRouter from "@/components/exercises/ExerciseRouter";
import type { QueueItem } from "@/lib/sessionLogic";
import type { ResultEntry } from "@/lib/types";

export default function SessionScreen({
  renderKey,
  progressPct,
  progressLabel,
  item,
  favorite,
  onExit,
  onToggleFav,
  onAnswered,
  onNext,
}: {
  renderKey: string | number;
  progressPct: number;
  progressLabel: string;
  item: QueueItem;
  favorite: boolean;
  onExit: () => void;
  onToggleFav: () => void;
  onAnswered: (entries: ResultEntry[]) => void;
  onNext: () => void;
}) {
  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-3.5 mb-5.5">
        <button
          onClick={onExit}
          title="End session"
          className="w-[34px] h-[34px] rounded-full border border-line bg-card text-ink-soft flex items-center justify-center text-[15px] shrink-0 hover:bg-line-soft transition-colors"
        >
          ✕
        </button>
        <div className="flex-1 h-1.5 bg-line-soft rounded-full overflow-hidden">
          <div className="h-full bg-blue rounded-full transition-[width] duration-300" style={{ width: progressPct + "%" }} />
        </div>
        <div className="text-[13px] text-ink-faint font-semibold whitespace-nowrap tabular-nums">{progressLabel}</div>
        <button
          onClick={onToggleFav}
          title="Favorite (F)"
          className={
            "w-[34px] h-[34px] rounded-full border flex items-center justify-center text-[15px] shrink-0 transition-colors " +
            (favorite ? "bg-amber-light border-amber text-amber" : "border-line bg-card text-ink-soft hover:bg-line-soft")
          }
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>
      <div
        key={renderKey}
        className="bg-card border border-line-soft rounded-[20px] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] min-h-[220px] flex flex-col animate-fade-in"
      >
        <ExerciseRouter item={item} onAnswered={onAnswered} onNext={onNext} />
      </div>
    </section>
  );
}
