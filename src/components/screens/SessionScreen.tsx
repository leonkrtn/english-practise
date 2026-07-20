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
          className="w-8 h-8 rounded-full border border-line bg-card text-ink-soft flex items-center justify-center shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
        >
          <X size={16} />
        </button>
        <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue to-purple rounded-full transition-[width] duration-300"
            style={{ width: progressPct + "%" }}
          />
        </div>
        <div className="text-[12.5px] text-ink-faint font-semibold whitespace-nowrap tabular-nums">{progressLabel}</div>
        {showFavorite && (
          <button
            onClick={onToggleFav}
            title="Favorite"
            className={
              "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-sm " +
              (favorite
                ? "bg-gradient-to-br from-amber to-amber-dark border-amber text-white shadow-[0_4px_12px_-4px_rgba(232,161,46,0.5)]"
                : "border-line bg-card text-ink-soft hover:bg-line-soft")
            }
          >
            <Star size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      <div
        key={renderKey}
        className="flex-1 min-h-0 overflow-y-auto bg-card border border-line-soft rounded-[22px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05),0_24px_48px_-18px_rgba(15,23,42,0.18)] flex flex-col animate-fade-in"
      >
        {children}
      </div>
    </section>
  );
}
