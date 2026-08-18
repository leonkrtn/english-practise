"use client";

import { memoRenderKind } from "@/lib/memoLearning";
import MemoLearnExercise from "./MemoLearnExercise";
import MemoFlashcardExercise from "./MemoFlashcardExercise";
import MemoClozeExercise from "./MemoClozeExercise";
import MemoMcExercise from "./MemoMcExercise";
import MemoTrueFalseExercise from "./MemoTrueFalseExercise";
import MemoOrderExercise from "./MemoOrderExercise";
import MemoFactsExercise from "./MemoFactsExercise";
import type { MemoExerciseProps } from "./types";

export default function MemoExerciseRouter(props: MemoExerciseProps) {
  switch (memoRenderKind(props.item)) {
    case "learn":
      return <MemoLearnExercise {...props} />;
    case "cloze":
      return <MemoClozeExercise {...props} />;
    case "mc":
      return <MemoMcExercise {...props} />;
    case "truefalse":
      return <MemoTrueFalseExercise {...props} />;
    case "order":
      return <MemoOrderExercise {...props} />;
    case "facts":
      return <MemoFactsExercise {...props} />;
    default:
      return <MemoFlashcardExercise {...props} />;
  }
}
