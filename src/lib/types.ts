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
  /** Total number of times the Hint button was clicked for this word, across every attempt ever. */
  hintsUsed: number;
  /** When this word first ever reached stage 4 — null for words mastered before this field
   * existed, or never mastered. Set once and never overwritten, so a word that's later demoted
   * and re-mastered doesn't get double-counted in a cumulative "words learned over time" chart. */
  masteredAt: number | null;
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
    hintsUsed: 0,
    masteredAt: null,
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

/** One completed graded test. Kept apart from SessionRecord because a test is scored on the
 * Portuguese 0-20 scale and deliberately leaves the learning stages untouched. */
export interface TestRecord {
  date: number;
  scope: "vocab" | "grammar" | "both";
  total: number;
  correct: number;
  accuracy: number;
  grade: number;
  durationSeconds: number;
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
