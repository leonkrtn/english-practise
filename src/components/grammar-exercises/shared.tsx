"use client";

import type { GrammarRule } from "@/lib/grammar-data";
import type { GrammarResultEntry } from "@/lib/grammarTypes";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 text-purple bg-purple-light">
      {category}
    </span>
  );
}

export interface GrammarExerciseProps {
  rule: GrammarRule;
  onAnswered: (entries: GrammarResultEntry[]) => void;
  onNext: () => void;
}
