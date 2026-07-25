import type { AnswerResultKind } from "./types";

/* ------------------------------------------------------------------ XP ---- */

/** Base XP per answer, before the combo multiplier. A wrong answer still pays a token amount:
 * the point of XP here is to reward showing up and working through a session, so a bad run should
 * slow progress down rather than stop it — the accuracy stats are where mistakes actually matter. */
const BASE_XP: Record<AnswerResultKind, number> = {
  correct: 10,
  almost: 4,
  incorrect: 1,
};

/** One-off bonuses on top of per-answer XP. Mastering an item is the single most valuable thing
 * that can happen in a session, so it's worth several correct answers on its own. */
export const XP_ITEM_MASTERED = 40;
export const XP_SESSION_COMPLETE = 25;

/** Combo tiers — a run of consecutive correct answers multiplies everything you earn while it
 * lasts. Exported because the session header renders the very same tiers as its combo badge, so
 * the number on screen and the XP actually awarded can never drift apart. */
export const COMBO_TIERS: { min: number; multiplier: number; label: string; grad: string }[] = [
  { min: 12, multiplier: 2, label: "Unstoppable", grad: "from-purple to-red" },
  { min: 8, multiplier: 1.75, label: "On fire", grad: "from-red to-amber-dark" },
  { min: 5, multiplier: 1.5, label: "Heiß", grad: "from-amber to-red" },
  { min: 3, multiplier: 1.25, label: "Combo", grad: "from-blue to-purple" },
];

export function comboTier(combo: number) {
  return COMBO_TIERS.find((t) => combo >= t.min) || null;
}

export function comboMultiplier(combo: number): number {
  return comboTier(combo)?.multiplier ?? 1;
}

/** XP for a single answer. `combo` is the run length *before* this answer, so the multiplier a
 * learner can see on screen when they answer is the one they actually get paid at. */
export function xpForAnswer(result: AnswerResultKind, combo: number): number {
  const multiplier = result === "correct" ? comboMultiplier(combo) : 1;
  return Math.round(BASE_XP[result] * multiplier);
}

/** A graded test pays out by result rather than per answer — you can't farm it by grinding
 * questions, since the question count is fixed by the chosen length. */
export function xpForTest(grade: number, totalQuestions: number): number {
  const passBonus = grade >= 10 ? 50 : 0;
  return Math.round(totalQuestions * 4 + grade * 8 + passBonus);
}

/* --------------------------------------------------------------- Levels ---- */

/**
 * Total XP needed to *reach* a level: 30·n·(n−1), i.e. 0 / 60 / 180 / 360 / 600 … Each level costs
 * 60 XP more than the one before, so early levels arrive within a single session (fast, visible
 * feedback for a new account) while later ones stay meaningful without ever becoming unreachable.
 */
export function xpForLevel(level: number): number {
  return 30 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  // Inverse of xpForLevel, solved for n: n = (1 + √(1 + 4·xp/30)) / 2.
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * Math.max(0, xp)) / 30)) / 2));
}

/** Deliberately finance-flavoured, matching what this vocabulary is actually being learned for. */
const LEVEL_TITLES = [
  "Rookie",
  "Intern",
  "Trainee",
  "Junior Analyst",
  "Analyst",
  "Senior Analyst",
  "Associate",
  "Senior Associate",
  "Vice President",
  "Senior VP",
  "Director",
  "Principal",
  "Partner",
  "Managing Director",
];

export function levelTitle(level: number): string {
  if (level <= LEVEL_TITLES.length) return LEVEL_TITLES[level - 1];
  // Past the last title, keep promoting within it rather than inventing new job names.
  return `${LEVEL_TITLES[LEVEL_TITLES.length - 1]} ${level - LEVEL_TITLES.length + 1}`;
}

export interface LevelProgress {
  level: number;
  title: string;
  /** XP earned since reaching the current level. */
  intoLevel: number;
  /** XP the current level spans in total (intoLevel + remaining). */
  levelSpan: number;
  remaining: number;
  pct: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const levelSpan = ceiling - floor;
  const intoLevel = Math.max(0, xp - floor);
  return {
    level,
    title: levelTitle(level),
    intoLevel,
    levelSpan,
    remaining: Math.max(0, ceiling - xp),
    pct: levelSpan > 0 ? Math.min(100, Math.round((intoLevel / levelSpan) * 100)) : 0,
  };
}

/* --------------------------------------------------------------- Badges ---- */

export type BadgeGroup = "streak" | "vocab" | "grammar" | "precision" | "test" | "level";

/** Everything a badge condition is allowed to look at. Assembled once per evaluation so that
 * adding a badge never means touching the stores — only this snapshot and the list below. */
export interface BadgeSnapshot {
  wordsLearned: number;
  rulesLearned: number;
  rulesTotal: number;
  streakDays: number;
  totalSessions: number;
  /** Overall accuracy across every answer ever, 0-100. */
  overallAccuracy: number;
  totalAnswers: number;
  level: number;
  /** Longest run of consecutive correct answers in the session that just ended (0 outside one). */
  bestCombo: number;
  bestTestGrade: number | null;
  testsCompleted: number;
}

export interface Badge {
  id: string;
  group: BadgeGroup;
  title: string;
  description: string;
  /** Lucide icon name, resolved by the rendering component. */
  icon: string;
  earned: (s: BadgeSnapshot) => boolean;
  /** Progress towards the badge as [current, target] — drives the "3/7" hint on locked badges.
   * Omitted for badges that aren't a simple count. */
  progress?: (s: BadgeSnapshot) => [number, number];
}

export const BADGES: Badge[] = [
  // --- Streak -------------------------------------------------------------
  {
    id: "streak-3",
    group: "streak",
    title: "Dranbleiber",
    description: "3 Tage in Folge geübt",
    icon: "Flame",
    earned: (s) => s.streakDays >= 3,
    progress: (s) => [s.streakDays, 3],
  },
  {
    id: "streak-7",
    group: "streak",
    title: "Wochenserie",
    description: "7 Tage in Folge geübt",
    icon: "Flame",
    earned: (s) => s.streakDays >= 7,
    progress: (s) => [s.streakDays, 7],
  },
  {
    id: "streak-14",
    group: "streak",
    title: "Zwei Wochen durch",
    description: "14 Tage in Folge geübt",
    icon: "Flame",
    earned: (s) => s.streakDays >= 14,
    progress: (s) => [s.streakDays, 14],
  },
  {
    id: "streak-30",
    group: "streak",
    title: "Monatsdisziplin",
    description: "30 Tage in Folge geübt",
    icon: "Flame",
    earned: (s) => s.streakDays >= 30,
    progress: (s) => [s.streakDays, 30],
  },
  // --- Vocabulary ---------------------------------------------------------
  {
    id: "words-10",
    group: "vocab",
    title: "Erste zehn",
    description: "10 Wörter gelernt",
    icon: "BookOpen",
    earned: (s) => s.wordsLearned >= 10,
    progress: (s) => [s.wordsLearned, 10],
  },
  {
    id: "words-50",
    group: "vocab",
    title: "Wortschatz wächst",
    description: "50 Wörter gelernt",
    icon: "BookOpen",
    earned: (s) => s.wordsLearned >= 50,
    progress: (s) => [s.wordsLearned, 50],
  },
  {
    id: "words-100",
    group: "vocab",
    title: "Hundert im Kopf",
    description: "100 Wörter gelernt",
    icon: "BookOpen",
    earned: (s) => s.wordsLearned >= 100,
    progress: (s) => [s.wordsLearned, 100],
  },
  {
    id: "words-250",
    group: "vocab",
    title: "Vokabel-Profi",
    description: "250 Wörter gelernt",
    icon: "BookOpen",
    earned: (s) => s.wordsLearned >= 250,
    progress: (s) => [s.wordsLearned, 250],
  },
  // --- Grammar ------------------------------------------------------------
  {
    id: "rules-5",
    group: "grammar",
    title: "Regelkenner",
    description: "5 Grammatikregeln gelernt",
    icon: "Blocks",
    earned: (s) => s.rulesLearned >= 5,
    progress: (s) => [s.rulesLearned, 5],
  },
  {
    id: "rules-15",
    group: "grammar",
    title: "Grammatik sitzt",
    description: "15 Grammatikregeln gelernt",
    icon: "Blocks",
    earned: (s) => s.rulesLearned >= 15,
    progress: (s) => [s.rulesLearned, 15],
  },
  {
    id: "rules-all",
    group: "grammar",
    title: "Alle Regeln",
    description: "Jede Grammatikregel gelernt",
    icon: "Blocks",
    earned: (s) => s.rulesTotal > 0 && s.rulesLearned >= s.rulesTotal,
    progress: (s) => [s.rulesLearned, s.rulesTotal],
  },
  // --- Precision ----------------------------------------------------------
  {
    id: "sessions-10",
    group: "precision",
    title: "Warmgelaufen",
    description: "10 Sessions abgeschlossen",
    icon: "Repeat",
    earned: (s) => s.totalSessions >= 10,
    progress: (s) => [s.totalSessions, 10],
  },
  {
    id: "sessions-50",
    group: "precision",
    title: "Stammgast",
    description: "50 Sessions abgeschlossen",
    icon: "Repeat",
    earned: (s) => s.totalSessions >= 50,
    progress: (s) => [s.totalSessions, 50],
  },
  {
    id: "combo-10",
    group: "precision",
    title: "Combo 10",
    description: "10 richtige Antworten in Folge",
    icon: "Zap",
    earned: (s) => s.bestCombo >= 10,
  },
  {
    id: "combo-25",
    group: "precision",
    title: "Combo 25",
    description: "25 richtige Antworten in Folge",
    icon: "Zap",
    earned: (s) => s.bestCombo >= 25,
  },
  {
    id: "accuracy-80",
    group: "precision",
    title: "Treffsicher",
    description: "80% Gesamtgenauigkeit (ab 100 Antworten)",
    icon: "Target",
    earned: (s) => s.totalAnswers >= 100 && s.overallAccuracy >= 80,
  },
  {
    id: "accuracy-90",
    group: "precision",
    title: "Präzision",
    description: "90% Gesamtgenauigkeit (ab 250 Antworten)",
    icon: "Target",
    earned: (s) => s.totalAnswers >= 250 && s.overallAccuracy >= 90,
  },
  // --- Tests --------------------------------------------------------------
  {
    id: "test-first",
    group: "test",
    title: "Erste Prüfung",
    description: "Einen Test abgeschlossen",
    icon: "GraduationCap",
    earned: (s) => s.testsCompleted >= 1,
  },
  {
    id: "test-pass",
    group: "test",
    title: "Aprovado",
    description: "Einen Test bestanden (Note 10+)",
    icon: "GraduationCap",
    earned: (s) => s.bestTestGrade !== null && s.bestTestGrade >= 10,
  },
  {
    id: "test-bom",
    group: "test",
    title: "Bom",
    description: "Note 14 oder besser",
    icon: "Award",
    earned: (s) => s.bestTestGrade !== null && s.bestTestGrade >= 14,
  },
  {
    id: "test-muito-bom",
    group: "test",
    title: "Muito Bom",
    description: "Note 16 oder besser",
    icon: "Award",
    earned: (s) => s.bestTestGrade !== null && s.bestTestGrade >= 16,
  },
  {
    id: "test-excelente",
    group: "test",
    title: "Excelente",
    description: "Note 18 oder besser",
    icon: "Trophy",
    earned: (s) => s.bestTestGrade !== null && s.bestTestGrade >= 18,
  },
  // --- Level --------------------------------------------------------------
  {
    id: "level-5",
    group: "level",
    title: "Analyst",
    description: "Level 5 erreicht",
    icon: "TrendingUp",
    earned: (s) => s.level >= 5,
    progress: (s) => [s.level, 5],
  },
  {
    id: "level-10",
    group: "level",
    title: "Senior VP",
    description: "Level 10 erreicht",
    icon: "TrendingUp",
    earned: (s) => s.level >= 10,
    progress: (s) => [s.level, 10],
  },
  {
    id: "level-14",
    group: "level",
    title: "Managing Director",
    description: "Level 14 erreicht",
    icon: "Crown",
    earned: (s) => s.level >= 14,
    progress: (s) => [s.level, 14],
  },
];

export const BADGES_BY_ID: Record<string, Badge> = {};
BADGES.forEach((b) => (BADGES_BY_ID[b.id] = b));

export const BADGE_GROUP_LABELS: Record<BadgeGroup, string> = {
  streak: "Serie",
  vocab: "Vokabeln",
  grammar: "Grammatik",
  precision: "Präzision",
  test: "Tests",
  level: "Level",
};

/** Ids the snapshot qualifies for that aren't unlocked yet — i.e. exactly what to celebrate now.
 * A badge is never revoked once stored, so a later dip below the threshold (a broken streak, a
 * demoted word) can't take it away again. */
export function newlyEarnedBadges(snapshot: BadgeSnapshot, unlocked: ReadonlySet<string>): Badge[] {
  return BADGES.filter((b) => !unlocked.has(b.id) && b.earned(snapshot));
}
