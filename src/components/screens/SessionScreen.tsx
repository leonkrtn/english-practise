"use client";

import { Star, X } from "lucide-react";

export default function SessionScreen({
  renderKey,
  progressPct,
  progressLabel,
  favorite,
  showFavorite = true,
  onExit,
  onToggleFav,
  children,
}: {
  renderKey: string | number;
  progressPct: number;
  progressLabel: string;
  favorite: boolean;
  showFavorite?: boolean;
  onExit: () => void;
  onToggleFav: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <button
          onClick={onExit}
          title="End session"
          className="w-8 h-8 rounded-full border border-line bg-card text-ink-soft flex items-center justify-center shrink-0 hover:bg-line-soft transition-colors"
        >
          <X size={16} />
        </button>
        <div className="flex-1 h-1.5 bg-line-soft rounded-full overflow-hidden">
          <div className="h-full bg-blue rounded-full transition-[width] duration-300" style={{ width: progressPct + "%" }} />
        </div>
        <div className="text-[12.5px] text-ink-faint font-semibold whitespace-nowrap tabular-nums">{progressLabel}</div>
        {showFavorite && (
          <button
            onClick={onToggleFav}
            title="Favorite"
            className={
              "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors " +
              (favorite ? "bg-amber-light border-amber text-amber" : "border-line bg-card text-ink-soft hover:bg-line-soft")
            }
          >
            <Star size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      <div
        key={renderKey}
        className="flex-1 min-h-0 overflow-y-auto bg-card border border-line-soft rounded-[20px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] flex flex-col animate-fade-in"
      >
        {children}
      </div>
    </section>
  );
}
