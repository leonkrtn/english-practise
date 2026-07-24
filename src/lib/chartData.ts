const DAY_MS = 86400000;

export interface CumulativePoint {
  day: number;
  label: string;
  count: number;
}

export interface AccuracyPoint {
  day: number;
  label: string;
  accuracy: number | null;
  total: number;
}

function dayLabel(day: number): string {
  return new Date(day * DAY_MS).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

/**
 * Builds a `days`-day cumulative "mastered over time" series ending today. Words/rules already at
 * stage 4 before mastered_at existed (masteredAt === null) count as a flat baseline at the start
 * of the window rather than being backfilled with a fake date — same "baseline snapshot" pattern
 * as the Goal feature, since there's no way to know exactly when those were actually mastered.
 */
export function buildCumulativeSeries(states: { stage: number; masteredAt: number | null }[], days: number): CumulativePoint[] {
  const today = Math.floor(Date.now() / DAY_MS);
  const start = today - (days - 1);

  let baseline = 0;
  const countByDay = new Map<number, number>();
  states.forEach((s) => {
    if (s.stage !== 4) return;
    if (s.masteredAt === null) {
      baseline++;
      return;
    }
    const d = Math.floor(s.masteredAt / DAY_MS);
    if (d < start) {
      baseline++;
      return;
    }
    countByDay.set(d, (countByDay.get(d) || 0) + 1);
  });

  const points: CumulativePoint[] = [];
  let running = baseline;
  for (let day = start; day <= today; day++) {
    running += countByDay.get(day) || 0;
    points.push({ day, label: dayLabel(day), count: running });
  }
  return points;
}

/** Builds a `days`-day daily-accuracy series ending today from session history. A day with no
 * sessions gets accuracy: null (rendered as an empty/gray bar) — distinct from a real 0%. */
export function buildAccuracySeries(sessionHistory: { date: number; correct: number; total: number }[], days: number): AccuracyPoint[] {
  const today = Math.floor(Date.now() / DAY_MS);
  const start = today - (days - 1);

  const byDay = new Map<number, { correct: number; total: number }>();
  sessionHistory.forEach((s) => {
    const d = Math.floor(s.date / DAY_MS);
    if (d < start || d > today) return;
    const acc = byDay.get(d) || { correct: 0, total: 0 };
    acc.correct += s.correct;
    acc.total += s.total;
    byDay.set(d, acc);
  });

  const points: AccuracyPoint[] = [];
  for (let day = start; day <= today; day++) {
    const v = byDay.get(day);
    points.push({
      day,
      label: dayLabel(day),
      accuracy: v && v.total ? Math.round((v.correct / v.total) * 100) : null,
      total: v?.total || 0,
    });
  }
  return points;
}
