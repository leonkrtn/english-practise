"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import { useAuth } from "@/lib/auth";
import {
  VOCAB,
  VOCAB_BY_ID,
  VOCAB_BY_EN,
  allowsSentenceExercises,
  countsTowardVocab,
  inDomainScope,
  inGeneralVocab,
  inIdiomScope,
  type DomainScope,
  type Word,
} from "@/lib/vocab";
import { GRAMMAR_RULES } from "@/lib/grammar-data";
import { WRITING_TOPICS, type WritingTopic } from "@/lib/writingTopics";
import { CLAUSE_PAIRS, type ClausePair } from "@/lib/connectors-data";
import { READING_TEXTS, eligibleGapIds as computeEligibleGapIds, type ReadingText } from "@/lib/financeReading";
import {
  buildLearningBatch,
  buildInitialQueue,
  nextAfterAnswer,
  insertionIndex,
  toQueueItem,
  directionForKind,
  popMatchGroups,
  flushMatchPool,
  pickReviewFormat as pickVocabReviewFormat,
  maxAttemptsPerWord,
  vocabKey,
  type LearningQueueItem,
} from "@/lib/learning";
import {
  buildGrammarBatch,
  buildGrammarQueue,
  grammarNextAfterAnswer,
  grammarInsertionIndex,
  pickReviewFormat,
  maxAttemptsPerRule,
  grammarKey,
  type GrammarQueueItem,
} from "@/lib/grammarLearning";
import { rememberFormat, type FormatMemory } from "@/lib/learningEngine";
import { tuningFor } from "@/lib/learningProfile";
import { sample, shuffle } from "@/lib/utils";
import { toggleMuted } from "@/lib/sound";
import { xpForAnswer, xpForTest, XP_ITEM_MASTERED, XP_SESSION_COMPLETE } from "@/lib/gamification";
import { MIN_CATEGORIES as LINKING_ESSAY_MIN_CATEGORIES } from "@/lib/linkingEssay";
import { useBadgeTracking } from "@/lib/useBadgeTracking";
import { buildTest, gradeTest, scoreAnswer, type TestAnswer, type TestQuestion, type TestScope, type TestLength } from "@/lib/testMode";
import type { AnswerResultKind, QueueItem, ResultEntry } from "@/lib/types";
import type { GrammarResultEntry } from "@/lib/grammarTypes";
import ExerciseRouter from "@/components/exercises/ExerciseRouter";
import GrammarExerciseRouter from "@/components/grammar-exercises/GrammarExerciseRouter";
import TopBar from "./TopBar";
import Modal from "./Modal";
import ShortcutsHelp from "./ShortcutsHelp";
import HomeScreen from "./screens/HomeScreen";
import SessionScreen from "./screens/SessionScreen";
import SummaryScreen, { type SummaryStats } from "./screens/SummaryScreen";
import type { ReadingCheckResult } from "./screens/ReadingScreen";
import type { ConnectorLearnResult } from "./screens/ConnectorLearnScreen";
import type { LinkingEssayResult } from "./screens/LinkingEssayScreen";
import type { LinkingResult } from "./exercises/LinkingExercise";
import type { TestResult } from "./screens/TestResultScreen";

/**
 * Everything outside the core practice loop is loaded on demand. Home, the session screen and the
 * exercise routers stay static because they are what the app opens into; the rest — above all the
 * statistics screen, which drags in the whole charting layer — only cost their bytes once the
 * learner actually navigates there. The type imports above are erased at compile time, so they do
 * not pull these modules back into the initial chunk.
 */
const ScreenFallback = () => <div className="flex-1" aria-busy="true" />;
// ssr:false is what actually keeps these out of the initial payload — with server rendering left
// on, their chunks are still emitted as scripts on the prerendered page even though nothing
// renders them. The app sits behind a login and never renders a screen server-side anyway.
const lazyScreen = <P,>(load: () => Promise<{ default: React.ComponentType<P> }>) =>
  dynamic(load, { loading: ScreenFallback, ssr: false });

const WordListScreen = lazyScreen(() => import("./screens/WordListScreen"));
const WordDetailScreen = lazyScreen(() => import("./screens/WordDetailScreen"));
const StatsScreen = lazyScreen(() => import("./screens/StatsScreen"));
const SettingsScreen = lazyScreen(() => import("./screens/SettingsScreen"));
const GoalScreen = lazyScreen(() => import("./screens/GoalScreen"));
const ReadingScreen = lazyScreen(() => import("./screens/ReadingScreen"));
const ConnectorLearnScreen = lazyScreen(() => import("./screens/ConnectorLearnScreen"));
const LinkingEssayScreen = lazyScreen(() => import("./screens/LinkingEssayScreen"));
const LinkingExercise = lazyScreen(() => import("./exercises/LinkingExercise"));
const TestScreen = lazyScreen(() => import("./screens/TestScreen"));
const TestResultScreen = lazyScreen(() => import("./screens/TestResultScreen"));

export type Screen =
  | "home"
  | "session"
  | "summary"
  | "list"
  | "stats"
  | "detail"
  | "settings"
  | "linking"
  | "linking-learn"
  | "linking-essay"
  | "goal"
  | "reading"
  | "test"
  | "test-result";
export type SessionMode = "vocab" | "grammar" | "domain" | "idioms" | "linking" | "reading" | "test";
/** The two modes that run through the adaptive stage engine — everything else is its own flow. */
export type LearningMode = "vocab" | "grammar";
export type LinkingSubMode = "combine" | "learn" | "essay";
/** Which slice of the vocabulary a "vocab" learning session draws from: a Finance-mode scope, the
 * Idioms mode's own category, or (when omitted) the general Vocabulary pool. */
export type VocabScope = DomainScope | "idiom";
/** Options for the "Gelerntes wiederholen" dropdown on Home: restrict the review pool to items
 * below a score-based mastery percentage (null = no restriction) and/or cap how many are drawn
 * (null = everyone that matches). */
export type ReviewOptions = { maxAccuracy: number | null; limit: number | null };
/** Snapshot of whichever preset-driven start the learner most recently launched from Home, so it
 * can be replayed verbatim by the "Weiter" action on the summary/test-result screens. */
type LastStartConfig =
  | { kind: "learning"; mode: LearningMode; includeReview: boolean; domainScope?: VocabScope }
  | { kind: "review"; mode: LearningMode; options?: ReviewOptions; domainScope?: VocabScope }
  | { kind: "speed" }
  | { kind: "test"; scope: TestScope; length: TestLength };

type UnifiedItem = { domain: "vocab"; item: LearningQueueItem } | { domain: "grammar"; item: GrammarQueueItem };

/** Legacy single-pass session, still used for "practice this word" / "repeat mistakes" quick drills. */
interface QuickSessionState {
  queue: QueueItem[];
  index: number;
  results: ResultEntry[];
}

/** Sentence-combining drill: a queue of clause pairs, each checked independently (connector used?
 * + LanguageTool) rather than progressing through the stage engine. */
interface LinkingSessionState {
  queue: ClausePair[];
  index: number;
  results: LinkingResult[];
}

/** Finance reading drill: one multi-gap text, with the subset of its gaps that are actually
 * interactive this session (finance terms always; general-vocab gaps only once mastered). */
interface ReadingSessionState {
  text: ReadingText;
  eligibleGapIds: Set<string>;
}

/** A graded exam in progress. Answers are keyed by question id (not index) so the learner can jump
 * around the paper and revise earlier answers without anything shifting underneath them. */
interface TestSessionState {
  scope: TestScope;
  questions: TestQuestion[];
  answers: Record<string, TestAnswer>;
  index: number;
  startedAt: number;
}

const LINKING_BATCH_SIZE = 6;

/** Primary session mode: an adaptive queue that grows as vocab words / grammar rules move through their stage. Ids in attempts/finishedItemIds/masteredItemIds/totalItemIds are prefixed "v:"/"g:" to keep the two domains apart. */
interface LearningSessionState {
  queue: UnifiedItem[];
  index: number;
  vocabResults: ResultEntry[];
  grammarResults: GrammarResultEntry[];
  attempts: Record<string, number>;
  totalItemIds: string[];
  finishedItemIds: Set<string>;
  masteredItemIds: Set<string>;
  /** Word Matching pool — vocab only, grammar has no matching round. */
  matchPool: Word[];
  /** Which exercise formats each item has already been shown as this session, so a follow-up task
   * asks a different kind of question instead of repeating the one just answered. */
  formatMemory: FormatMemory;
  /** Set only for a Speed Round: the timestamp the session auto-finishes at. */
  speedEndsAt: number | null;
  /** Current run of consecutive correct answers, and the longest such run this session. */
  combo: number;
  bestCombo: number;
  /** XP banked so far. Committed to the store in one write when the session ends. */
  xpEarned: number;
  /** The last award, re-keyed per answer so the floating "+N XP" in the header replays. */
  lastXp: { amount: number; key: number } | null;
}

const SPEED_ROUND_MS = 60000;

/** A ref that always holds the latest value — lets a long-lived interval/timeout callback read
 * current state without the effect that scheduled it having to re-run on every change. */
function useRefLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

const SIMPLE_FORMATS: QueueItem["format"][] = ["translate", "gap", "mc"];
const NOOP = () => {};

export default function AppShell() {
  const store = useStore();
  const grammarStore = useGrammarStore();
  // The learner's chosen pace (Ruhig/Standard/Intensiv) — account state from app_meta, not a
  // client-only default, so every engine call below reads the same tuning the account was
  // actually loaded with instead of silently falling back to something else.
  const tuning = useMemo(() => tuningFor(store.learningProfile), [store.learningProfile]);
  const { signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailWordId, setDetailWordId] = useState<string | null>(null);
  // Lifted out of HomeScreen so the selected tab survives leaving and returning to Home (e.g.
  // after finishing a session) instead of always resetting back to Vocabulary.
  const [homeMode, setHomeMode] = useState<SessionMode>("vocab");
  const [homeLinkingSubMode, setHomeLinkingSubMode] = useState<LinkingSubMode>("combine");
  const [homeDomainScope, setHomeDomainScope] = useState<DomainScope>("both");
  const [quickSession, setQuickSession] = useState<QuickSessionState | null>(null);
  const [learningSession, setLearningSession] = useState<LearningSessionState | null>(null);
  const [linkingSession, setLinkingSession] = useState<LinkingSessionState | null>(null);
  const [readingSession, setReadingSession] = useState<ReadingSessionState | null>(null);
  const [testSession, setTestSession] = useState<TestSessionState | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [linkingEssayTopic, setLinkingEssayTopic] = useState<WritingTopic | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  // The preset a preset-driven session was launched with, so the "Weiter" button on the summary/
  // test-result screens can start the next run identically without sending the learner back
  // through Home to re-pick everything. Quick drills (repeat mistakes / practice one word) aren't
  // preset-driven, so they clear this rather than leave a stale preset behind.
  const [lastStart, setLastStart] = useState<LastStartConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Word id awaiting confirmation of "exclude this word forever". Excluding is irreversible from
  // the session UI, so it is confirmed — but through the app's own dialog rather than the native
  // window.confirm, which blocks the main thread and looks foreign inside the installed PWA.
  const [blockPrompt, setBlockPrompt] = useState<string | null>(null);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  // Starts the 5-week basics goal's clock exactly once, snapshotting current combined progress
  // as the baseline so pace can be computed as (current - baseline) / days elapsed. Runs once per
  // account — startGoalIfNeeded itself no-ops if goal_started_at is already set.
  useEffect(() => {
    if (store.goalStartedAt !== null) return;
    // Must use the same set the goal's *current* figure is read from (HomeScreen's vocabStats),
    // or the baseline sits above the current count and the pace reads as zero progress.
    const vocabLearned = Object.entries(store.words).filter(
      ([id, w]) => w.stage === 4 && countsTowardVocab(id, store.blockedWordIds)
    ).length;
    const grammarLearned = GRAMMAR_RULES.filter(
      (r) => !grammarStore.blockedRuleIds.has(r.id) && grammarStore.ruleState(r.id).stage === 4
    ).length;
    store.startGoalIfNeeded(vocabLearned + grammarLearned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.goalStartedAt]);

  const { newBadges, beginRun, setLastBestCombo } = useBadgeTracking();

  // ---------- Primary flow: the adaptive learning-stage engine (vocab or grammar) ----------

  const startLearningSession = useCallback(
    (mode: LearningMode, includeReview: boolean = true, domainScope?: VocabScope) => {
      beginRun();
      let vocabQueue: LearningQueueItem[] = [];
      let matchPool: Word[] = [];
      let grammarQueueItems: GrammarQueueItem[] = [];
      let formatMemory: FormatMemory = {};

      if (mode === "vocab") {
        // The Finance and Idioms modes are the vocabulary engine pointed at one slice of the word
        // bank rather than a track of their own — same stages, same review schedule, same stats.
        const batch = buildLearningBatch(
          store.wordState,
          store.totalPracticeSessions,
          store.blockedWordIds,
          includeReview,
          tuning,
          domainScope === "idiom" ? inIdiomScope : domainScope ? inDomainScope(domainScope) : inGeneralVocab
        );
        const built = buildInitialQueue(batch, store.wordState);
        vocabQueue = built.queue;
        matchPool = built.matchPool;
        formatMemory = built.formatMemory;
      } else {
        const gBatch = buildGrammarBatch(grammarStore.ruleState, grammarStore.totalPracticeSessions, grammarStore.blockedRuleIds, includeReview, tuning);
        const built = buildGrammarQueue(gBatch, grammarStore.ruleState);
        grammarQueueItems = built.queue;
        formatMemory = built.formatMemory;
      }

      // Deliberately *not* reshuffled: each builder already orders its own queue so that two tasks
      // for the same item never land next to each other, and a shuffle here would undo that.
      let queue: UnifiedItem[] = [
        ...vocabQueue.map((item) => ({ domain: "vocab" as const, item })),
        ...grammarQueueItems.map((item) => ({ domain: "grammar" as const, item })),
      ];
      // Guarantee at least one playable item even if a vocab-only batch was a handful of
      // already-in-progress words that didn't fill a match group on their own.
      if (queue.length === 0 && matchPool.length > 0) {
        queue = flushMatchPool(matchPool).map((item) => ({ domain: "vocab" as const, item }));
        matchPool = [];
      }

      const totalItemIds = [
        ...new Set(
          queue
            .flatMap((u) => (u.domain === "vocab" ? u.item.words.map((w) => "v:" + w.id) : ["g:" + u.item.rule.id]))
            .concat(matchPool.map((w) => "v:" + w.id))
        ),
      ];
      setLearningSession({
        queue,
        index: 0,
        vocabResults: [],
        grammarResults: [],
        attempts: {},
        totalItemIds,
        finishedItemIds: new Set(),
        masteredItemIds: new Set(),
        matchPool,
        formatMemory,
        speedEndsAt: null,
        combo: 0,
        bestCombo: 0,
        xpEarned: 0,
        lastXp: null,
      });
      setScreen("session");
    },
    [beginRun, store.wordState, store.totalPracticeSessions, store.blockedWordIds, grammarStore.ruleState, grammarStore.totalPracticeSessions, grammarStore.blockedRuleIds, tuning]
  );

  // Drills exclusively every word/rule that has already reached stage 4 ("gelernt"), using the
  // same "review" kind + stage engine as the normal long-term review — a correct answer extends
  // the interval, a wrong one demotes the item back into active learning. Reuses the exact same
  // growing/interleaved session machinery as startLearningSession, just seeded differently: every
  // already-mastered item at once instead of an adaptive ~10-word batch.
  const startReviewSession = useCallback(
    (mode: LearningMode, options?: ReviewOptions, domainScope?: VocabScope) => {
      beginRun();
      const maxAccuracy = options?.maxAccuracy ?? null;
      const belowThreshold = (score: number) => maxAccuracy === null || score * 20 < maxAccuracy;
      const inScope = domainScope === "idiom" ? inIdiomScope : domainScope ? inDomainScope(domainScope) : inGeneralVocab;

      const vocabQueue: LearningQueueItem[] =
        mode === "vocab"
          ? VOCAB.filter(
              (w) => inScope(w) && !store.blockedWordIds.has(w.id) && store.wordState(w.id).stage === 4 && belowThreshold(store.wordState(w.id).score)
            ).map((w) => {
              const fmt = pickVocabReviewFormat();
              return { kind: "review" as const, words: [w], direction: directionForKind("review", fmt), reviewFormat: fmt };
            })
          : [];
      const grammarQueueItems: GrammarQueueItem[] =
        mode === "grammar"
          ? GRAMMAR_RULES.filter(
              (r) => !grammarStore.blockedRuleIds.has(r.id) && grammarStore.ruleState(r.id).stage === 4 && belowThreshold(grammarStore.ruleState(r.id).score)
            ).map((rule) => ({ kind: "review" as const, rule, reviewFormat: pickReviewFormat() }))
          : [];

      let queue: UnifiedItem[] = shuffle([
        ...vocabQueue.map((item) => ({ domain: "vocab" as const, item })),
        ...grammarQueueItems.map((item) => ({ domain: "grammar" as const, item })),
      ]);
      if (options?.limit !== null && options?.limit !== undefined) queue = queue.slice(0, options.limit);
      if (queue.length === 0) return;

      // Seed the memory with the format each item opens on, so an item that gets demoted and asked
      // again later in this session comes back as a different kind of question.
      let formatMemory: FormatMemory = {};
      queue.forEach((u) => {
        if (u.domain === "vocab") {
          formatMemory = rememberFormat(formatMemory, vocabKey(u.item.words[0].id), u.item.reviewFormat || "translate");
        } else {
          formatMemory = rememberFormat(formatMemory, grammarKey(u.item.rule.id), u.item.reviewFormat || "g-error");
        }
      });

      const totalItemIds = [...new Set(queue.map((u) => (u.domain === "vocab" ? "v:" + u.item.words[0].id : "g:" + u.item.rule.id)))];
      setLearningSession({
        queue,
        index: 0,
        vocabResults: [],
        grammarResults: [],
        attempts: {},
        totalItemIds,
        finishedItemIds: new Set(),
        masteredItemIds: new Set(),
        matchPool: [],
        formatMemory,
        speedEndsAt: null,
        combo: 0,
        bestCombo: 0,
        xpEarned: 0,
        lastXp: null,
      });
      setScreen("session");
    },
    [beginRun, store, grammarStore]
  );

  // Timed, vocabulary-only drill built on the same mastered-word pool + "review" exercise kind as
  // startReviewSession — a Speed Round is really just review under a 60-second clock, so it reuses
  // that machinery instead of a parallel session type. Auto-finishes via the effect below when
  // speedEndsAt passes; an early exit through the "End session?" modal works exactly like review too.
  const startSpeedRound = useCallback(() => {
    beginRun();
    const vocabQueue: LearningQueueItem[] = VOCAB.filter(
      (w) => inGeneralVocab(w) && !store.blockedWordIds.has(w.id) && store.wordState(w.id).stage === 4
    ).map((w) => ({
      kind: "review" as const,
      words: [w],
      direction: directionForKind("review"),
    }));
    const queue: UnifiedItem[] = shuffle(vocabQueue.map((item) => ({ domain: "vocab" as const, item })));
    if (queue.length === 0) return;

    const totalItemIds = [...new Set(queue.map((u) => "v:" + (u.domain === "vocab" ? u.item.words[0].id : "")))];
    setLearningSession({
      queue,
      index: 0,
      vocabResults: [],
      grammarResults: [],
      attempts: {},
      totalItemIds,
      finishedItemIds: new Set(),
      masteredItemIds: new Set(),
      matchPool: [],
      formatMemory: {},
      speedEndsAt: Date.now() + SPEED_ROUND_MS,
      combo: 0,
      bestCombo: 0,
      xpEarned: 0,
      lastXp: null,
    });
    setScreen("session");
  }, [beginRun, store]);

  // ---------- Test: a graded exam on the Portuguese 0-20 scale ----------

  const startTest = useCallback(
    (scope: TestScope, length: TestLength) => {
      beginRun();
      const questions = buildTest(scope, length, store.wordState, store.blockedWordIds, grammarStore.ruleState, grammarStore.blockedRuleIds);
      if (questions.length === 0) return;
      setTestSession({ scope, questions, answers: {}, index: 0, startedAt: Date.now() });
      setTestResult(null);
      setScreen("test");
    },
    [beginRun, store.wordState, store.blockedWordIds, grammarStore.ruleState, grammarStore.blockedRuleIds]
  );

  /** Re-runs whichever preset-driven session was launched last, with the exact same settings. */
  const replayLastStart = useCallback(() => {
    if (!lastStart) return;
    if (lastStart.kind === "learning") startLearningSession(lastStart.mode, lastStart.includeReview, lastStart.domainScope);
    else if (lastStart.kind === "review") startReviewSession(lastStart.mode, lastStart.options, lastStart.domainScope);
    else if (lastStart.kind === "speed") startSpeedRound();
    else if (lastStart.kind === "test") startTest(lastStart.scope, lastStart.length);
  }, [lastStart, startLearningSession, startReviewSession, startSpeedRound, startTest]);

  // Marks the paper and files the result. Deliberately does NOT call updateWord/setLearningStage:
  // a test measures where the learner stands, and letting it move stages would mean the act of
  // measuring changes what's being measured (and would hand out mastery for lucky guesses).
  const finishTest = useCallback(
    (session: TestSessionState) => {
      const points = session.questions.reduce((sum, q) => sum + scoreAnswer(q, session.answers[q.id]), 0);
      const grade = gradeTest(points, session.questions.length);
      const durationSeconds = Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));
      const xpEarned = xpForTest(grade.grade, session.questions.length);

      store.recordTest({
        date: Date.now(),
        scope: session.scope,
        total: grade.total,
        // Whole questions answered fully correctly — the halves that "almost" answers earn live in
        // the grade itself, and a "correct" count with a .5 in it would only read as a bug.
        correct: session.questions.filter((q) => scoreAnswer(q, session.answers[q.id]) === 1).length,
        accuracy: grade.accuracy,
        grade: grade.grade,
        durationSeconds,
      });
      store.addXp(xpEarned);

      setTestResult({
        grade,
        questions: session.questions,
        answers: session.answers,
        durationSeconds,
        xpEarned,
        // Filled in by the badge effect above once the recorded test has landed in the store; the
        // result screen re-renders with them, so a badge earned by this very test still shows up.
        newBadges: [],
      });
      setTestSession(null);
      setScreen("test-result");
    },
    [store]
  );

  const answerTestQuestion = useCallback((questionId: string, answer: TestAnswer) => {
    setTestSession((prev) => (prev ? { ...prev, answers: { ...prev.answers, [questionId]: answer } } : prev));
  }, []);

  const navigateTest = useCallback((index: number) => {
    setTestSession((prev) => (prev && index >= 0 && index < prev.questions.length ? { ...prev, index } : prev));
  }, []);

  // ---------- Reading: multi-gap finance texts, mixing finance vocabulary with mastered words ----------

  const startReadingSession = useCallback(() => {
    const text = sample(READING_TEXTS, 1)[0];
    const isVocabLearned = (en: string) => {
      const word = VOCAB_BY_EN[en.toLowerCase()];
      return !!word && !store.blockedWordIds.has(word.id) && store.wordState(word.id).stage === 4;
    };
    const eligible = computeEligibleGapIds(text, isVocabLearned);
    setReadingSession({ text, eligibleGapIds: eligible });
    setScreen("reading");
  }, [store]);

  const finishReading = useCallback(
    (result: ReadingCheckResult) => {
      const correct = result.correctCount;
      const total = result.totalCount || 1;
      const incorrect = total - correct;
      const accuracy = Math.round((correct / total) * 100);
      for (let i = 0; i < correct; i++) grammarStore.recordFormatStat("reading", "correct");
      for (let i = 0; i < incorrect; i++) grammarStore.recordFormatStat("reading", "incorrect");
      grammarStore.recordSession({ date: Date.now(), total, correct, almost: 0, incorrect, accuracy, format: "reading" });
      store.addXp(correct * 10 + XP_SESSION_COMPLETE);
      setReadingSession(null);
      setScreen("home");
    },
    [grammarStore, store]
  );

  // ---------- Linking: sentence-combining drill (clause pair + connector + LanguageTool check) ----------

  const startLinkingSession = useCallback(() => {
    const byCategory = new Map<string, ClausePair[]>();
    CLAUSE_PAIRS.forEach((p) => {
      if (!byCategory.has(p.categoryId)) byCategory.set(p.categoryId, []);
      byCategory.get(p.categoryId)!.push(p);
    });
    const categoryIds = shuffle([...byCategory.keys()]).slice(0, LINKING_BATCH_SIZE);
    const queue = shuffle(categoryIds.map((cid) => sample(byCategory.get(cid)!, 1)[0]));
    setLinkingSession({ queue, index: 0, results: [] });
    setScreen("linking");
  }, []);

  const finishLinking = useCallback(
    (s: LinkingSessionState) => {
      const correct = s.results.filter((r) => r.result === "correct").length;
      const almost = s.results.filter((r) => r.result === "almost").length;
      const incorrect = s.results.filter((r) => r.result === "incorrect").length;
      const total = s.results.length || 1;
      const accuracy = Math.round((correct / total) * 100);
      grammarStore.recordSession({ date: Date.now(), total, correct, almost, incorrect, accuracy, format: "linking" });
      store.addXp(correct * 10 + almost * 4 + XP_SESSION_COMPLETE);
      setLinkingSession(null);
      setScreen("home");
    },
    [grammarStore, store]
  );

  const onLinkingAnswered = useCallback(
    (r: LinkingResult) => {
      grammarStore.recordFormatStat("linking", r.result);
      setLinkingSession((prev) => (prev ? { ...prev, results: [...prev.results, r] } : prev));
    },
    [grammarStore]
  );

  const nextLinkingQuestion = useCallback(() => {
    if (!linkingSession) return;
    const nextIndex = linkingSession.index + 1;
    if (nextIndex >= linkingSession.queue.length) {
      finishLinking(linkingSession);
    } else {
      setLinkingSession({ ...linkingSession, index: nextIndex });
    }
  }, [linkingSession, finishLinking]);

  // ---------- Linking: connector-recall quiz ("which word expresses this relationship") ----------

  const startConnectorLearn = useCallback(() => {
    setScreen("linking-learn");
  }, []);

  const finishConnectorLearn = useCallback(
    (result: ConnectorLearnResult) => {
      const correct = result.correctCount;
      const total = result.totalCount || 1;
      const incorrect = total - correct;
      const accuracy = Math.round((correct / total) * 100);
      grammarStore.recordSession({ date: Date.now(), total, correct, almost: 0, incorrect, accuracy, format: "linking-vocab" });
      store.addXp(correct * 10 + XP_SESSION_COMPLETE);
      setScreen("home");
    },
    [grammarStore, store]
  );

  // ---------- Linking: free-form essay requiring connectors from several categories, no fixed clauses ----------

  const startLinkingEssay = useCallback(() => {
    setLinkingEssayTopic(sample(WRITING_TOPICS, 1)[0]);
    setScreen("linking-essay");
  }, []);

  const finishLinkingEssay = useCallback(
    (result: LinkingEssayResult) => {
      const enoughCategories = result.categoriesUsed >= LINKING_ESSAY_MIN_CATEGORIES;
      const errorCount = result.issues.length;
      const correct = enoughCategories && errorCount === 0 ? 1 : 0;
      const almost = enoughCategories !== (errorCount === 0) ? 1 : 0;
      const incorrect = !enoughCategories && errorCount > 0 ? 1 : 0;
      const accuracy = correct ? 100 : almost ? 60 : 0;
      grammarStore.recordSession({ date: Date.now(), total: 1, correct, almost, incorrect, accuracy, format: "linking-essay" });
      store.addXp(correct ? 80 : almost ? 45 : 20);
      setLinkingEssayTopic(null);
      setScreen("home");
    },
    [grammarStore, store]
  );

  const endLearningSession = useCallback(
    (s: LearningSessionState) => {
      const vCorrect = s.vocabResults.filter((r) => r.result === "correct").length;
      const vAlmost = s.vocabResults.filter((r) => r.result === "almost").length;
      const vIncorrect = s.vocabResults.filter((r) => r.result === "incorrect").length;
      const gCorrect = s.grammarResults.filter((r) => r.result === "correct").length;
      const gAlmost = s.grammarResults.filter((r) => r.result === "almost").length;
      const gIncorrect = s.grammarResults.filter((r) => r.result === "incorrect").length;

      const correct = vCorrect + gCorrect;
      const almost = vAlmost + gAlmost;
      const incorrect = vIncorrect + gIncorrect;
      const total = correct + almost + incorrect || 1;
      const accuracy = Math.round((correct / total) * 100);
      const newItemsCount = s.vocabResults.filter((r) => r.format === "learn").length + s.grammarResults.filter((r) => r.format === "g-learn").length;

      if (s.vocabResults.length > 0) {
        const vTotal = s.vocabResults.length;
        store.recordSession({
          date: Date.now(),
          total: vTotal,
          correct: vCorrect,
          almost: vAlmost,
          incorrect: vIncorrect,
          accuracy: Math.round((vCorrect / vTotal) * 100),
          format: s.speedEndsAt !== null ? "speed" : "learn",
        });
      }
      if (s.grammarResults.length > 0) {
        const gTotal = s.grammarResults.length;
        grammarStore.recordSession({ date: Date.now(), total: gTotal, correct: gCorrect, almost: gAlmost, incorrect: gIncorrect, accuracy: Math.round((gCorrect / gTotal) * 100), format: "g-learn" });
      }

      // Completing a session pays a flat bonus on top of the per-answer XP — finishing what you
      // started is the habit worth rewarding, independent of how well it went. An empty session
      // (opened and immediately abandoned) earns nothing.
      const answered = s.vocabResults.length + s.grammarResults.length;
      const xpEarned = answered > 0 ? s.xpEarned + XP_SESSION_COMPLETE : 0;
      const xpBefore = store.xp;
      store.addXp(xpEarned);
      setLastBestCombo(s.bestCombo);

      const masteredArr = [...s.masteredItemIds];
      const finishedArr = [...s.finishedItemIds];
      setSummary({
        correct,
        almost,
        incorrect,
        total,
        accuracy,
        newWordsCount: newItemsCount,
        results: s.vocabResults,
        grammarResults: s.grammarResults,
        wordsMastered: masteredArr.filter((id) => id.startsWith("v:")).length,
        wordsInProgress: finishedArr.filter((id) => id.startsWith("v:")).length - masteredArr.filter((id) => id.startsWith("v:")).length,
        rulesMastered: masteredArr.filter((id) => id.startsWith("g:")).length,
        rulesInProgress: finishedArr.filter((id) => id.startsWith("g:")).length - masteredArr.filter((id) => id.startsWith("g:")).length,
        xpEarned,
        xpBefore,
        bestCombo: s.bestCombo,
      });
      setLearningSession(null);
      setScreen("summary");
    },
    [store, grammarStore, setLastBestCombo]
  );

  // Speed Round countdown: ticks while a timed session is active and auto-finishes it once the
  // clock runs out, same as the "End session?" modal's early-exit path. The interval reads the
  // latest session off a ref (rather than closing over the value from when it was scheduled) since
  // the queue/results keep growing as the learner answers questions during the countdown.
  const [speedNow, setSpeedNow] = useState(() => Date.now());
  const learningSessionRef = useRefLatest(learningSession);
  useEffect(() => {
    if (!learningSession?.speedEndsAt) return;
    const endsAt = learningSession.speedEndsAt;
    const id = setInterval(() => {
      if (Date.now() >= endsAt) {
        clearInterval(id);
        const latest = learningSessionRef.current;
        if (latest) endLearningSession(latest);
      } else {
        setSpeedNow(Date.now());
      }
    }, 250);
    return () => clearInterval(id);
  }, [learningSession?.speedEndsAt, learningSessionRef, endLearningSession]);
  const speedSecondsLeft = learningSession?.speedEndsAt ? Math.max(0, Math.ceil((learningSession.speedEndsAt - speedNow) / 1000)) : null;

  const currentItem = learningSession ? learningSession.queue[learningSession.index] : null;

  /**
   * Runs one answer through the reward layer: extends or breaks the combo and prices the answer at
   * the multiplier that was on screen when it was given. Pure — it takes and returns the reward
   * slice of the session so the two advance* functions below can fold it into their own state
   * update.
   */
  const applyReward = useCallback(
    (reward: { combo: number; bestCombo: number; xpEarned: number }, result: AnswerResultKind, mastered: boolean) => {
      const comboBefore = reward.combo;
      const gained = xpForAnswer(result, comboBefore) + (mastered ? XP_ITEM_MASTERED : 0);
      const combo = result === "correct" ? comboBefore + 1 : 0;
      return {
        combo,
        bestCombo: Math.max(reward.bestCombo, combo),
        xpEarned: reward.xpEarned + gained,
        gained,
      };
    },
    []
  );

  /** Pure: computes the queue/attempts/results after one vocab answer, from a known-fresh session snapshot. */
  const advanceVocab = useCallback(
    (session: LearningSessionState, item: LearningQueueItem, entries: ResultEntry[]): LearningSessionState => {
      let queue = session.queue;
      let matchPool = session.matchPool;
      const attempts = { ...session.attempts };
      let formatMemory = session.formatMemory;
      const maxAttempts = maxAttemptsPerWord(tuning);
      const finishedItemIds = new Set(session.finishedItemIds);
      const masteredItemIds = new Set(session.masteredItemIds);
      let reward = { combo: session.combo, bestCombo: session.bestCombo, xpEarned: session.xpEarned };
      let gainedTotal = 0;

      entries.forEach((entry) => {
        const word = item.words.find((w) => w.id === entry.wordId);
        if (!word) return;
        const key = vocabKey(entry.wordId);
        const priorState = store.wordState(entry.wordId);

        // Record what was just asked *before* picking the follow-up, so the next task for this word
        // is a different kind of question than the one just answered.
        formatMemory = rememberFormat(formatMemory, key, entry.format);
        const outcome = nextAfterAnswer(
          item.kind,
          priorState.stage,
          priorState.reviewStreak,
          entry.result,
          store.totalPracticeSessions,
          formatMemory[key] || [],
          tuning,
          allowsSentenceExercises(word)
        );

        store.setLearningStage(entry.wordId, outcome.stage, outcome.reviewStreak, outcome.dueAtSession);
        store.updateWord(entry.wordId, entry.result, entry.hintsUsed);
        store.recordFormatStat(entry.format, entry.result);

        attempts[key] = (attempts[key] || 0) + 1;

        let mastered = false;
        let scheduled = false;
        if (outcome.nextKind && attempts[key] < maxAttempts) {
          if (outcome.nextKind === "quiz") {
            // Held back for a matching round — the pool is its own spacing mechanism.
            matchPool = [...matchPool, word];
            scheduled = true;
          } else {
            // The gap widens with each repeat of this word, and comes back null when the rest of
            // the session is too short to space it — see spacedInsertionIndex().
            const insertAt = insertionIndex(session.index, queue.length, attempts[key], tuning);
            if (insertAt !== null) {
              const nextItem: LearningQueueItem = { kind: outcome.nextKind, words: [word], direction: directionForKind(outcome.nextKind) };
              queue = [...queue.slice(0, insertAt), { domain: "vocab", item: nextItem }, ...queue.slice(insertAt)];
              scheduled = true;
            }
          }
        }
        if (!scheduled) {
          finishedItemIds.add(key);
          if (outcome.stage === 4) {
            masteredItemIds.add(key);
            mastered = true;
          }
        }

        const next = applyReward(reward, entry.result, mastered);
        gainedTotal += next.gained;
        reward = { combo: next.combo, bestCombo: next.bestCombo, xpEarned: next.xpEarned };
      });

      const { groups, remaining } = popMatchGroups(matchPool);
      matchPool = remaining;
      groups.forEach((group) => {
        // Space the round by whichever of its words has been seen most this session, so a matching
        // round never lands right on top of the word that triggered it.
        const groupAttempts = Math.max(...group.map((w) => attempts[vocabKey(w.id)] || 1));
        const insertAt = insertionIndex(session.index, queue.length, groupAttempts, tuning);
        if (insertAt === null) {
          // No room to place it properly — hand the words back to the pool so the end-of-session
          // flush picks them up instead of wedging a round in right behind the current question.
          matchPool = [...matchPool, ...group];
          return;
        }
        const nextItem: LearningQueueItem = { kind: "match", words: group, direction: directionForKind("match") };
        queue = [...queue.slice(0, insertAt), { domain: "vocab", item: nextItem }, ...queue.slice(insertAt)];
      });

      return {
        ...session,
        vocabResults: [...session.vocabResults, ...entries],
        attempts,
        queue,
        matchPool,
        formatMemory,
        finishedItemIds,
        masteredItemIds,
        ...reward,
        lastXp: gainedTotal > 0 ? { amount: gainedTotal, key: session.vocabResults.length + session.grammarResults.length + 1 } : session.lastXp,
      };
    },
    [store, applyReward, tuning]
  );

  /** Pure: computes the queue/attempts/results after one grammar answer, from a known-fresh session snapshot. */
  const advanceGrammar = useCallback(
    (session: LearningSessionState, item: GrammarQueueItem, entries: GrammarResultEntry[]): LearningSessionState => {
      let queue = session.queue;
      const attempts = { ...session.attempts };
      let formatMemory = session.formatMemory;
      const maxAttempts = maxAttemptsPerRule(tuning);
      const finishedItemIds = new Set(session.finishedItemIds);
      const masteredItemIds = new Set(session.masteredItemIds);
      let reward = { combo: session.combo, bestCombo: session.bestCombo, xpEarned: session.xpEarned };
      let gainedTotal = 0;

      entries.forEach((entry) => {
        const key = grammarKey(entry.ruleId);
        const priorState = grammarStore.ruleState(entry.ruleId);

        // Same as the vocab path: remember the format just answered before choosing the follow-up.
        formatMemory = rememberFormat(formatMemory, key, entry.format);
        const outcome = grammarNextAfterAnswer(
          item.kind,
          priorState.stage,
          priorState.reviewStreak,
          entry.result,
          grammarStore.totalPracticeSessions,
          formatMemory[key] || [],
          tuning
        );

        grammarStore.setLearningStage(entry.ruleId, outcome.stage, outcome.reviewStreak, outcome.dueAtSession);
        grammarStore.updateRule(entry.ruleId, entry.result, entry.hintsUsed);
        grammarStore.recordFormatStat(entry.format, entry.result);

        attempts[key] = (attempts[key] || 0) + 1;

        let mastered = false;
        let scheduled = false;
        if (outcome.nextKind && attempts[key] < maxAttempts) {
          const insertAt = grammarInsertionIndex(session.index, queue.length, attempts[key], tuning);
          if (insertAt !== null) {
            const nextItem: GrammarQueueItem = { kind: outcome.nextKind, rule: item.rule };
            queue = [...queue.slice(0, insertAt), { domain: "grammar", item: nextItem }, ...queue.slice(insertAt)];
            scheduled = true;
          }
        }
        if (!scheduled) {
          finishedItemIds.add(key);
          if (outcome.stage === 4) {
            masteredItemIds.add(key);
            mastered = true;
          }
        }

        const next = applyReward(reward, entry.result, mastered);
        gainedTotal += next.gained;
        reward = { combo: next.combo, bestCombo: next.bestCombo, xpEarned: next.xpEarned };
      });

      return {
        ...session,
        grammarResults: [...session.grammarResults, ...entries],
        attempts,
        queue,
        formatMemory,
        finishedItemIds,
        masteredItemIds,
        ...reward,
        lastXp: gainedTotal > 0 ? { amount: gainedTotal, key: session.vocabResults.length + session.grammarResults.length + 1 } : session.lastXp,
      };
    },
    [grammarStore, applyReward, tuning]
  );

  // Records the answer (grows the queue with a follow-up task) but does NOT advance the index —
  // used by every exercise except the learn card, which wait for an explicit Continue click.
  const onVocabAnswered = useCallback(
    (entries: ResultEntry[]) => {
      if (!learningSession || !currentItem || currentItem.domain !== "vocab") return;
      setLearningSession(advanceVocab(learningSession, currentItem.item, entries));
    },
    [learningSession, currentItem, advanceVocab]
  );
  const onGrammarAnswered = useCallback(
    (entries: GrammarResultEntry[]) => {
      if (!learningSession || !currentItem || currentItem.domain !== "grammar") return;
      setLearningSession(advanceGrammar(learningSession, currentItem.item, entries));
    },
    [learningSession, currentItem, advanceGrammar]
  );

  // Advances to the next queue slot, ending the session if that runs off the end (flushing any
  // leftover match pool first). Only ever triggered by a real "Continue" click — a separate
  // browser event from whatever answered the previous question.
  const nextLearningQuestion = useCallback(() => {
    if (!learningSession) return;
    let session = learningSession;
    let nextIndex = session.index + 1;
    if (nextIndex >= session.queue.length && session.matchPool.length > 0) {
      session = { ...session, queue: [...session.queue, ...flushMatchPool(session.matchPool).map((item) => ({ domain: "vocab" as const, item }))], matchPool: [] };
      nextIndex = session.index + 1;
    }
    if (nextIndex >= session.queue.length) {
      endLearningSession(session);
    } else {
      setLearningSession({ ...session, index: nextIndex });
    }
  }, [learningSession, endLearningSession]);

  // Permanently excludes a word from future sessions and skips past it right now — marks it
  // finished without recording an answer (no attempt insertion, no score change), then advances
  // exactly like nextLearningQuestion.
  const blockWordAndAdvance = useCallback(
    (wordId: string) => {
      store.setWordBlocked(wordId, true);
      if (!learningSession) return;
      let session = { ...learningSession, finishedItemIds: new Set(learningSession.finishedItemIds).add("v:" + wordId) };
      let nextIndex = session.index + 1;
      if (nextIndex >= session.queue.length && session.matchPool.length > 0) {
        session = { ...session, queue: [...session.queue, ...flushMatchPool(session.matchPool).map((item) => ({ domain: "vocab" as const, item }))], matchPool: [] };
        nextIndex = session.index + 1;
      }
      if (nextIndex >= session.queue.length) {
        endLearningSession(session);
      } else {
        setLearningSession({ ...session, index: nextIndex });
      }
    },
    [learningSession, endLearningSession, store]
  );

  // Learn cards (both domains) answer and advance in one click — handled atomically to avoid
  // relying on two state updates issued from the same synchronous handler.
  const onVocabLearnAcknowledged = useCallback(
    (entries: ResultEntry[]) => {
      if (!learningSession || !currentItem || currentItem.domain !== "vocab") return;
      let advanced = advanceVocab(learningSession, currentItem.item, entries);
      let nextIndex = advanced.index + 1;
      if (nextIndex >= advanced.queue.length && advanced.matchPool.length > 0) {
        advanced = { ...advanced, queue: [...advanced.queue, ...flushMatchPool(advanced.matchPool).map((item) => ({ domain: "vocab" as const, item }))], matchPool: [] };
        nextIndex = advanced.index + 1;
      }
      if (nextIndex >= advanced.queue.length) endLearningSession(advanced);
      else setLearningSession({ ...advanced, index: nextIndex });
    },
    [learningSession, currentItem, advanceVocab, endLearningSession]
  );
  const onGrammarLearnAcknowledged = useCallback(
    (entries: GrammarResultEntry[]) => {
      if (!learningSession || !currentItem || currentItem.domain !== "grammar") return;
      const advanced = advanceGrammar(learningSession, currentItem.item, entries);
      const nextIndex = advanced.index + 1;
      if (nextIndex >= advanced.queue.length) endLearningSession(advanced);
      else setLearningSession({ ...advanced, index: nextIndex });
    },
    [learningSession, currentItem, advanceGrammar, endLearningSession]
  );

  // ---------- Secondary flow: quick single-pass vocab drills (repeat mistakes / practice a word) ----------

  const startWithWords = useCallback((words: Word[]) => {
    beginRun();
    setLastStart(null);
    const queue: QueueItem[] = words.map((w) => ({
      format: SIMPLE_FORMATS[Math.floor(Math.random() * SIMPLE_FORMATS.length)],
      words: [w],
      direction: "de-en",
    }));
    setQuickSession({ queue, index: 0, results: [] });
    setScreen("session");
  }, [beginRun]);

  const onQuickAnswered = useCallback(
    (entries: ResultEntry[]) => {
      entries.forEach((e) => {
        store.updateWord(e.wordId, e.result, e.hintsUsed);
        store.recordFormatStat(e.format, e.result);
      });
      setQuickSession((prev) => (prev ? { ...prev, results: [...prev.results, ...entries] } : prev));
    },
    [store]
  );

  const endQuickSession = useCallback(
    (s: QuickSessionState) => {
      const correct = s.results.filter((r) => r.result === "correct").length;
      const almost = s.results.filter((r) => r.result === "almost").length;
      const incorrect = s.results.filter((r) => r.result === "incorrect").length;
      const total = s.results.length || 1;
      const accuracy = Math.round((correct / total) * 100);
      const newWordsCount = s.results.filter((r) => store.wordState(r.wordId).timesSeen === 1).length;

      store.recordSession({ date: Date.now(), total, correct, almost, incorrect, accuracy, format: "quick" });
      const xpEarned = s.results.length > 0 ? correct * 10 + almost * 4 + incorrect + XP_SESSION_COMPLETE : 0;
      const xpBefore = store.xp;
      store.addXp(xpEarned);

      setSummary({ correct, almost, incorrect, total, accuracy, newWordsCount, results: s.results, xpEarned, xpBefore, bestCombo: 0 });
      setQuickSession(null);
      setScreen("summary");
    },
    [store]
  );

  const nextQuickQuestion = useCallback(() => {
    if (!quickSession) return;
    const nextIndex = quickSession.index + 1;
    if (nextIndex >= quickSession.queue.length) {
      endQuickSession(quickSession);
    } else {
      setQuickSession({ ...quickSession, index: nextIndex });
    }
  }, [quickSession, endQuickSession]);

  const blockWordAndAdvanceQuick = useCallback(
    (wordId: string) => {
      store.setWordBlocked(wordId, true);
      nextQuickQuestion();
    },
    [store, nextQuickQuestion]
  );

  // ---------- Navigation ----------

  const goHome = useCallback(() => setScreen("home"), []);
  const goList = useCallback(() => setScreen("list"), []);
  const goStats = useCallback(() => setScreen("stats"), []);
  const goSettings = useCallback(() => setScreen("settings"), []);
  const goGoal = useCallback(() => setScreen("goal"), []);

  // Shared by the "End session?" modal's Confirm button and the Escape/Enter keyboard path below,
  // so both ways of confirming an early exit stay in sync.
  const confirmEndSession = useCallback(() => {
    setModalOpen(false);
    if (learningSession) endLearningSession(learningSession);
    else if (quickSession) endQuickSession(quickSession);
    else if (linkingSession) finishLinking(linkingSession);
    else if (testSession) {
      // An abandoned exam is not graded — a partial paper would produce a grade that says nothing
      // about the learner, and filing it would drag the "best grade" record down for no reason.
      setTestSession(null);
      setScreen("home");
    }
  }, [learningSession, quickSession, linkingSession, testSession, endLearningSession, endQuickSession, finishLinking]);

  // Escape is the one key that always makes sense regardless of screen — it's the keyboard
  // equivalent of whatever "leave this" affordance is already on screen (the exit-confirm modal
  // during an active exercise, a direct exit for screens that don't need confirmation, "back" on
  // Word Detail, "home" everywhere else).
  /** Carries out the pending "exclude this word" confirmation against whichever session is live. */
  const confirmBlockWord = useCallback(() => {
    const id = blockPrompt;
    setBlockPrompt(null);
    if (!id) return;
    if (learningSession) blockWordAndAdvance(id);
    else if (quickSession) blockWordAndAdvanceQuick(id);
  }, [blockPrompt, learningSession, quickSession, blockWordAndAdvance, blockWordAndAdvanceQuick]);

  const handleEscape = useCallback(() => {
    if (shortcutsHelpOpen) {
      setShortcutsHelpOpen(false);
      return;
    }
    if (blockPrompt) {
      setBlockPrompt(null);
      return;
    }
    if (modalOpen) {
      setModalOpen(false);
      return;
    }
    switch (screen) {
      case "session":
      case "linking":
      case "test":
        setModalOpen(true);
        return;
      case "reading":
        setReadingSession(null);
        setScreen("home");
        return;
      case "linking-learn":
        setScreen("home");
        return;
      case "linking-essay":
        setLinkingEssayTopic(null);
        setScreen("home");
        return;
      case "detail":
        setScreen("list");
        return;
      case "home":
        return;
      default:
        goHome();
    }
  }, [shortcutsHelpOpen, blockPrompt, modalOpen, screen, goHome]);

  /** True while something is in progress that leaving would discard. */
  const isRunActive = screen === "session" || screen === "linking" || screen === "test" || screen === "reading" || screen === "linking-essay";

  const currentWordId =
    learningSession && currentItem?.domain === "vocab"
      ? currentItem.item.words[0]?.id ?? null
      : quickSession
      ? quickSession.queue[quickSession.index]?.words[0]?.id ?? null
      : null;

  // Global desktop shortcuts so the basic app functions (navigate, mute, exit, see this list) never
  // require a mouse. Bails out while the user is typing in a text field so none of these single
  // letters get swallowed mid-answer — Escape is the one exception, since it never types a
  // character. Per-screen shortcuts (Home's mode/session keys, exercises' A–D/hint, Word List's "/",
  // Stats' tabs) live next to the state they act on instead of here.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handleEscape();
        return;
      }
      // Checked before the "typing" bail below: once a dialog/help overlay is up it visually owns
      // the keyboard even if an exercise input underneath still technically holds DOM focus.
      if (blockPrompt) {
        if (e.key === "Enter") {
          const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
          if (activeTag === "BUTTON" || activeTag === "A") return;
          e.preventDefault();
          confirmBlockWord();
        }
        return;
      }
      if (modalOpen) {
        if (e.key === "Enter") {
          // A focused button/link already reacts to Enter on its own (e.g. tabbing to Cancel) —
          // only treat Enter as "confirm" when nothing more specific is going to handle it.
          const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
          if (activeTag === "BUTTON" || activeTag === "A") return;
          e.preventDefault();
          confirmEndSession();
        }
        return;
      }
      if (shortcutsHelpOpen) {
        if (e.key.toLowerCase() === "h" || e.key === "?") setShortcutsHelpOpen(false);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping = !!target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (isTyping) return;

      // Session-only keys, checked first so they win over the navigation letters below on the one
      // screen where reaching for the star or the exclude button by hand is the real friction.
      if (screen === "session" && currentWordId) {
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          store.toggleFavorite(currentWordId);
          return;
        }
        if (e.key.toLowerCase() === "x") {
          e.preventDefault();
          setBlockPrompt(currentWordId);
          return;
        }
      }

      // Mute and the shortcut sheet are always safe — they change nothing you'd lose.
      switch (e.key.toLowerCase()) {
        case "m":
          e.preventDefault();
          toggleMuted();
          return;
        case "h":
        case "?":
          e.preventDefault();
          setShortcutsHelpOpen(true);
          return;
      }

      // Navigation, on the other hand, walks away from whatever is running. There's no route back
      // into a half-finished session or exam, so a stray "w" used to silently throw one away —
      // during a test that means an ungraded paper. Escape (which confirms first) stays the way out.
      if (isRunActive) return;

      switch (e.key.toLowerCase()) {
        case "g":
          e.preventDefault();
          goGoal();
          break;
        case "w":
          e.preventDefault();
          goList();
          break;
        case "s":
          e.preventDefault();
          goStats();
          break;
        case ",":
          e.preventDefault();
          goSettings();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleEscape,
    modalOpen,
    blockPrompt,
    confirmBlockWord,
    shortcutsHelpOpen,
    confirmEndSession,
    screen,
    isRunActive,
    currentWordId,
    learningSession,
    quickSession,
    blockWordAndAdvance,
    blockWordAndAdvanceQuick,
    store,
    goGoal,
    goList,
    goStats,
    goSettings,
  ]);

  const activeMode: "learning" | "quick" | null = learningSession ? "learning" : quickSession ? "quick" : null;
  const favorite = currentWordId ? store.wordState(currentWordId).favorite : false;
  const showFavorite = currentItem?.domain === "vocab" && currentItem.item.kind !== "match";

  // The badge effect can only fill these in after the finishing session/test has landed in the
  // store, so the celebration screens read them from here rather than from their own frozen props.
  const summaryWithBadges = useMemo(() => (summary ? { ...summary, newBadges } : null), [summary, newBadges]);
  const testResultWithBadges = useMemo(() => (testResult ? { ...testResult, newBadges } : null), [testResult, newBadges]);

  const isFullHeightScreen =
    screen === "session" || screen === "linking" || screen === "linking-learn" || screen === "linking-essay" || screen === "reading" || screen === "test";

  return (
    <div
      className="h-[100dvh] max-w-[720px] lg:max-w-[920px] xl:max-w-[1100px] mx-auto flex flex-col px-5 lg:px-8 w-full overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <TopBar
        screen={screen}
        xp={store.xp}
        goHome={goHome}
        goList={goList}
        goStats={goStats}
        goSettings={goSettings}
        goGoal={goGoal}
        onShortcuts={() => setShortcutsHelpOpen(true)}
        onLogout={() => signOut()}
      />
      <main
        className={
          "flex-1 min-h-0 py-3 flex flex-col overscroll-x-none [-webkit-overflow-scrolling:touch] " +
          (isFullHeightScreen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden")
        }
      >
        {screen === "home" && (
          <HomeScreen
            mode={homeMode}
            onModeChange={setHomeMode}
            linkingSubMode={homeLinkingSubMode}
            onLinkingSubModeChange={setHomeLinkingSubMode}
            domainScope={homeDomainScope}
            onDomainScopeChange={setHomeDomainScope}
            onStartLearning={(mode, includeReview, domainScope) => {
              setLastStart({ kind: "learning", mode, includeReview, domainScope });
              startLearningSession(mode, includeReview, domainScope);
            }}
            onStartLinking={(subMode) => (subMode === "learn" ? startConnectorLearn() : subMode === "essay" ? startLinkingEssay() : startLinkingSession())}
            onStartReading={startReadingSession}
            onStartTest={(scope, length) => {
              setLastStart({ kind: "test", scope, length });
              startTest(scope, length);
            }}
            onReview={(mode, options, domainScope) => {
              setLastStart({ kind: "review", mode, options, domainScope });
              startReviewSession(mode, options, domainScope);
            }}
            onSpeedRound={() => {
              setLastStart({ kind: "speed" });
              startSpeedRound();
            }}
            onGoal={goGoal}
          />
        )}

        {screen === "linking" && linkingSession && linkingSession.queue[linkingSession.index] && (
          <SessionScreen
            renderKey={`${linkingSession.index}-${linkingSession.queue[linkingSession.index].id}`}
            progressPct={Math.round((linkingSession.index / linkingSession.queue.length) * 100)}
            progressLabel={`${linkingSession.index + 1} / ${linkingSession.queue.length}`}
            favorite={false}
            showFavorite={false}
            onExit={() => setModalOpen(true)}
            onToggleFav={NOOP}
          >
            <LinkingExercise pair={linkingSession.queue[linkingSession.index]} onAnswered={onLinkingAnswered} onNext={nextLinkingQuestion} />
          </SessionScreen>
        )}

        {screen === "reading" && readingSession && (
          <ReadingScreen
            text={readingSession.text}
            eligibleGapIds={readingSession.eligibleGapIds}
            onExit={() => {
              setReadingSession(null);
              setScreen("home");
            }}
            onFinish={finishReading}
          />
        )}

        {screen === "linking-learn" && <ConnectorLearnScreen onExit={() => setScreen("home")} onFinish={finishConnectorLearn} />}

        {screen === "linking-essay" && linkingEssayTopic && (
          <LinkingEssayScreen
            topic={linkingEssayTopic}
            onExit={() => {
              setLinkingEssayTopic(null);
              setScreen("home");
            }}
            onFinish={finishLinkingEssay}
          />
        )}

        {screen === "test" && testSession && (
          <TestScreen
            questions={testSession.questions}
            answers={testSession.answers}
            index={testSession.index}
            startedAt={testSession.startedAt}
            onAnswer={answerTestQuestion}
            onNavigate={navigateTest}
            onSubmit={() => finishTest(testSession)}
            onExit={() => setModalOpen(true)}
          />
        )}

        {screen === "test-result" && testResultWithBadges && (
          <TestResultScreen
            result={testResultWithBadges}
            onHome={goHome}
            onRetry={() => {
              setTestResult(null);
              if (lastStart?.kind === "test") replayLastStart();
              else {
                setHomeMode("test");
                setScreen("home");
              }
            }}
          />
        )}

        {screen === "session" && activeMode === "learning" && learningSession && currentItem && (
          <SessionScreen
            renderKey={`${learningSession.index}-${currentItem.domain}-${currentItem.domain === "vocab" ? currentItem.item.words[0].id : currentItem.item.rule.id}-${currentItem.item.kind}`}
            progressPct={Math.round((learningSession.finishedItemIds.size / learningSession.totalItemIds.length) * 100)}
            progressLabel={`${learningSession.finishedItemIds.size} / ${learningSession.totalItemIds.length}`}
            favorite={favorite}
            showFavorite={showFavorite}
            timerLabel={speedSecondsLeft !== null ? `0:${String(speedSecondsLeft).padStart(2, "0")}` : undefined}
            showRewards
            combo={learningSession.combo}
            sessionXp={learningSession.xpEarned}
            xpPop={learningSession.lastXp}
            onExit={() => setModalOpen(true)}
            onToggleFav={() => currentWordId && store.toggleFavorite(currentWordId)}
            onBlock={currentWordId ? () => setBlockPrompt(currentWordId) : undefined}
          >
            {currentItem.domain === "vocab" ? (
              <ExerciseRouter
                item={toQueueItem(currentItem.item)}
                onAnswered={currentItem.item.kind === "learn" ? onVocabLearnAcknowledged : onVocabAnswered}
                onNext={currentItem.item.kind === "learn" ? NOOP : nextLearningQuestion}
              />
            ) : (
              <GrammarExerciseRouter
                kind={currentItem.item.kind}
                reviewFormat={currentItem.item.reviewFormat}
                rule={currentItem.item.rule}
                onAnswered={currentItem.item.kind === "learn" ? onGrammarLearnAcknowledged : onGrammarAnswered}
                onNext={currentItem.item.kind === "learn" ? NOOP : nextLearningQuestion}
              />
            )}
          </SessionScreen>
        )}

        {screen === "session" && activeMode === "quick" && quickSession && quickSession.queue[quickSession.index] && (
          <SessionScreen
            renderKey={quickSession.index}
            progressPct={Math.round((quickSession.index / quickSession.queue.length) * 100)}
            progressLabel={`${quickSession.index + 1} / ${quickSession.queue.length}`}
            favorite={favorite}
            onExit={() => setModalOpen(true)}
            onToggleFav={() => currentWordId && store.toggleFavorite(currentWordId)}
            onBlock={currentWordId ? () => setBlockPrompt(currentWordId) : undefined}
          >
            <ExerciseRouter item={quickSession.queue[quickSession.index]} onAnswered={onQuickAnswered} onNext={nextQuickQuestion} />
          </SessionScreen>
        )}

        {screen === "summary" && summaryWithBadges && (
          <SummaryScreen
            stats={summaryWithBadges}
            onHome={goHome}
            onRepeat={(ids) => startWithWords(ids.map((id) => VOCAB_BY_ID[id]))}
            onNext={lastStart ? replayLastStart : undefined}
          />
        )}

        {screen === "list" && (
          <WordListScreen
            onSelectWord={(id) => {
              setDetailWordId(id);
              setScreen("detail");
            }}
          />
        )}

        {screen === "detail" && detailWordId && (
          <WordDetailScreen
            wordId={detailWordId}
            onBack={() => setScreen("list")}
            onPractice={(id) => startWithWords(Array(5).fill(VOCAB_BY_ID[id]))}
          />
        )}

        {screen === "stats" && <StatsScreen />}

        {screen === "settings" && <SettingsScreen />}

        {screen === "goal" && <GoalScreen />}
      </main>

      <Modal
        open={modalOpen}
        title={screen === "test" ? "Test abbrechen?" : "End session?"}
        body={
          screen === "test"
            ? "Der Test wird verworfen und nicht benotet."
            : "Your progress so far will be saved, but the session will end early."
        }
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmEndSession}
      />
      <Modal
        open={blockPrompt !== null}
        title="Wort ausschließen?"
        body={
          blockPrompt
            ? `„${VOCAB_BY_ID[blockPrompt]?.en ?? blockPrompt}" wird dauerhaft aus dem Training entfernt. Du kannst das in den Einstellungen rückgängig machen.`
            : ""
        }
        cancelLabel="Abbrechen"
        confirmLabel="Ausschließen"
        destructive
        onCancel={() => setBlockPrompt(null)}
        onConfirm={confirmBlockWord}
      />
      <ShortcutsHelp open={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} />
    </div>
  );
}
