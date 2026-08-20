"use client";

import { memoRuleById } from "@/lib/memo";
import { memoRenderKind } from "@/lib/memoLearning";
import MemoLearnExercise from "./MemoLearnExercise";
import MemoFlashcardExercise from "./MemoFlashcardExercise";
import MemoClozeExercise from "./MemoClozeExercise";
import MemoMcExercise from "./MemoMcExercise";
import MemoTrueFalseExercise from "./MemoTrueFalseExercise";
import MemoOrderExercise from "./MemoOrderExercise";
import MemoFactsExercise from "./MemoFactsExercise";
import MemoFormulaClozeExercise from "./MemoFormulaClozeExercise";
import type { MemoExerciseProps } from "./types";

export default function MemoExerciseRouter(props: Omit<MemoExerciseProps, "rule">) {
  const rule = memoRuleById(props.item.ruleId);
  // A card can outlive its rule — a set deleted mid-session, or content dropped in an update.
  if (!rule) return null;
  const p = { ...props, rule };

  switch (memoRenderKind(props.item)) {
    case "learn":
      return <MemoLearnExercise {...p} />;
    case "cloze":
      return <MemoClozeExercise {...p} />;
    case "formulacloze":
      return <MemoFormulaClozeExercise {...p} />;
    case "mc":
      return <MemoMcExercise {...p} />;
    case "truefalse":
      return <MemoTrueFalseExercise {...p} />;
    case "order":
      return <MemoOrderExercise {...p} />;
    case "facts":
      return <MemoFactsExercise {...p} />;
    default:
      return <MemoFlashcardExercise {...p} />;
  }
}
