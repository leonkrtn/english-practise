import type { MemoRule } from "@/lib/memo";
import type { MemoQueueItem, MemoResultEntry } from "@/lib/memoLearning";

export interface MemoExerciseProps {
  item: MemoQueueItem;
  /** Resolved by the router, so a card whose rule has gone away never reaches an exercise. */
  rule: MemoRule;
  onAnswered: (result: MemoResultEntry) => void;
  onNext: () => void;
}
