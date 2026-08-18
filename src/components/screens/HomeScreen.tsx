"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  BookOpen,
  Blocks,
  ChevronUp,
  Flag,
  Flame,
  GraduationCap,
  Heart,
  Lightbulb,
  Link2,
  Newspaper,
  PenLine,
  Quote,
  Repeat,
  Target,
  Timer,
  TrendingDown,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useGrammarStore } from "@/lib/grammarStore";
import { VOCAB, VOCAB_BY_ID, countsTowardVocab, generalVocabTotal, inDomainScope, inGeneralVocab, inIdiomScope, type DomainScope } from "@/lib/vocab";
import { activeGrammarRules } from "@/lib/grammarLearning";
import { needsIntensification } from "@/lib/intensify";
import { computeGoalStatus } from "@/lib/goal";
import { computeStreak } from "@/lib/progressStats";
import { BAND_STYLES, bandForGrade, TEST_LENGTH_OPTIONS, TEST_SCOPE_OPTIONS, type TestLength, type TestScope } from "@/lib/testMode";
import type { SessionMode, LearningMode, LinkingSubMode, ReviewOptions, VocabScope } from "@/components/AppShell";
import type { SessionRecord } from "@/lib/types";
import type { GrammarSessionRecord } from "@/lib/grammarTypes";
import {
  ActivityStrip,
  ChipRow,
  LevelCard,
  MiniBar,
  ProgressRing,
  StatChip,
  StatRow,
  formatRelativeDate,
} from "@/components/home/shared";

const LINKING_FORMATS = ["linking", "linking-vocab", "linking-essay"];

const LINKING_SUB_MODES: { val: LinkingSubMode; label: string; icon: typeof Link2 }[] = [
  { val: "combine", label: "Combine sentences", icon: Link2 },
  { val: "learn", label: "Learn connectors", icon: BookMarked },
  { val: "essay", label: "Free writing", icon: PenLine },
];

const MODES: {
  val: SessionMode;
  label: string;
  icon: typeof BookOpen;
  grad: string;
  tint: string;
  glow: string;
  ring: [string, string];
}[] = [
  {
    val: "vocab",
    label: "Vocabulary",
    icon: BookOpen,
    grad: "from-blue to-blue-dark",
    tint: "bg-blue-light text-blue",
    glow: "shadow-[0_10px_24px_-8px_rgba(0,113,227,0.5)]",
    ring: ["#0071e3", "#0058b8"],
  },
  {
    val: "grammar",
    label: "Grammar",
    icon: Blocks,
    grad: "from-purple to-purple-dark",
    tint: "bg-purple-light text-purple",
    glow: "shadow-[0_10px_24px_-8px_rgba(139,92,246,0.5)]",
    ring: ["#8b5cf6", "#6d3fd4"],
  },
  {
    val: "idioms",
    label: "Idioms",
    icon: Quote,
    grad: "from-amber to-amber-dark",
    tint: "bg-amber-light text-amber",
    glow: "shadow-[0_10px_24px_-8px_rgba(232,161,46,0.5)]",
    ring: ["#e8a12e", "#c9860f"],
  },
  {
    val: "linking",
    label: "Linking",
    icon: Link2,
    grad: "from-green to-green-dark",
    tint: "bg-green-light text-green",
    glow: "shadow-[0_10px_24px_-8px_rgba(30,182,118,0.5)]",
    ring: ["#1eb676", "#0e9464"],
  },
  {
    val: "reading",
    label: "Reading",
    icon: Newspaper,
    grad: "from-red to-red-dark",
    tint: "bg-red-light text-red",
    glow: "shadow-[0_10px_24px_-8px_rgba(232,72,58,0.5)]",
    ring: ["#e8483a", "#c23325"],
  },
  {
    val: "test",
    label: "Test",
    icon: GraduationCap,
    grad: "from-ink to-ink/70",
    tint: "bg-line-soft text-ink",
    glow: "shadow-[0_10px_24px_-8px_rgba(15,23,42,0.55)]",
    ring: ["#1d1d1f", "#48484f"],
  },
];

/** The modes that run the adaptive stage engine — the only ones with a review pool, a
 * "Session-Inhalt" choice, or a learned/total progress ring. */
const LEARNING_MODES: SessionMode[] = ["vocab", "grammar", "idioms"];
const isLearningMode = (m: SessionMode): boolean => LEARNING_MODES.includes(m);

/**
 * Which engine a mode drives. "domain" and "idioms" are not tracks of their own — they are the
 * vocabulary engine pointed at one slice of the same word bank, so they report "vocab" here and
 * carry their scope separately (see VocabScope).
 */
const learningModeFor = (m: SessionMode): LearningMode | null =>
  m === "vocab" || m === "domain" || m === "idioms" ? "vocab" : m === "grammar" ? "grammar" : null;

/** The VocabScope to start an "idioms" session with — passed through the same channel Finance uses
 * for its own scope, since both are just the vocab engine pointed at a category slice. */
const scopeFor = (m: SessionMode, domainScope: DomainScope): VocabScope | undefined =>
  m === "domain" ? domainScope : m === "idioms" ? "idiom" : undefined;

const SESSION_CONTENT_OPTIONS: { val: boolean; label: string; hint: string }[] = [
  { val: true, label: "New + review", hint: "New material mixed with reviews that have come due" },
  { val: false, label: "New only", hint: "Only material you have not learned yet" },
];

const REVIEW_ACCURACY_OPTIONS: { val: number | null; label: string }[] = [
  { val: null, label: "All" },
  { val: 80, label: "Under 80%" },
  { val: 60, label: "Under 60%" },
];

const REVIEW_LIMIT_OPTIONS: { val: number | null; label: string }[] = [
  { val: null, label: "All" },
  { val: 20, label: "20" },
  { val: 10, label: "10" },
];



export default function HomeScreen({
  mode,
  onModeChange,
  linkingSubMode,
  onLinkingSubModeChange,
  domainScope,
  onStartLearning,
  onStartLinking,
  onStartReading,
  onStartTest,
  onReview,
  onSpeedRound,
  onGoal,
}: {
  mode: SessionMode;
  onModeChange: (mode: SessionMode) => void;
  linkingSubMode: LinkingSubMode;
  onLinkingSubModeChange: (mode: LinkingSubMode) => void;
  domainScope: DomainScope;
  onStartLearning: (mode: LearningMode, includeReview: boolean, domainScope?: VocabScope) => void;
  onStartLinking: (subMode: LinkingSubMode) => void;
  onStartReading: () => void;
  onStartTest: (scope: TestScope, length: TestLength) => void;
  onReview: (mode: LearningMode, options?: ReviewOptions, domainScope?: VocabScope) => void;
  onSpeedRound: () => void;
  onGoal: () => void;
}) {
  const store = useStore();
  const grammarStore = useGrammarStore();
  const [includeReview, setIncludeReview] = useState(true);
  // Exactly one dropdown may be open at a time — they share the same slot above the sticky footer,
  // so tracking which one is open (rather than a boolean per menu) makes overlap impossible.
  const [openMenu, setOpenMenu] = useState<"review" | "start" | null>(null);
  const [reviewMaxAccuracy, setReviewMaxAccuracy] = useState<number | null>(null);
  const [reviewLimit, setReviewLimit] = useState<number | null>(null);
  const [testScope, setTestScope] = useState<TestScope>("both");
  const [testLength, setTestLength] = useState<TestLength>(25);

  // Math terms are Finance-mode-only (see countsTowardVocab) — excluded here so the Vocabulary
  // tab's total/progress isn't inflated by words that can never come up in that session.
  const activeVocabTotal = useMemo(() => generalVocabTotal(store.blockedWordIds), [store.blockedWordIds]);

  const vocabStats = useMemo(() => {
    const words = Object.entries(store.words)
      .filter(([id]) => countsTowardVocab(id, store.blockedWordIds))
      .map(([, w]) => w);
    const learned = words.filter((w) => w.stage === 4).length;
    let totalCorrect = 0;
    let totalAll = 0;
    words.forEach((w) => {
      totalCorrect += w.timesCorrect;
      totalAll += w.timesCorrect + w.timesAlmost + w.timesIncorrect;
    });
    const accuracy = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { learned, total: activeVocabTotal, sessions: store.totalPracticeSessions || 0, accuracy };
  }, [store.words, store.blockedWordIds, activeVocabTotal, store.totalPracticeSessions]);

  /** The finance/math slice, scored the same way as vocabStats but over the selected scope only. */
  const domainStats = useMemo(() => {
    const inScope = inDomainScope(domainScope);
    const pool = VOCAB.filter((w) => inScope(w) && !store.blockedWordIds.has(w.id));
    let learned = 0;
    let totalCorrect = 0;
    let totalAll = 0;
    pool.forEach((word) => {
      const s = store.words[word.id];
      if (!s) return;
      if (s.stage === 4) learned++;
      totalCorrect += s.timesCorrect;
      totalAll += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    const accuracy = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { learned, total: pool.length, sessions: store.totalPracticeSessions || 0, accuracy };
  }, [domainScope, store.words, store.blockedWordIds, store.totalPracticeSessions]);

  /** The idiom slice, scored the same way as domainStats — its own category, no scope selector. */
  const idiomsStats = useMemo(() => {
    const pool = VOCAB.filter((w) => inIdiomScope(w) && !store.blockedWordIds.has(w.id));
    let learned = 0;
    let totalCorrect = 0;
    let totalAll = 0;
    pool.forEach((word) => {
      const s = store.words[word.id];
      if (!s) return;
      if (s.stage === 4) learned++;
      totalCorrect += s.timesCorrect;
      totalAll += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    const accuracy = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { learned, total: pool.length, sessions: store.totalPracticeSessions || 0, accuracy };
  }, [store.words, store.blockedWordIds, store.totalPracticeSessions]);

  const activeRules = useMemo(() => activeGrammarRules(grammarStore.blockedRuleIds), [grammarStore.blockedRuleIds]);

  const grammarStats = useMemo(() => {
    const rules = activeRules.map((r) => grammarStore.rules[r.id]).filter((s): s is NonNullable<typeof s> => !!s);
    const learned = rules.filter((r) => r.stage === 4).length;
    let totalCorrect = 0;
    let totalAll = 0;
    rules.forEach((r) => {
      totalCorrect += r.timesCorrect;
      totalAll += r.timesCorrect + r.timesAlmost + r.timesIncorrect;
    });
    const accuracy = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { learned, total: activeRules.length, sessions: grammarStore.totalPracticeSessions || 0, accuracy };
  }, [activeRules, grammarStore.rules, grammarStore.totalPracticeSessions]);

  const goalStatus = useMemo(() => {
    if (store.goalStartedAt === null || store.goalBaselineTotal === null) return null;
    return computeGoalStatus({
      startedAt: store.goalStartedAt,
      baselineTotal: store.goalBaselineTotal,
      vocabCurrent: vocabStats.learned,
      grammarTotalActive: activeRules.length,
      grammarCurrent: grammarStats.learned,
    });
  }, [store.goalStartedAt, store.goalBaselineTotal, vocabStats.learned, grammarStats.learned, activeRules.length]);

  const wordTypeBreakdown = useMemo(() => {
    const verbsTotal = VOCAB.filter((w) => w.type === "verb" && !store.blockedWordIds.has(w.id)).length;
    const adjTotal = VOCAB.filter((w) => w.type === "adjective" && !store.blockedWordIds.has(w.id)).length;
    let verbsLearned = 0;
    let adjLearned = 0;
    let favorites = 0;
    let difficult = 0;
    let intensify = 0;
    Object.entries(store.words).forEach(([id, w]) => {
      if (store.blockedWordIds.has(id)) return;
      const word = VOCAB_BY_ID[id];
      if (!word || !inGeneralVocab(word)) return;
      if (w.stage === 4) {
        if (word.type === "verb") verbsLearned++;
        else if (word.type === "adjective") adjLearned++;
      }
      if (w.favorite) favorites++;
      if (w.timesSeen > 0 && w.score <= 2.5) difficult++;
      if (needsIntensification(w)) intensify++;
    });
    return { verbsTotal, adjTotal, verbsLearned, adjLearned, favorites, difficult, intensify };
  }, [store.words, store.blockedWordIds]);

  const grammarCategoryBreakdown = useMemo(() => {
    const byCategory: Record<string, { learned: number; total: number }> = {};
    activeRules.forEach((r) => {
      if (!byCategory[r.category]) byCategory[r.category] = { learned: 0, total: 0 };
      byCategory[r.category].total++;
      if (grammarStore.rules[r.id]?.stage === 4) byCategory[r.category].learned++;
    });
    return Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
  }, [activeRules, grammarStore.rules]);

  // A practice streak reflects overall commitment, not the currently selected mode —
  // it's computed from both domains' session history so it doesn't flip when switching tabs.
  const allDates = useMemo(
    () => [...store.sessionHistory.map((s) => s.date), ...grammarStore.sessionHistory.map((s) => s.date)],
    [store.sessionHistory, grammarStore.sessionHistory]
  );
  const streak = useMemo(() => computeStreak(allDates), [allDates]);

  const recentSessions = useMemo(() => {
    type Row = { domain: "vocab" | "grammar" } & (SessionRecord | GrammarSessionRecord);
    const rows: Row[] = [
      ...store.sessionHistory.map((s) => ({ domain: "vocab" as const, ...s })),
      ...grammarStore.sessionHistory.map((s) => ({ domain: "grammar" as const, ...s })),
    ];
    return rows.sort((a, b) => b.date - a.date).slice(0, 6);
  }, [store.sessionHistory, grammarStore.sessionHistory]);

  const stats = mode === "grammar" ? grammarStats : mode === "domain" ? domainStats : mode === "idioms" ? idiomsStats : vocabStats;

  const linkingSessionsCount = useMemo(
    () => grammarStore.sessionHistory.filter((s) => LINKING_FORMATS.includes(s.format)).length,
    [grammarStore.sessionHistory]
  );
  const linkingAccuracy = useMemo(() => {
    let correct = 0;
    let total = 0;
    LINKING_FORMATS.forEach((f) => {
      const s = grammarStore.formatStats[f];
      if (!s) return;
      correct += s.correct;
      total += s.correct + s.almost + s.incorrect;
    });
    return total ? Math.round((correct / total) * 100) : 0;
  }, [grammarStore.formatStats]);

  const readingSessionsCount = useMemo(
    () => grammarStore.sessionHistory.filter((s) => s.format === "reading").length,
    [grammarStore.sessionHistory]
  );
  const readingAccuracy = useMemo(() => {
    const s = grammarStore.formatStats["reading"];
    if (!s) return 0;
    const total = s.correct + s.almost + s.incorrect;
    return total ? Math.round((s.correct / total) * 100) : 0;
  }, [grammarStore.formatStats]);

  const testStats = useMemo(() => {
    const history = store.testHistory;
    if (history.length === 0) return { count: 0, best: null as number | null, average: null as number | null, last: null as number | null };
    const grades = history.map((t) => t.grade);
    return {
      count: history.length,
      best: Math.max(...grades),
      average: Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10,
      last: history[history.length - 1].grade,
    };
  }, [store.testHistory]);

  // How many of the currently mastered words/rules pass the accuracy filter picked in the review
  // dropdown — recomputed live as the filter changes so the dropdown always shows an accurate count.
  const reviewMatchCount = useMemo(() => {
    const belowThreshold = (score: number) => reviewMaxAccuracy === null || score * 20 < reviewMaxAccuracy;
    let count = 0;
    if (mode === "vocab" || mode === "domain" || mode === "idioms") {
      Object.entries(store.words).forEach(([id, w]) => {
        if (w.stage !== 4 || !belowThreshold(w.score)) return;
        if (mode === "domain") {
          const word = VOCAB_BY_ID[id];
          if (store.blockedWordIds.has(id) || !word || !inDomainScope(domainScope)(word)) return;
        } else if (mode === "idioms") {
          const word = VOCAB_BY_ID[id];
          if (store.blockedWordIds.has(id) || !word || !inIdiomScope(word)) return;
        } else if (!countsTowardVocab(id, store.blockedWordIds)) return;
        count++;
      });
    }
    if (mode === "grammar") {
      activeRules.forEach((r) => {
        const s = grammarStore.rules[r.id];
        if (s && s.stage === 4 && belowThreshold(s.score)) count++;
      });
    }
    return count;
  }, [mode, domainScope, store.words, store.blockedWordIds, activeRules, grammarStore.rules, reviewMaxAccuracy]);

  const active = MODES.find((m) => m.val === mode)!;
  const progressPct = stats.total ? Math.round((stats.learned / stats.total) * 100) : 0;
  const showReviewButton = isLearningMode(mode) && stats.learned > 0;
  // Only the modes with something to configure get the split "Start ▾" affordance; the rest keep a
  // plain full-width button rather than a chevron that opens an empty panel.
  const hasStartOptions = isLearningMode(mode) || mode === "test";

  function start() {
    setOpenMenu(null);
    if (mode === "test") onStartTest(testScope, testLength);
    else if (mode === "linking") onStartLinking(linkingSubMode);
    else if (mode === "reading") onStartReading();
    else {
      const engine = learningModeFor(mode);
      if (engine) onStartLearning(engine, includeReview, scopeFor(mode, domainScope));
    }
  }

  function startReview() {
    const engine = learningModeFor(mode);
    if (!engine) return;
    setOpenMenu(null);
    onReview(engine, { maxAccuracy: reviewMaxAccuracy, limit: reviewLimit }, scopeFor(mode, domainScope));
  }

  // Home's own no-mouse shortcuts: number keys pick a mode tile (same left-to-right order as MODES),
  // R opens the review-filter dropdown, C the start-options dropdown, Q the speed round, and Enter
  // either starts a session or — while a dropdown is open — confirms it instead. Each shortcut
  // mirrors its control's own disabled state, so it can never do something the click couldn't.
  const latestKeyHandler = useRef<((e: KeyboardEvent) => void) | null>(null);
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Escape closes an open dropdown. Handled here rather than in AppShell's global Escape path,
      // which deliberately does nothing on Home — but a panel covering the screen with a
      // click-catching backdrop still has to be dismissible from the keyboard.
      if (e.key === "Escape") {
        if (openMenu === null) return;
        e.preventDefault();
        setOpenMenu(null);
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= MODES.length) {
        e.preventDefault();
        onModeChange(MODES[num - 1].val);
        setOpenMenu(null);
        return;
      }
      switch (e.key.toLowerCase()) {
        case "r":
          if (!showReviewButton) return;
          e.preventDefault();
          setOpenMenu((m) => (m === "review" ? null : "review"));
          return;
        case "c":
          if (!hasStartOptions) return;
          e.preventDefault();
          setOpenMenu((m) => (m === "start" ? null : "start"));
          return;
        case "q":
          if (mode !== "vocab" || vocabStats.learned === 0) return;
          e.preventDefault();
          onSpeedRound();
          return;
      }
      if (e.key === "Enter") {
        // A focused button already reacts to its own Enter (e.g. tabbing to one of the dropdown's
        // filter chips) — only treat Enter as the page-level shortcut when nothing more specific
        // owns it.
        const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
        if (activeTag === "BUTTON" || activeTag === "A") return;
        if (openMenu === "review") {
          if (reviewMatchCount === 0 || !isLearningMode(mode)) return;
          e.preventDefault();
          startReview();
          return;
        }
        e.preventDefault();
        start();
      }
    }
    latestKeyHandler.current = handleKeyDown;
  });

  // The handler above reads a dozen pieces of state plus callbacks that AppShell recreates on every
  // render, so declaring them as dependencies would re-subscribe the window listener constantly —
  // which is what the missing dependency array used to do on *every* render. Registering once and
  // forwarding to whatever the latest render produced keeps the behaviour and drops the churn.
  useEffect(() => {
    const listener = (e: KeyboardEvent) => latestKeyHandler.current?.(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <section className="flex flex-col pb-1">
      {goalStatus && (
        <button
          onClick={onGoal}
          className="w-full flex items-center gap-3.5 rounded-2xl px-4 py-3.5 mt-1 mb-5 text-left bg-gradient-to-r from-ink to-ink/85 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
        >
          <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/15">
            <Flag size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold">5-week goal: {goalStatus.progressPct}%</div>
            <div className="text-[11.5px] text-white/70">
              {goalStatus.isPastDue
                ? "Goal period has ended"
                : `${Math.ceil(goalStatus.daysRemaining)} ${Math.ceil(goalStatus.daysRemaining) === 1 ? "day" : "days"} left · ${
                    goalStatus.onTrack ? "on track" : "behind"
                  }`}
            </div>
          </div>
          <div className="w-16 h-1.5 rounded-full bg-white/20 overflow-hidden shrink-0">
            <div className="h-full rounded-full bg-white" style={{ width: goalStatus.progressPct + "%" }} />
          </div>
        </button>
      )}

      <div className="lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-6 lg:items-start">
        <div>
          {/* Four per row on a phone (seven labels across ~360px would clip), all seven once there's room. */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5 mt-1">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.val;
              return (
                <button
                  key={m.val}
                  onClick={() => {
                    onModeChange(m.val);
                    setOpenMenu(null);
                  }}
                  className={
                    "flex flex-col items-center gap-1.5 rounded-2xl px-1.5 py-3.5 text-center transition-all duration-200 " +
                    (isActive
                      ? `bg-gradient-to-br ${m.grad} text-white ${m.glow} scale-[1.02]`
                      : "bg-card border border-line-soft text-ink-soft hover:border-line hover:-translate-y-0.5 hover:shadow-md")
                  }
                >
                  <span className={"w-8 h-8 rounded-full flex items-center justify-center transition-colors " + (isActive ? "bg-white/20" : m.tint)}>
                    <Icon size={16} />
                  </span>
                  <span className="text-[11.5px] font-semibold">{m.label}</span>
                </button>
              );
            })}
          </div>

          {mode === "linking" && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {LINKING_SUB_MODES.map((sm) => {
                const Icon = sm.icon;
                const isActive = linkingSubMode === sm.val;
                return (
                  <button
                    key={sm.val}
                    onClick={() => onLinkingSubModeChange(sm.val)}
                    className={
                      "flex flex-col items-center gap-1 rounded-xl px-1.5 py-2.5 text-center transition-all " +
                      (isActive
                        ? "bg-green-light border-[1.5px] border-green text-[#0d7a4f]"
                        : "bg-card border-[1.5px] border-line-soft text-ink-soft hover:border-line")
                    }
                  >
                    <Icon size={15} />
                    <span className="text-[11px] font-semibold leading-tight">{sm.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {mode === "linking" ? (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <span className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-green-light text-green">
                <Link2 size={22} />
              </span>
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                <StatRow icon={<Repeat size={14} />} value={linkingSessionsCount} label="Sessions" tint="bg-blue-light text-blue" />
                <StatRow icon={<Target size={14} />} value={`${linkingAccuracy}%`} label="Accuracy" tint="bg-amber-light text-amber" />
                <StatRow icon={<Flame size={14} />} value={streak} label="day streak" tint="bg-red-light text-red" />
              </div>
            </div>
          ) : mode === "reading" ? (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <span className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-red-light text-red">
                <Newspaper size={22} />
              </span>
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                <StatRow icon={<Repeat size={14} />} value={readingSessionsCount} label="Texts read" tint="bg-blue-light text-blue" />
                <StatRow icon={<Target size={14} />} value={`${readingAccuracy}%`} label="Accuracy" tint="bg-amber-light text-amber" />
                <StatRow icon={<Flame size={14} />} value={streak} label="day streak" tint="bg-red-light text-red" />
              </div>
            </div>
          ) : mode === "test" ? (
            <TestOverviewCard stats={testStats} streak={streak} scope={testScope} length={testLength} />
          ) : (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <ProgressRing pct={progressPct} from={active.ring[0]} to={active.ring[1]}>
                <span className="text-[19px] font-bold tracking-tight leading-none">{stats.learned}</span>
                <span className="text-[10px] text-ink-faint mt-0.5">/ {stats.total}</span>
              </ProgressRing>
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                <StatRow icon={<Repeat size={14} />} value={stats.sessions} label="Sessions" tint="bg-blue-light text-blue" />
                <StatRow icon={<Target size={14} />} value={`${stats.accuracy}%`} label="Accuracy" tint="bg-amber-light text-amber" />
                <StatRow icon={<Flame size={14} />} value={streak} label="day streak" tint="bg-red-light text-red" />
              </div>
            </div>
          )}

          {mode === "vocab" && (
            <div className="flex flex-col gap-2.5 mt-3">
              <MiniBar label="Verbs" learned={wordTypeBreakdown.verbsLearned} total={wordTypeBreakdown.verbsTotal} grad="from-blue to-blue-dark" />
              <MiniBar label="Adjectives" learned={wordTypeBreakdown.adjLearned} total={wordTypeBreakdown.adjTotal} grad="from-purple to-purple-dark" />
              <div className="grid grid-cols-3 gap-2.5">
                <StatChip icon={<Heart size={14} />} value={wordTypeBreakdown.favorites} label="Favourites" tint="bg-red-light text-red" />
                <StatChip icon={<TrendingDown size={14} />} value={wordTypeBreakdown.difficult} label="Difficult" tint="bg-amber-light text-amber" />
                <StatChip icon={<Lightbulb size={14} />} value={wordTypeBreakdown.intensify} label="Needs practice" tint="bg-amber-light text-amber" />
              </div>
            </div>
          )}

          {mode === "grammar" && grammarCategoryBreakdown.length > 0 && (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm mt-3">
              <div className="text-[13px] font-semibold text-ink mb-3">By category</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {grammarCategoryBreakdown.map(([category, c]) => (
                  <div key={category} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="text-ink-soft truncate">{category}</span>
                    <span className="text-ink-faint font-semibold tabular-nums shrink-0">
                      {c.learned}/{c.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-3 lg:mt-0">
          <LevelCard xp={store.xp} badgesEarned={store.badgeIds.size} />
          <ActivityStrip dates={allDates} />

          {recentSessions.length > 0 && (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm">
              <div className="text-[13px] font-semibold text-ink mb-1">Recent sessions</div>
              <div className="flex flex-col">
                {recentSessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={"w-2 h-2 rounded-full shrink-0 " + sessionDotClass(s.format, s.domain)} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink">{sessionLabel(s.format, s.domain)}</div>
                        <div className="text-[11px] text-ink-faint">{formatRelativeDate(s.date)}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{s.accuracy}%</div>
                      <div className="text-[11px] text-ink-faint tabular-nums">
                        {s.correct}/{s.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 pt-4 pb-2 -mx-5 px-5 bg-gradient-to-t from-bg from-65% to-transparent flex flex-col gap-2 lg:flex-row lg:gap-3">
        {showReviewButton && (
          <div className="relative w-full lg:flex-1">
            {openMenu === "review" && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                <div className="absolute bottom-full mb-2 left-0 right-0 z-20 bg-card border border-line-soft rounded-2xl p-3.5 shadow-[0_-10px_30px_-10px_rgba(15,23,42,0.25)] animate-fade-in">
                  <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Mastery below</div>
                  <ChipRow options={REVIEW_ACCURACY_OPTIONS} value={reviewMaxAccuracy} onChange={setReviewMaxAccuracy} />
                  <div className="text-[12px] font-semibold text-ink-soft mb-1.5 mt-3">How many?</div>
                  <ChipRow options={REVIEW_LIMIT_OPTIONS} value={reviewLimit} onChange={setReviewLimit} />
                  <Button
                    onClick={startReview}
                    disabled={reviewMatchCount === 0}
                    className="mt-3.5 h-auto w-full rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-none disabled:opacity-40 disabled:pointer-events-none text-white font-semibold py-2.5 text-[13.5px] transition-all active:scale-[0.97]"
                  >
                    Wiederholung starten ({reviewMatchCount})
                  </Button>
                </div>
              </>
            )}
            <Button
              onClick={() => setOpenMenu((m) => (m === "review" ? null : "review"))}
              variant="outline"
              className="h-auto w-full rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft hover:-translate-y-0.5 text-ink font-semibold py-3 text-[14px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              Review learned ({stats.learned})
              <ChevronUp size={14} className={"transition-transform " + (openMenu === "review" ? "rotate-180" : "")} />
            </Button>
          </div>
        )}

        {mode === "vocab" && vocabStats.learned > 0 && (
          <Button
            onClick={onSpeedRound}
            variant="outline"
            className="h-auto w-full lg:flex-1 rounded-full border-[1.5px] border-line bg-card hover:bg-line-soft hover:-translate-y-0.5 text-ink font-semibold py-3 text-[14px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <Timer size={15} /> Speed round (60s)
          </Button>
        )}

        {/* Split primary button: the wide half starts straight away, the chevron half opens the
            options panel. Same dropdown pattern as "Review learned" — moved off the page
            body so the settings are one click away without permanently occupying a card. */}
        <div className="relative w-full lg:flex-1">
          {openMenu === "start" && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
              <div className="absolute bottom-full mb-2 left-0 right-0 z-20 bg-card border border-line-soft rounded-2xl p-3.5 shadow-[0_-10px_30px_-10px_rgba(15,23,42,0.25)] animate-fade-in">
                {mode === "test" ? (
                  <>
                    <div className="text-[12px] font-semibold text-ink-soft mb-1.5">What is tested?</div>
                    <ChipRow options={TEST_SCOPE_OPTIONS} value={testScope} onChange={setTestScope} />
                    <div className="text-[12px] font-semibold text-ink-soft mb-1.5 mt-3">How many questions?</div>
                    <ChipRow
                      options={TEST_LENGTH_OPTIONS.map((l) => ({ val: l, label: String(l) }))}
                      value={testLength}
                      onChange={setTestLength}
                    />
                    <p className="text-[11.5px] text-ink-faint leading-relaxed mt-3">
                      No feedback during the test. The grade does not affect your learning progress.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Session-Inhalt</div>
                    <div className="flex flex-col gap-1.5">
                      {SESSION_CONTENT_OPTIONS.map((o) => (
                        <button
                          key={String(o.val)}
                          onClick={() => setIncludeReview(o.val)}
                          className={
                            "text-left rounded-xl border px-3 py-2 transition-colors " +
                            (includeReview === o.val ? "bg-ink text-white border-ink" : "border-line bg-bg text-ink-soft hover:bg-line-soft")
                          }
                        >
                          <div className="text-[13px] font-semibold">{o.label}</div>
                          <div className={"text-[11.5px] " + (includeReview === o.val ? "text-white/70" : "text-ink-faint")}>{o.hint}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          <div className={"flex w-full rounded-full overflow-hidden shadow-[0_14px_30px_-10px_rgba(15,23,42,0.4)] bg-gradient-to-r " + active.grad}>
            <Button
              onClick={start}
              variant="ghost"
              className="h-auto flex-1 rounded-none text-white font-semibold py-4 text-[16px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 hover:bg-transparent hover:text-white"
            >
              {mode === "test" ? `Start test (${testLength})` : "Start session"}
            </Button>
            {hasStartOptions && (
              <Button
                onClick={() => setOpenMenu((m) => (m === "start" ? null : "start"))}
                variant="ghost"
                aria-label={mode === "test" ? "Test options" : "Choose session content"}
                title={mode === "test" ? "Test-Optionen (C)" : "Session-Inhalt (C)"}
                className="h-auto rounded-none px-4 text-white border-l border-white/25 transition-all hover:brightness-110 hover:bg-transparent hover:text-white active:scale-[0.97] flex items-center"
              >
                <ChevronUp size={16} className={"transition-transform " + (openMenu === "start" ? "rotate-180" : "")} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Shared chip picker used by every dropdown here, so the review filters, the test scope and the
 * test length all look and behave identically. */

function TestOverviewCard({
  stats,
  streak,
  scope,
  length,
}: {
  stats: { count: number; best: number | null; average: number | null; last: number | null };
  streak: number;
  scope: TestScope;
  length: TestLength;
}) {
  const bestBand = stats.best !== null ? bandForGrade(stats.best) : null;
  const scopeLabel = TEST_SCOPE_OPTIONS.find((o) => o.val === scope)!.label;
  return (
    <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <span
          className={
            "w-14 h-14 rounded-full flex items-center justify-center shrink-0 " +
            (bestBand ? BAND_STYLES[bestBand.band].tint + " " + BAND_STYLES[bestBand.band].text : "bg-line-soft text-ink-soft")
          }
        >
          {stats.best !== null ? (
            <span className="text-[19px] font-extrabold tabular-nums tracking-tight">{stats.best.toFixed(0)}</span>
          ) : (
            <GraduationCap size={22} />
          )}
        </span>
        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
          <StatRow icon={<Repeat size={14} />} value={stats.count} label={stats.count === 1 ? "Test" : "Tests"} tint="bg-blue-light text-blue" />
          <StatRow
            icon={<Trophy size={14} />}
            value={stats.best !== null ? `${stats.best.toFixed(1)} / 20` : "—"}
            label="Beste Note"
            tint="bg-amber-light text-amber"
          />
          <StatRow
            icon={<Target size={14} />}
            value={stats.average !== null ? stats.average.toFixed(1) : "—"}
            label={stats.last !== null ? `avg · last ${stats.last.toFixed(1)}` : "Average"}
            tint="bg-green-light text-green"
          />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between gap-3 text-[12px]">
        <span className="text-ink-faint">
          Next test: <b className="text-ink-soft font-semibold">{scopeLabel}</b> · {length} questions
        </span>
        <span className="flex items-center gap-1 text-ink-faint shrink-0">
          <Flame size={12} className="text-red" /> {streak}
        </span>
      </div>
    </div>
  );
}

/** Level, XP to the next one, and badges collected — the running reward summary, sitting in the
 * same column as the activity strip so Home always opens on visible evidence of progress. */

function sessionDotClass(format: string, domain: "vocab" | "grammar"): string {
  if (LINKING_FORMATS.includes(format)) return "bg-green";
  if (format === "reading" || format === "speed") return "bg-red";
  if (format === "writing") return "bg-amber";
  return domain === "vocab" ? "bg-blue" : "bg-purple";
}

function sessionLabel(format: string, domain: "vocab" | "grammar"): string {
  switch (format) {
    case "linking":
      return "Linking";
    case "linking-vocab":
      return "Connectors";
    case "linking-essay":
      return "Linking essay";
    case "reading":
      return "Reading";
    case "speed":
      return "Speed round";
    case "quick":
    case "mixed":
      return "Quick drill";
    // Historic records only — the Writing mode itself was folded into Linking's free-writing task.
    case "writing":
      return "Writing";
    default:
      return domain === "vocab" ? "Vocabulary" : "Grammar";
  }
}





