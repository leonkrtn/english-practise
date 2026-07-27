"use client";

import { useEffect, useRef } from "react";
import { Ban, Sparkles, Star, Timer, X, Zap } from "lucide-react";
import { animate } from "animejs";
import { comboTier } from "@/lib/gamification";
import { motionMs } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Fills toward `pct` with a snappy overshoot-then-settle instead of a linear CSS transition —
 * driven by anime.js so it can retarget smoothly mid-flight if `pct` changes again before the
 * previous fill finished (answering fast through a short queue). */
function ProgressBar({ pct }: { pct: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animate(barRef.current!, { width: pct + "%", duration: motionMs(500), ease: "outQuint" });
  }, [pct]);
  return (
    <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
      <div ref={barRef} className="h-full bg-gradient-to-r from-blue to-purple rounded-full" style={{ width: 0 }} />
    </div>
  );
}

/** The combo pill: pops in with an elastic overshoot plus a small rotational wiggle whenever it
 * (re)mounts — the parent keys it by tier so a *new* tier reaching the screen replays this instead
 * of every single correct answer inside the same tier retriggering it. */
function ComboBadge({ combo, tier }: { combo: number; tier: ReturnType<typeof comboTier> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animate(ref.current!, {
      scale: [0.4, 1.15, 1],
      rotate: [-6, 3, 0],
      opacity: [0, 1],
      duration: motionMs(450),
      ease: "outElastic(1, .6)",
    });
  }, []);
  return (
    <div
      ref={ref}
      className={
        "flex items-center gap-1 text-[11.5px] font-bold text-white rounded-full px-2.5 py-1 shadow-sm bg-gradient-to-r " +
        (tier ? tier.grad : "from-ink to-ink/80")
      }
      style={{ opacity: 0 }}
    >
      <Zap size={11} fill="currentColor" />
      {combo}x{tier && <span className="opacity-80 font-semibold">· {tier.multiplier}× XP</span>}
    </div>
  );
}

/** The exercise card itself: fades, rises and settles from a slight scale on every question — key'd
 * by the caller so each new question is a fresh mount and replays the entrance. */
function ExerciseCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animate(ref.current!, {
      opacity: [0, 1],
      translateY: [14, 0],
      scale: [0.98, 1],
      duration: motionMs(320),
      ease: "outQuad",
    });
  }, []);
  return (
    <div
      ref={ref}
      style={{ opacity: 0 }}
      className="flex-1 min-h-0 w-full max-w-2xl mx-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-card border border-line-soft rounded-[22px] p-5 lg:p-7 shadow-[0_2px_8px_rgba(15,23,42,0.05),0_24px_48px_-18px_rgba(15,23,42,0.18)] flex flex-col"
    >
      {children}
    </div>
  );
}

export default function SessionScreen({
  renderKey,
  progressPct,
  progressLabel,
  favorite,
  showFavorite = true,
  timerLabel,
  showRewards = false,
  combo = 0,
  sessionXp = 0,
  xpPop,
  onExit,
  onToggleFav,
  onBlock,
  children,
}: {
  renderKey: string | number;
  progressPct: number;
  progressLabel: string;
  favorite: boolean;
  showFavorite?: boolean;
  timerLabel?: string;
  /** Only the stage-engine session banks XP per answer; the quick drills and the linking queue
   * don't, so they hide the reward strip rather than parking a "0 XP" that never moves. */
  showRewards?: boolean;
  /** Current run of consecutive correct answers — drives the combo badge and its multiplier. */
  combo?: number;
  /** XP banked in this session so far. */
  sessionXp?: number;
  /** The most recent award, re-keyed on every answer so the floating "+N XP" replays. */
  xpPop?: { amount: number; key: number } | null;
  onExit: () => void;
  onToggleFav: () => void;
  onBlock?: () => void;
  children: React.ReactNode;
}) {
  const tier = comboTier(combo);
  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 shrink-0 w-full max-w-2xl mx-auto">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="End session (Esc)"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:text-ink-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>End session (Esc)</TooltipContent>
        </Tooltip>
        <ProgressBar pct={progressPct} />
        <div className="text-[12.5px] text-ink-faint font-semibold whitespace-nowrap tabular-nums">{progressLabel}</div>
        {timerLabel && (
          <div className="flex items-center gap-1 text-[12.5px] font-bold tabular-nums text-white bg-gradient-to-r from-amber to-amber-dark rounded-full px-2.5 py-1 shrink-0">
            <Timer size={12} /> {timerLabel}
          </div>
        )}
        {showFavorite && onBlock && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => {
                    if (window.confirm("Dieses Wort für immer aus dem Training ausschließen?")) onBlock();
                  }}
                  aria-label="Wort ausschließen (X)"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border-line bg-card text-ink-soft shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-red/40 hover:text-red hover:bg-red-light"
                />
              }
            >
              <Ban size={16} />
            </TooltipTrigger>
            <TooltipContent>Wort ausschließen (X)</TooltipContent>
          </Tooltip>
        )}
        {showFavorite && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={onToggleFav}
                  aria-label="Favorit (F)"
                  variant="ghost"
                  size="icon"
                  className={
                    "h-8 w-8 rounded-full shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-sm " +
                    (favorite
                      ? "bg-gradient-to-br from-amber to-amber-dark border-amber text-white shadow-[0_4px_12px_-4px_rgba(232,161,46,0.5)] hover:from-amber hover:to-amber-dark hover:text-white"
                      : "border-line bg-card text-ink-soft hover:bg-line-soft hover:text-ink-soft")
                  }
                />
              }
            >
              <Star size={16} fill={favorite ? "currentColor" : "none"} />
            </TooltipTrigger>
            <TooltipContent>Favorit (F)</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Live reward strip: XP banked so far on the left, the current combo on the right. Kept in
          its own row above the exercise card so it never competes with the question for attention,
          and rendered as a fixed-height row so the card below doesn't jump as the combo appears. */}
      {showRewards && (
      <div className="relative flex items-center justify-between gap-2 mb-2 h-6 shrink-0 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-faint tabular-nums">
          <Sparkles size={12} className="text-amber" />
          {sessionXp} XP
          {xpPop && xpPop.amount > 0 && (
            <span key={xpPop.key} className="animate-xp-pop text-green font-bold ml-0.5">
              +{xpPop.amount}
            </span>
          )}
        </div>
        {combo >= 2 && <ComboBadge key={tier?.label ?? "combo"} combo={combo} tier={tier} />}
      </div>
      )}

      <ExerciseCard key={renderKey}>{children}</ExerciseCard>
    </section>
  );
}
