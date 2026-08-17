import type { MathQueueItem, MathResultEntry } from "@/lib/mathLearning";

export interface MathExerciseProps {
  item: MathQueueItem;
  onAnswered: (result: MathResultEntry) => void;
  onNext: () => void;
}
