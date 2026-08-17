"use client";

import { renderKindFor } from "@/lib/mathLearning";
import MathLearnExercise from "./MathLearnExercise";
import MathSolveExercise from "./MathSolveExercise";
import MathMcExercise from "./MathMcExercise";
import MathStepsExercise from "./MathStepsExercise";
import MathErrorExercise from "./MathErrorExercise";
import type { MathExerciseProps } from "./types";

export default function MathExerciseRouter(props: MathExerciseProps) {
  switch (renderKindFor(props.item)) {
    case "learn":
      return <MathLearnExercise {...props} />;
    case "mc":
      return <MathMcExercise {...props} />;
    case "steps":
      return <MathStepsExercise {...props} />;
    case "error":
      return <MathErrorExercise {...props} />;
    // solve, simplify and word all render as the typed-answer exercise.
    default:
      return <MathSolveExercise {...props} />;
  }
}
