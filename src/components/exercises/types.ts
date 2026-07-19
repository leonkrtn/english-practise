import type { QueueItem } from "@/lib/sessionLogic";
import type { ResultEntry } from "@/lib/types";

export interface ExerciseProps {
  item: QueueItem;
  onAnswered: (entries: ResultEntry[]) => void;
  onNext: () => void;
}
