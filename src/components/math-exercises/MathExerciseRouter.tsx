"use client";

import MathLearnExercise from "./MathLearnExercise";
import MathProblemExercise from "./MathProblemExercise";
import type { MathExerciseProps } from "./types";

export default function MathExerciseRouter(props: MathExerciseProps) {
  if (props.item.kind === "learn") return <MathLearnExercise {...props} />;
  return <MathProblemExercise {...props} />;
}
