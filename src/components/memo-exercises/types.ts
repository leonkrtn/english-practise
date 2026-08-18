import type { MemoQueueItem, MemoResultEntry } from "@/lib/memoLearning";

export interface MemoExerciseProps {
  item: MemoQueueItem;
  onAnswered: (result: MemoResultEntry) => void;
  onNext: () => void;
}
