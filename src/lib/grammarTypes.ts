import type { AnswerResultKind, LearningStage } from "./types";

export interface GrammarRuleState {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  timesAlmost: number;
  lastSeen: number | null;
  recentMistake: boolean;
  streak: number;
  score: number;
  /** When this rule first ever reached stage 4 — same semantics as WordState.masteredAt. */
  masteredAt: number | null;
}

export function blankGrammarRuleState(): GrammarRuleState {
  return {
    stage: 0,
    reviewStreak: 0,
    dueAtSession: null,
    timesSeen: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
    timesAlmost: 0,
    lastSeen: null,
    recentMistake: false,
    streak: 0,
    score: 0,
    masteredAt: null,
  };
}

export interface GrammarResultEntry {
  ruleId: string;
  format: string;
  result: AnswerResultKind;
  errorType: string | null;
  hintsUsed: number;
}

export interface GrammarSessionRecord {
  date: number;
  total: number;
  correct: number;
  almost: number;
  incorrect: number;
  accuracy: number;
  format: string;
}

export interface GrammarFormatStat {
  correct: number;
  almost: number;
  incorrect: number;
}
