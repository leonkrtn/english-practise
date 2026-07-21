// The 5-week basics goal: "all of Grammar" (finite, ~25 active rules) plus a
// 600-word vocabulary milestone. 600 core words is a deliberately achievable
// target rather than the full ~1,900-word catalog — general language-
// acquisition research holds that a few hundred core words cover most
// everyday conversation, which is what "English feels natural" actually
// requires at this stage.
export const GOAL_WEEKS = 5;
export const GOAL_DAYS = GOAL_WEEKS * 7;
export const GOAL_VOCAB_TARGET = 600;

const DAY_MS = 86400000;

export interface GoalStatus {
  startedAt: number;
  targetDate: number;
  daysElapsed: number;
  daysRemaining: number;
  isPastDue: boolean;
  vocabTarget: number;
  grammarTarget: number;
  combinedTarget: number;
  vocabCurrent: number;
  grammarCurrent: number;
  combinedCurrent: number;
  baselineTotal: number;
  progressPct: number;
  velocityPerDay: number;
  requiredVelocityPerDay: number;
  onTrack: boolean;
  /** Weeks from goal start to projected completion at the current pace, or null if pace is 0. */
  projectedWeeks: number | null;
}

export function computeGoalStatus(params: {
  startedAt: number;
  baselineTotal: number;
  vocabCurrent: number;
  grammarTotalActive: number;
  grammarCurrent: number;
  now?: number;
}): GoalStatus {
  const now = params.now ?? Date.now();
  const targetDate = params.startedAt + GOAL_DAYS * DAY_MS;
  const daysElapsed = Math.max(0, (now - params.startedAt) / DAY_MS);
  const daysRemaining = Math.max(0, (targetDate - now) / DAY_MS);
  const isPastDue = now > targetDate;

  const vocabTarget = GOAL_VOCAB_TARGET;
  const grammarTarget = params.grammarTotalActive;
  const combinedTarget = vocabTarget + grammarTarget;
  const combinedCurrent = params.vocabCurrent + params.grammarCurrent;

  const progressPct = combinedTarget > 0 ? Math.min(100, Math.round((combinedCurrent / combinedTarget) * 100)) : 0;

  const progressSinceStart = Math.max(0, combinedCurrent - params.baselineTotal);
  const velocityPerDay = daysElapsed >= 0.5 ? progressSinceStart / daysElapsed : 0;
  const remainingToTarget = Math.max(0, combinedTarget - combinedCurrent);
  const requiredVelocityPerDay = daysRemaining > 0.5 ? remainingToTarget / daysRemaining : remainingToTarget > 0 ? Infinity : 0;

  // Day one has no measurable pace yet, so it shouldn't read as "behind" before the learner
  // has had a real chance to practice.
  const onTrack = remainingToTarget === 0 || daysElapsed < 1 || velocityPerDay >= requiredVelocityPerDay * 0.9;

  const projectedWeeks = velocityPerDay > 0 ? remainingToTarget / velocityPerDay / 7 + daysElapsed / 7 : null;

  return {
    startedAt: params.startedAt,
    targetDate,
    daysElapsed,
    daysRemaining,
    isPastDue,
    vocabTarget,
    grammarTarget,
    combinedTarget,
    vocabCurrent: params.vocabCurrent,
    grammarCurrent: params.grammarCurrent,
    combinedCurrent,
    baselineTotal: params.baselineTotal,
    progressPct,
    velocityPerDay,
    requiredVelocityPerDay,
    onTrack,
    projectedWeeks,
  };
}
