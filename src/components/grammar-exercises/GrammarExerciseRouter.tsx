"use client";

import type { GrammarStageKind } from "@/lib/grammarLearning";
import GrammarLearnExercise from "./GrammarLearnExercise";
import GrammarMcExercise from "./GrammarMcExercise";
import GrammarGapExercise from "./GrammarGapExercise";
import GrammarBuildExercise from "./GrammarBuildExercise";
import GrammarErrorExercise from "./GrammarErrorExercise";
import type { GrammarExerciseProps } from "./shared";

export default function GrammarExerciseRouter({ kind, ...props }: GrammarExerciseProps & { kind: GrammarStageKind }) {
  switch (kind) {
    case "learn":
      return <GrammarLearnExercise {...props} />;
    case "quiz":
      return <GrammarMcExercise {...props} />;
    case "apply":
      return <GrammarGapExercise {...props} />;
    case "produce":
      return <GrammarBuildExercise {...props} />;
    case "review":
      return <GrammarErrorExercise {...props} />;
  }
}
