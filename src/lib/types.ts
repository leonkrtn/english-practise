/** 0 new · 1 learned (needs quiz) · 2 quizzed (needs contextual use) · 3 applied (needs free production) · 4 produced (mastered-active, long-term review) */
export type LearningStage = 0 | 1 | 2 | 3 | 4;

export interface WordState {
  score: number;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  timesAlmost: number;
  favorite: boolean;
  spellingErrors: number;
  confusions: number;
  lastSeen: number | null;
  recentMistake: boolean;
  streak: number;
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
}

export function blankWordState(): WordState {
  return {
    score: 0,
    timesSeen: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
    timesAlmost: 0,
    favorite: false,
    spellingErrors: 0,
    confusions: 0,
    lastSeen: null,
    recentMistake: false,
    streak: 0,
    stage: 0,
    reviewStreak: 0,
    dueAtSession: null,
  };
}

export interface FormatStat {
  correct: number;
  almost: number;
  incorrect: number;
}

export interface SessionRecord {
  date: number;
  total: number;
  correct: number;
  almost: number;
  incorrect: number;
  accuracy: number;
  format: string;
}

export type Direction = "en-de" | "de-en" | "mixed";
export type ExerciseFormat =
  | "mixed"
  | "learn"
  | "translate"
  | "gap"
  | "mc"
  | "sentence"
  | "match"
  | "build"
  | "multigap"
  | "confusable";
export type SelectionMode = "all" | "new" | "difficult" | "mistakes" | "favorites";

export type AnswerResultKind = "correct" | "almost" | "incorrect";

export interface ResultEntry {
  wordId: string;
  format: string;
  result: AnswerResultKind;
  errorType: string | null;
  hintsUsed: number;
}
