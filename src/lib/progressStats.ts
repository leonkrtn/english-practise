import { VOCAB } from "./vocab";
import { activeGrammarRules } from "./grammarLearning";
import { levelFromXp, type BadgeSnapshot } from "./gamification";
import type { SessionRecord, TestRecord, WordState } from "./types";
import type { GrammarRuleState, GrammarSessionRecord } from "./grammarTypes";

export const DAY_MS = 86400000;

/** Consecutive calendar days (ending today or yesterday) with at least one completed session.
 * Yesterday still counts as the anchor so a streak isn't shown as broken before the day is over. */
export function computeStreak(dates: number[]): number {
  if (!dates.length) return 0;
  const days = new Set(dates.map((d) => Math.floor(d / DAY_MS)));
  const today = Math.floor(Date.now() / DAY_MS);
  let cursor = today;
  if (!days.has(cursor)) {
    if (days.has(cursor - 1)) cursor -= 1;
    else return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

/** Answer counts summed over every word/rule, used for the accuracy badges' minimum-sample gate. */
function totals(states: { timesCorrect: number; timesAlmost: number; timesIncorrect: number }[]) {
  let correct = 0;
  let all = 0;
  states.forEach((s) => {
    correct += s.timesCorrect;
    all += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
  });
  return { correct, all };
}

export interface BadgeSnapshotInput {
  words: Record<string, WordState>;
  blockedWordIds: ReadonlySet<string>;
  rules: Record<string, GrammarRuleState>;
  blockedRuleIds: ReadonlySet<string>;
  sessionHistory: SessionRecord[];
  grammarSessionHistory: GrammarSessionRecord[];
  testHistory: TestRecord[];
  xp: number;
  /** Longest correct-answer run in the session that just ended; 0 when evaluating outside one. */
  bestCombo?: number;
}

/** Collapses both stores into the flat shape every badge condition reads. Single place that knows
 * how a badge's raw numbers are derived, so adding a badge never means touching a store or screen. */
export function buildBadgeSnapshot(input: BadgeSnapshotInput): BadgeSnapshot {
  const wordStates = Object.entries(input.words)
    .filter(([id]) => !input.blockedWordIds.has(id))
    .map(([, w]) => w);
  const activeRules = activeGrammarRules(input.blockedRuleIds);
  const ruleStates = activeRules.map((r) => input.rules[r.id]).filter((s): s is GrammarRuleState => !!s);

  const vocabTotals = totals(wordStates);
  const grammarTotals = totals(ruleStates);
  const allAnswers = vocabTotals.all + grammarTotals.all;
  const allCorrect = vocabTotals.correct + grammarTotals.correct;

  const grades = input.testHistory.map((t) => t.grade);

  return {
    wordsLearned: wordStates.filter((w) => w.stage === 4).length,
    rulesLearned: ruleStates.filter((r) => r.stage === 4).length,
    rulesTotal: activeRules.length,
    streakDays: computeStreak([
      ...input.sessionHistory.map((s) => s.date),
      ...input.grammarSessionHistory.map((s) => s.date),
    ]),
    totalSessions: input.sessionHistory.length + input.grammarSessionHistory.length,
    overallAccuracy: allAnswers ? Math.round((allCorrect / allAnswers) * 100) : 0,
    totalAnswers: allAnswers,
    level: levelFromXp(input.xp),
    bestCombo: input.bestCombo ?? 0,
    bestTestGrade: grades.length ? Math.max(...grades) : null,
    testsCompleted: input.testHistory.length,
  };
}

/** Non-blocked vocabulary count — the denominator every "x / y words" readout uses. */
export function activeVocabTotal(blockedWordIds: ReadonlySet<string>): number {
  return VOCAB.length - blockedWordIds.size;
}
