"use client";

import TranslateExercise from "./TranslateExercise";
import GapExercise from "./GapExercise";
import McExercise from "./McExercise";
import SentenceExercise from "./SentenceExercise";
import MatchExercise from "./MatchExercise";
import BuildExercise from "./BuildExercise";
import MultigapExercise from "./MultigapExercise";
import ConfusableExercise from "./ConfusableExercise";
import LearnExercise from "./LearnExercise";
import type { ExerciseProps } from "./types";

export default function ExerciseRouter(props: ExerciseProps) {
  switch (props.item.format) {
    case "learn":
      return <LearnExercise {...props} />;
    case "translate":
      return <TranslateExercise {...props} />;
    case "gap":
      return <GapExercise {...props} />;
    case "mc":
      return <McExercise {...props} />;
    case "sentence":
      return <SentenceExercise {...props} />;
    case "match":
      return <MatchExercise {...props} />;
    case "build":
      return <BuildExercise {...props} />;
    case "multigap":
      return <MultigapExercise {...props} />;
    case "confusable":
      return <ConfusableExercise {...props} />;
    default:
      return <TranslateExercise {...props} />;
  }
}
