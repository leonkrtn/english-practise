"use client";

import { useState } from "react";
import { Hand } from "lucide-react";
import { anatomyFor } from "@/lib/math/anatomy";
import Formula from "./Formula";

/**
 * The formula, rendered as a row of tappable pieces.
 *
 * Each interactive part is its own inline KaTeX span sitting on a shared baseline, so the row still
 * reads as one formula while every meaningful piece is independently selectable. Tapping one dims
 * the rest and shows what that piece actually does — which is the difference between recognising
 * (fg)' = f'g + fg' and being able to reconstruct it.
 *
 * Falls back to the plain formula when a rule has no anatomy authored.
 */
export default function FormulaAnatomy({
  ruleId,
  formulaTex,
  size = "text-[20px]",
}: {
  ruleId: string;
  formulaTex: string;
  size?: string;
}) {
  const parts = anatomyFor(ruleId);
  const [selected, setSelected] = useState<number | null>(null);

  if (!parts) {
    return (
      <div className="overflow-x-auto text-center">
        <Formula tex={formulaTex} display className={size} />
      </div>
    );
  }

  const active = selected !== null ? parts[selected] : null;

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex items-baseline justify-center flex-wrap gap-x-1 gap-y-2 min-w-min">
          {parts.map((part, i) => {
            const interactive = !!part.explanation;
            if (!interactive) {
              return <Formula key={i} tex={part.tex} className={size + " text-ink-soft"} />;
            }
            const isSelected = selected === i;
            const dimmed = selected !== null && !isSelected;
            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : i)}
                aria-pressed={isSelected}
                aria-label={part.label}
                className={
                  "rounded-lg px-1.5 py-0.5 -my-0.5 transition-all cursor-pointer " +
                  (isSelected
                    ? "bg-blue text-white shadow-[0_4px_12px_-4px_rgba(0,113,227,0.5)]"
                    : dimmed
                    ? "opacity-35 hover:opacity-70"
                    : "hover:bg-blue-light")
                }
              >
                <Formula tex={part.tex} className={size} />
              </button>
            );
          })}
        </div>
      </div>

      {active ? (
        <div className="mt-3 rounded-xl bg-blue-light/60 ring-1 ring-inset ring-blue/15 px-4 py-3 text-left animate-fade-in">
          <div className="text-[11px] uppercase tracking-wide font-bold text-blue-dark mb-1">{active.label}</div>
          <div className="text-[13.5px] text-ink-soft leading-relaxed">{active.explanation}</div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-faint">
          <Hand size={12} /> Tap any part of the formula to see what it does
        </div>
      )}
    </div>
  );
}
