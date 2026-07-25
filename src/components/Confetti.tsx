"use client";

import { useMemo } from "react";

const COLORS = ["#0071e3", "#8b5cf6", "#1eb676", "#e8a12e", "#e8483a"];

/** Deterministic pseudo-random in [0, 1) from an integer seed. The scatter has to be computed
 * during render, and Math.random() there would re-roll every piece on any unrelated re-render —
 * mid-flight, visibly. Seeding off the trigger keeps each burst stable while still making
 * consecutive bursts look different. */
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A one-shot celebratory burst. Deliberately plain DOM + CSS rather than a canvas: at this piece
 * count the browser composites it on the GPU for free, it needs no animation loop and no timer to
 * clean up after itself (the animation ends at opacity 0 and holds there via `forwards`), and the
 * global prefers-reduced-motion rule in globals.css already collapses it to nothing for anyone
 * who's asked for less movement.
 *
 * `trigger` is a counter, not a boolean — bumping it re-keys the pieces, which restarts the
 * animation. So the same mounted instance can celebrate repeatedly (a combo milestone, then a
 * level-up) without the parent having to unmount and remount it.
 */
export default function Confetti({ trigger, pieces = 34, durationMs = 1600 }: { trigger: number; pieces?: number; durationMs?: number }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const base = trigger * 1000 + i * 7;
        return {
          left: seeded(base) * 100,
          delay: seeded(base + 1) * 220,
          drift: (seeded(base + 2) - 0.5) * 160,
          spin: seeded(base + 3) * 720 - 360,
          color: COLORS[i % COLORS.length],
          size: 6 + seeded(base + 4) * 6,
          round: seeded(base + 5) < 0.35,
        };
      }),
    [trigger, pieces]
  );

  if (trigger <= 0) return null;

  return (
    <div key={trigger} className="pointer-events-none fixed inset-0 z-[120] overflow-hidden" aria-hidden="true">
      {confetti.map((c, i) => (
        <span
          key={i}
          className="absolute top-[-14px] animate-confetti"
          style={{
            left: c.left + "%",
            width: c.size,
            height: c.size * (c.round ? 1 : 1.6),
            background: c.color,
            borderRadius: c.round ? "50%" : "2px",
            animationDelay: c.delay + "ms",
            animationDuration: durationMs + "ms",
            ["--confetti-drift" as string]: c.drift + "px",
            ["--confetti-spin" as string]: c.spin + "deg",
          }}
        />
      ))}
    </div>
  );
}
