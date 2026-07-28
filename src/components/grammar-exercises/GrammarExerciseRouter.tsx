"use client";

import type { GrammarStageKind, GrammarReviewFormat } from "@/lib/grammarLearning";
import GrammarLearnExercise from "./GrammarLearnExercise";
import GrammarMcExercise from "./GrammarMcExercise";
import GrammarGapExercise from "./GrammarGapExercise";
import GrammarBuildExercise from "./GrammarBuildExercise";
import GrammarErrorExercise from "./GrammarErrorExercise";
import GrammarConjugateExercise from "./GrammarConjugateExercise";
import GrammarTranslateExercise from "./GrammarTranslateExercise";
import GrammarTransformExercise from "./GrammarTransformExercise";
import GrammarSituationExercise from "./GrammarSituationExercise";
import type { GrammarExerciseProps } from "./shared";

export default function GrammarExerciseRouter({
  kind,
  reviewFormat,
  ...props
}: GrammarExerciseProps & { kind: GrammarStageKind; reviewFormat?: GrammarReviewFormat }) {
  switch (kind) {
    case "learn":
      return <GrammarLearnExercise {...props} />;
    case "quiz":
      return <GrammarMcExercise {...props} />;
    case "apply":
      return <GrammarGapExercise {...props} />;
    case "produce":
      return <GrammarBuildExercise {...props} />;
    // Formats that used to be reserved for long-term review, now also part of active learning so a
    // rule isn't tested with the same three question shapes on its way up the ladder.
    case "situation":
      return <GrammarSituationExercise {...props} />;
    case "conjugate":
      return <GrammarConjugateExercise {...props} />;
    case "error":
      return <GrammarErrorExercise {...props} />;
    case "translate":
      return <GrammarTranslateExercise {...props} />;
    case "transform":
      return <GrammarTransformExercise {...props} />;
    case "review":
      switch (reviewFormat) {
        case "g-mc":
          return <GrammarMcExercise {...props} />;
        case "g-gap":
          return <GrammarGapExercise {...props} />;
        case "g-build":
          return <GrammarBuildExercise {...props} />;
        case "g-conjugate":
          return <GrammarConjugateExercise {...props} />;
        case "g-translate":
          return <GrammarTranslateExercise {...props} />;
        case "g-transform":
          return <GrammarTransformExercise {...props} />;
        case "g-situation":
          return <GrammarSituationExercise {...props} />;
        default:
          return <GrammarErrorExercise {...props} />;
      }
  }
}
