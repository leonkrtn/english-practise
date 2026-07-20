"use client";

import { useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import { VOCAB_BY_ID, type Word } from "@/lib/vocab";
import { pickDirection, type QueueItem } from "@/lib/sessionLogic";
import {
  buildLearningBatch,
  buildInitialQueue,
  nextAfterAnswer,
  insertionIndex,
  toQueueItem,
  MAX_ATTEMPTS_PER_WORD,
  type LearningQueueItem,
} from "@/lib/learning";
import type { Direction, ResultEntry } from "@/lib/types";
import TopBar from "./TopBar";
import Modal from "./Modal";
import HomeScreen from "./screens/HomeScreen";
import SessionScreen from "./screens/SessionScreen";
import SummaryScreen, { type SummaryStats } from "./screens/SummaryScreen";
import WordListScreen from "./screens/WordListScreen";
import WordDetailScreen from "./screens/WordDetailScreen";
import StatsScreen from "./screens/StatsScreen";

export type Screen = "home" | "session" | "summary" | "list" | "stats" | "detail";

/** Legacy single-pass session, still used for "practice this word" / "repeat mistakes" quick drills. */
interface QuickSessionState {
  queue: QueueItem[];
  index: number;
  results: ResultEntry[];
}

/** Primary session mode: an adaptive queue that grows as words move through their learning stage. */
interface LearningSessionState {
  queue: LearningQueueItem[];
  index: number;
  results: ResultEntry[];
  attempts: Record<string, number>;
  totalWordIds: string[];
  finishedWordIds: Set<string>;
  masteredWordIds: Set<string>;
}

const SIMPLE_FORMATS: QueueItem["format"][] = ["translate", "gap", "mc", "sentence", "build"];
const NOOP = () => {};

export default function AppShell() {
  const store = useStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailWordId, setDetailWordId] = useState<string | null>(null);
  const [quickSession, setQuickSession] = useState<QuickSessionState | null>(null);
  const [learningSession, setLearningSession] = useState<LearningSessionState | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ---------- Primary flow: the adaptive learning-stage engine ----------

  const startLearningSession = useCallback(
    (direction: Direction) => {
      const batch = buildLearningBatch(store.wordState, store.totalPracticeSessions);
      const queue = buildInitialQueue(batch, store.wordState, direction);
      const totalWordIds = [...new Set(queue.map((i) => i.word.id))];
      setLearningSession({
        queue,
        index: 0,
        results: [],
        attempts: {},
        totalWordIds,
        finishedWordIds: new Set(),
        masteredWordIds: new Set(),
      });
      setScreen("session");
    },
    [store.wordState, store.totalPracticeSessions]
  );

  const endLearningSession = useCallback(
    (s: LearningSessionState) => {
      const correct = s.results.filter((r) => r.result === "correct").length;
      const almost = s.results.filter((r) => r.result === "almost").length;
      const incorrect = s.results.filter((r) => r.result === "incorrect").length;
      const total = s.results.length || 1;
      const accuracy = Math.round((correct / total) * 100);
      const newWordsCount = s.results.filter((r) => r.format === "learn").length;

      store.recordSession({ date: Date.now(), total, correct, almost, incorrect, accuracy, format: "learn" });

      setSummary({
        correct,
        almost,
        incorrect,
        total,
        accuracy,
        newWordsCount,
        results: s.results,
        wordsMastered: s.masteredWordIds.size,
        wordsInProgress: s.finishedWordIds.size - s.masteredWordIds.size,
      });
      setLearningSession(null);
      setScreen("summary");
    },
    [store]
  );

  const currentLearningItem = learningSession ? learningSession.queue[learningSession.index] : null;

  /** Computes the queue/attempts/results after one answer, from a known-fresh session snapshot — pure, no state reads. */
  const advanceLearning = useCallback(
    (session: LearningSessionState, item: LearningQueueItem, entries: ResultEntry[]) => {
      const entry = entries[0];
      const priorReviewStreak = store.wordState(entry.wordId).reviewStreak;
      const outcome = nextAfterAnswer(item.kind, priorReviewStreak, entry.result, store.totalPracticeSessions);

      store.setLearningStage(entry.wordId, outcome.stage, outcome.reviewStreak, outcome.dueAtSession);
      store.updateWord(entry.wordId, entry.result, entry.hintsUsed);
      store.recordFormatStat(entry.format, entry.result);

      const attempts = { ...session.attempts };
      attempts[entry.wordId] = (attempts[entry.wordId] || 0) + 1;

      let queue = session.queue;
      const finishedWordIds = new Set(session.finishedWordIds);
      const masteredWordIds = new Set(session.masteredWordIds);

      if (outcome.nextKind && attempts[entry.wordId] < MAX_ATTEMPTS_PER_WORD) {
        const nextItem: LearningQueueItem = { kind: outcome.nextKind, word: item.word, direction: item.direction };
        const insertAt = insertionIndex(session.index, queue.length);
        queue = [...queue.slice(0, insertAt), nextItem, ...queue.slice(insertAt)];
      } else {
        finishedWordIds.add(entry.wordId);
        if (outcome.stage === 4) masteredWordIds.add(entry.wordId);
      }

      return { ...session, results: [...session.results, ...entries], attempts, queue, finishedWordIds, masteredWordIds };
    },
    [store]
  );

  // Used by every exercise except the learn card: records the answer (grows the queue with a
  // follow-up task a few items ahead) but does NOT advance the index yet — the exercise shows a
  // feedback panel and waits for an explicit "Continue" click (nextLearningQuestion) first.
  const onLearningAnswered = useCallback(
    (entries: ResultEntry[]) => {
      if (!learningSession || !currentLearningItem) return;
      setLearningSession(advanceLearning(learningSession, currentLearningItem, entries));
    },
    [learningSession, currentLearningItem, advanceLearning]
  );

  // Advances to the next queue slot, ending the session if that runs off the end. Only ever
  // triggered by a real "Continue" click — a separate browser event from whatever answered the
  // previous question — so `learningSession` here is always the freshly committed state.
  const nextLearningQuestion = useCallback(() => {
    if (!learningSession) return;
    const nextIndex = learningSession.index + 1;
    if (nextIndex >= learningSession.queue.length) {
      endLearningSession(learningSession);
    } else {
      setLearningSession({ ...learningSession, index: nextIndex });
    }
  }, [learningSession, endLearningSession]);

  // The learn card has no feedback/Continue step — one click both records and advances. Doing
  // both in one shot (rather than the two-callback dance above) avoids relying on two state
  // updates issued from the same synchronous handler, which is a much easier source of bugs.
  const onLearnAcknowledged = useCallback(
    (entries: ResultEntry[]) => {
      if (!learningSession || !currentLearningItem) return;
      const advanced = advanceLearning(learningSession, currentLearningItem, entries);
      const nextIndex = advanced.index + 1;
      if (nextIndex >= advanced.queue.length) {
        endLearningSession(advanced);
      } else {
        setLearningSession({ ...advanced, index: nextIndex });
      }
    },
    [learningSession, currentLearningItem, advanceLearning, endLearningSession]
  );

  // ---------- Secondary flow: quick single-pass drills (repeat mistakes / practice a word) ----------

  const startWithWords = useCallback((words: Word[]) => {
    const queue: QueueItem[] = words.map((w) => ({
      format: SIMPLE_FORMATS[Math.floor(Math.random() * SIMPLE_FORMATS.length)],
      words: [w],
      direction: pickDirection("mixed"),
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
    activeMode === "learning"
      ? currentLearningItem?.word.id ?? null
      : activeMode === "quick" && quickSession
      ? quickSession.queue[quickSession.index]?.words[0]?.id ?? null
      : null;
  const favorite = currentWordId ? store.wordState(currentWordId).favorite : false;
  const isLearnCard = currentLearningItem?.kind === "learn";

  return (
    <div className="max-w-[720px] mx-auto min-h-screen flex flex-col px-5 w-full">
      <TopBar screen={screen} goHome={goHome} goList={goList} goStats={goStats} />
      <main className="flex-1 py-6 pb-16">
        {screen === "home" && <HomeScreen onStart={startLearningSession} />}

        {screen === "session" && activeMode === "learning" && learningSession && currentLearningItem && (
          <SessionScreen
            renderKey={`${learningSession.index}-${currentLearningItem.word.id}-${currentLearningItem.kind}`}
            progressPct={Math.round((learningSession.finishedWordIds.size / learningSession.totalWordIds.length) * 100)}
            progressLabel={`${learningSession.finishedWordIds.size} / ${learningSession.totalWordIds.length} Wörter`}
            item={toQueueItem(currentLearningItem)}
            favorite={favorite}
            onExit={() => setModalOpen(true)}
            onToggleFav={() => currentWordId && store.toggleFavorite(currentWordId)}
            onAnswered={isLearnCard ? onLearnAcknowledged : onLearningAnswered}
            onNext={isLearnCard ? NOOP : nextLearningQuestion}
          />
        )}

        {screen === "session" && activeMode === "quick" && quickSession && quickSession.queue[quickSession.index] && (
          <SessionScreen
            renderKey={quickSession.index}
            progressPct={Math.round((quickSession.index / quickSession.queue.length) * 100)}
            progressLabel={`${quickSession.index + 1} / ${quickSession.queue.length}`}
            item={quickSession.queue[quickSession.index]}
            favorite={favorite}
            onExit={() => setModalOpen(true)}
            onToggleFav={() => currentWordId && store.toggleFavorite(currentWordId)}
            onAnswered={onQuickAnswered}
            onNext={nextQuickQuestion}
          />
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
