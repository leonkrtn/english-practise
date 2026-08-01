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

/**
 * Collapses both stores into the flat shape every badge condition reads. Single place that knows
 * how a badge's raw numbers are derived, so adding a badge never means touching a store or screen.
 *
 * Written as single passes with plain accumulators rather than chained filter/map: this runs after
 * every single answer (see the badge memo in AppShell), and the intermediate arrays over ~2,300
 * words cost about a millisecond each time.
 */
export function buildBadgeSnapshot(input: BadgeSnapshotInput): BadgeSnapshot {
  let wordsLearned = 0;
  let correct = 0;
  let answers = 0;
  for (const id in input.words) {
    if (input.blockedWordIds.has(id)) continue;
    const w = input.words[id];
    if (w.stage === 4) wordsLearned++;
    correct += w.timesCorrect;
    answers += w.timesCorrect + w.timesAlmost + w.timesIncorrect;
  }

  const activeRules = activeGrammarRules(input.blockedRuleIds);
  let rulesLearned = 0;
  for (const rule of activeRules) {
    const r = input.rules[rule.id];
    if (!r) continue;
    if (r.stage === 4) rulesLearned++;
    correct += r.timesCorrect;
    answers += r.timesCorrect + r.timesAlmost + r.timesIncorrect;
  }

  const dates: number[] = [];
  for (const s of input.sessionHistory) dates.push(s.date);
  for (const s of input.grammarSessionHistory) dates.push(s.date);

  // A loop rather than Math.max(...grades): the spread would blow the call stack once the history
  // grows past the argument limit.
  let bestTestGrade: number | null = null;
  for (const t of input.testHistory) {
    if (bestTestGrade === null || t.grade > bestTestGrade) bestTestGrade = t.grade;
  }

  return {
    wordsLearned,
    rulesLearned,
    rulesTotal: activeRules.length,
    streakDays: computeStreak(dates),
    totalSessions: input.sessionHistory.length + input.grammarSessionHistory.length,
    overallAccuracy: answers ? Math.round((correct / answers) * 100) : 0,
    totalAnswers: answers,
    level: levelFromXp(input.xp),
    bestCombo: input.bestCombo ?? 0,
    bestTestGrade,
    testsCompleted: input.testHistory.length,
  };
}
