import type { QueueItem, ResultEntry } from "@/lib/types";

export interface ExerciseProps {
  item: QueueItem;
  onAnswered: (entries: ResultEntry[]) => void;
  onNext: () => void;
}
