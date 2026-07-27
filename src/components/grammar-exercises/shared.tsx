"use client";

import type { GrammarRule } from "@/lib/grammar-data";
import type { GrammarResultEntry } from "@/lib/grammarTypes";
import { Badge } from "@/components/ui/badge";

/** Re-exported so a grammar exercise opens with the same instruction line as a vocab one — the two
 * directories render into the same card and previously spaced their first row differently. */
export { Prompt } from "@/components/exercises/shared";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge className="h-auto self-start rounded-full px-2.5 py-1 mb-4 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm bg-gradient-to-r from-purple to-purple-dark">
      {category}
    </Badge>
  );
}

export interface GrammarExerciseProps {
  rule: GrammarRule;
  onAnswered: (entries: GrammarResultEntry[]) => void;
  onNext: () => void;
}
