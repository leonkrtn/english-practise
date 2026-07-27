"use client";

import type { GrammarRule } from "@/lib/grammar-data";
import type { GrammarResultEntry } from "@/lib/grammarTypes";
import { Badge } from "@/components/ui/badge";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge className="h-auto self-start rounded-full px-2.5 py-1 mb-3 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm bg-gradient-to-r from-purple to-purple-dark">
      {category}
    </Badge>
  );
}

export interface GrammarExerciseProps {
  rule: GrammarRule;
  onAnswered: (entries: GrammarResultEntry[]) => void;
  onNext: () => void;
}
