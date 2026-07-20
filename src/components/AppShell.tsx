"use client";

import { useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import { useAuth } from "@/lib/auth";
import { VOCAB_BY_ID, type Word } from "@/lib/vocab";
import type { QueueItem } from "@/lib/sessionLogic";
import {
  buildLearningBatch,
  buildInitialQueue,
  nextAfterAnswer,
  insertionIndex,
  toQueueItem,
  directionForKind,
  popMatchGroups,
  flushMatchPool,
  MAX_ATTEMPTS_PER_WORD,
  type LearningQueueItem,
} from "@/lib/learning";
import {
  buildGrammarBatch,
  buildGrammarQueue,
  grammarNextAfterAnswer,
  grammarInsertionIndex,
  GRAMMAR_MAX_ATTEMPTS,
  type GrammarQueueItem,
} from "@/lib/grammarLearning";
import { shuffle } from "@/lib/utils";
import type { ResultEntry } from "@/lib/types";
import type { GrammarResultEntry } from "@/lib/grammarTypes";
import ExerciseRouter from "@/components/exercises/ExerciseRouter";
import GrammarExerciseRouter from "@/components/grammar-exercises/GrammarExerciseRouter";
import TopBar from "./TopBar";
import Modal from "./Modal";
import HomeScreen from "./screens/HomeScreen";
import SessionScreen from "./screens/SessionScreen";
import SummaryScreen, { type SummaryStats } from "./screens/SummaryScreen";
import WordListScreen from "./screens/WordListScreen";
import WordDetailScreen from "./screens/WordDetailScreen";
import StatsScreen from "./screens/StatsScreen";

export type Screen = "home" | "session" | "summary" | "list" | "stats" | "detail";
export type SessionMode = "vocab" | "grammar" | "mixed";

type UnifiedItem = { domain: "vocab"; item: LearningQueueItem } | { domain: "grammar"; item: GrammarQueueItem };

/** Legacy single-pass session, still used for "practice this word" / "repeat mistakes" quick drills. */
interface QuickSessionState {
  queue: QueueItem[];
  index: number;
  results: ResultEntry[];
}

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
}

const SIMPLE_FORMATS: QueueItem["format"][] = ["translate", "gap", "mc", "sentence", "build"];
const NOOP = () => {};

export default function AppShell() {
  const store = useStore();
  const grammarStore = useGrammarStore();
  const { signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailWordId, setDetailWordId] = useState<string | null>(null);
  const [quickSession, setQuickSession] = useState<QuickSessionState | null>(null);
  const [learningSession, setLearningSession] = useState<LearningSessionState | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ---------- Primary flow: the adaptive learning-stage engine (vocab, grammar, or both) ----------

  const startLearningSession = useCallback(
    (mode: SessionMode) => {
      let vocabQueue: LearningQueueItem[] = [];
      let matchPool: Word[] = [];
      let grammarQueueItems: GrammarQueueItem[] = [];

      if (mode === "vocab" || mode === "mixed") {
        const batch = buildLearningBatch(store.wordState, store.totalPracticeSessions);
        const built = buildInitialQueue(batch, store.wordState);
        vocabQueue = built.queue;
        matchPool = built.matchPool;
      }
      if (mode === "grammar" || mode === "mixed") {
        const gBatch = buildGrammarBatch(grammarStore.ruleState, grammarStore.totalPracticeSessions);
        grammarQueueItems = buildGrammarQueue(gBatch, grammarStore.ruleState);
      }

      let queue: UnifiedItem[] = shuffle([
        ...vocabQueue.map((item) => ({ domain: "vocab" as const, item })),
        ...grammarQueueItems.map((item) => ({ domain: "grammar" as const, item })),
      ]);
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
      });
      setScreen("session");
    },
    [store.wordState, store.totalPracticeSessions, grammarStore.ruleState, grammarStore.totalPracticeSessions]
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
        store.recordSession({ date: Date.now(), total: vTotal, correct: vCorrect, almost: vAlmost, incorrect: vIncorrect, accuracy: Math.round((vCorrect / vTotal) * 100), format: "learn" });
      }
      if (s.grammarResults.length > 0) {
        const gTotal = s.grammarResults.length;
        grammarStore.recordSession({ date: Date.now(), total: gTotal, correct: gCorrect, almost: gAlmost, incorrect: gIncorrect, accuracy: Math.round((gCorrect / gTotal) * 100), format: "g-learn" });
      }

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
      });
      setLearningSession(null);
      setScreen("summary");
    },
    [store, grammarStore]
  );

  const currentItem = learningSession ? learningSession.queue[learningSession.index] : null;

  /** Pure: computes the queue/attempts/results after one vocab answer, from a known-fresh session snapshot. */
  const advanceVocab = useCallback(
    (session: LearningSessionState, item: LearningQueueItem, entries: ResultEntry[]): LearningSessionState => {
      let queue = session.queue;
      let matchPool = session.matchPool;
      const attempts = { ...session.attempts };
      const finishedItemIds = new Set(session.finishedItemIds);
      const masteredItemIds = new Set(session.masteredItemIds);

      entries.forEach((entry) => {
        const word = item.words.find((w) => w.id === entry.wordId);
        if (!word) return;
        const key = "v:" + entry.wordId;
        const priorReviewStreak = store.wordState(entry.wordId).reviewStreak;
        const outcome = nextAfterAnswer(item.kind, priorReviewStreak, entry.result, store.totalPracticeSessions);

        store.setLearningStage(entry.wordId, outcome.stage, outcome.reviewStreak, outcome.dueAtSession);
        store.updateWord(entry.wordId, entry.result, entry.hintsUsed);
        store.recordFormatStat(entry.format, entry.result);

        attempts[key] = (attempts[key] || 0) + 1;

        if (outcome.nextKind && attempts[key] < MAX_ATTEMPTS_PER_WORD) {
          if (outcome.nextKind === "quiz") {
            matchPool = [...matchPool, word];
          } else {
            const nextItem: LearningQueueItem = { kind: outcome.nextKind, words: [word], direction: directionForKind(outcome.nextKind) };
            const insertAt = insertionIndex(session.index, queue.length);
            queue = [...queue.slice(0, insertAt), { domain: "vocab", item: nextItem }, ...queue.slice(insertAt)];
          }
        } else {
          finishedItemIds.add(key);
          if (outcome.stage === 4) masteredItemIds.add(key);
        }
      });

      const { groups, remaining } = popMatchGroups(matchPool);
      groups.forEach((group) => {
        const nextItem: LearningQueueItem = { kind: "match", words: group, direction: directionForKind("match") };
        const insertAt = insertionIndex(session.index, queue.length);
        queue = [...queue.slice(0, insertAt), { domain: "vocab", item: nextItem }, ...queue.slice(insertAt)];
      });
      matchPool = remaining;

      return { ...session, vocabResults: [...session.vocabResults, ...entries], attempts, queue, matchPool, finishedItemIds, masteredItemIds };
    },
    [store]
  );

  /** Pure: computes the queue/attempts/results after one grammar answer, from a known-fresh session snapshot. */
  const advanceGrammar = useCallback(
    (session: LearningSessionState, item: GrammarQueueItem, entries: GrammarResultEntry[]): LearningSessionState => {
      let queue = session.queue;
      const attempts = { ...session.attempts };
      const finishedItemIds = new Set(session.finishedItemIds);
      const masteredItemIds = new Set(session.masteredItemIds);

      entries.forEach((entry) => {
        const key = "g:" + entry.ruleId;
        const priorReviewStreak = grammarStore.ruleState(entry.ruleId).reviewStreak;
        const outcome = grammarNextAfterAnswer(item.kind, priorReviewStreak, entry.result, grammarStore.totalPracticeSessions);

        grammarStore.setLearningStage(entry.ruleId, outcome.stage, outcome.reviewStreak, outcome.dueAtSession);
        grammarStore.updateRule(entry.ruleId, entry.result, entry.hintsUsed);
        grammarStore.recordFormatStat(entry.format, entry.result);

        attempts[key] = (attempts[key] || 0) + 1;

        if (outcome.nextKind && attempts[key] < GRAMMAR_MAX_ATTEMPTS) {
          const nextItem: GrammarQueueItem = { kind: outcome.nextKind, rule: item.rule };
          const insertAt = grammarInsertionIndex(session.index, queue.length);
          queue = [...queue.slice(0, insertAt), { domain: "grammar", item: nextItem }, ...queue.slice(insertAt)];
        } else {
          finishedItemIds.add(key);
          if (outcome.stage === 4) masteredItemIds.add(key);
        }
      });

      return { ...session, grammarResults: [...session.grammarResults, ...entries], attempts, queue, finishedItemIds, masteredItemIds };
    },
    [grammarStore]
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
    const queue: QueueItem[] = words.map((w) => ({
      format: SIMPLE_FORMATS[Math.floor(Math.random() * SIMPLE_FORMATS.length)],
      words: [w],
      direction: "de-en",
    }));
    setQuickSession({ queue, index: 0, results: [] });
    setScreen("session");
  }, []);

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

      store.recordSession({ date: Date.now(), total, correct, almost, incorrect, accuracy, format: "mixed" });

      setSummary({ correct, almost, incorrect, total, accuracy, newWordsCount, results: s.results });
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

  // ---------- Navigation ----------

  function goHome() {
    setScreen("home");
  }
  function goList() {
    setScreen("list");
  }
  function goStats() {
    setScreen("stats");
  }

  const activeMode: "learning" | "quick" | null = learningSession ? "learning" : quickSession ? "quick" : null;
  const currentWordId =
    activeMode === "learning" && currentItem?.domain === "vocab"
      ? currentItem.item.words[0]?.id ?? null
      : activeMode === "quick" && quickSession
      ? quickSession.queue[quickSession.index]?.words[0]?.id ?? null
      : null;
  const favorite = currentWordId ? store.wordState(currentWordId).favorite : false;
  const showFavorite = currentItem?.domain === "vocab" && currentItem.item.kind !== "match";

  return (
    <div
      className="h-[100dvh] max-w-[720px] mx-auto flex flex-col px-5 w-full overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <TopBar screen={screen} goHome={goHome} goList={goList} goStats={goStats} onLogout={() => signOut()} />
      <main
        className={
          "flex-1 min-h-0 py-3 flex flex-col overscroll-x-none " + (screen === "session" ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden")
        }
      >
        {screen === "home" && <HomeScreen onStart={startLearningSession} />}

        {screen === "session" && activeMode === "learning" && learningSession && currentItem && (
          <SessionScreen
            renderKey={`${learningSession.index}-${currentItem.domain}-${currentItem.domain === "vocab" ? currentItem.item.words[0].id : currentItem.item.rule.id}-${currentItem.item.kind}`}
            progressPct={Math.round((learningSession.finishedItemIds.size / learningSession.totalItemIds.length) * 100)}
            progressLabel={`${learningSession.finishedItemIds.size} / ${learningSession.totalItemIds.length}`}
            favorite={favorite}
            showFavorite={showFavorite}
            onExit={() => setModalOpen(true)}
            onToggleFav={() => currentWordId && store.toggleFavorite(currentWordId)}
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
          >
            <ExerciseRouter item={quickSession.queue[quickSession.index]} onAnswered={onQuickAnswered} onNext={nextQuickQuestion} />
          </SessionScreen>
        )}

        {screen === "summary" && summary && (
          <SummaryScreen
            stats={summary}
            onHome={goHome}
            onRepeat={(ids) => startWithWords(ids.map((id) => VOCAB_BY_ID[id]))}
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
      </main>

      <Modal
        open={modalOpen}
        title="End session?"
        body="Your progress so far will be saved, but the session will end early."
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          if (learningSession) endLearningSession(learningSession);
          else if (quickSession) endQuickSession(quickSession);
        }}
      />
    </div>
  );
}
