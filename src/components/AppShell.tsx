"use client";

import { useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import { VOCAB_BY_ID, type Word } from "@/lib/vocab";
import { buildPool, buildQueue, pickDirection, type QueueItem } from "@/lib/sessionLogic";
import type { Direction, ExerciseFormat, SelectionMode, ResultEntry } from "@/lib/types";
import TopBar from "./TopBar";
import Modal from "./Modal";
import HomeScreen from "./screens/HomeScreen";
import SessionScreen from "./screens/SessionScreen";
import SummaryScreen, { type SummaryStats } from "./screens/SummaryScreen";
import WordListScreen from "./screens/WordListScreen";
import WordDetailScreen from "./screens/WordDetailScreen";
import StatsScreen from "./screens/StatsScreen";

export type Screen = "home" | "session" | "summary" | "list" | "stats" | "detail";

interface SessionState {
  queue: QueueItem[];
  index: number;
  results: ResultEntry[];
  config: { direction: Direction; format: ExerciseFormat; mode: SelectionMode | "custom" };
}

const SIMPLE_FORMATS: QueueItem["format"][] = ["translate", "gap", "mc", "sentence", "build"];

export default function AppShell() {
  const store = useStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailWordId, setDetailWordId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const startSession = useCallback(
    (direction: Direction, format: ExerciseFormat, mode: SelectionMode, lenVal: number) => {
      const pool = buildPool(mode, store.wordState);
      const target = lenVal === 0 ? Math.min(300, Math.max(20, pool.length)) : lenVal;
      const queue = buildQueue(pool, format, direction, target, store.wordState);
      setSession({ queue, index: 0, results: [], config: { direction, format, mode } });
      setScreen("session");
    },
    [store.wordState]
  );

  const startWithWords = useCallback((words: Word[]) => {
    const queue: QueueItem[] = words.map((w) => ({
      format: SIMPLE_FORMATS[Math.floor(Math.random() * SIMPLE_FORMATS.length)],
      words: [w],
      direction: pickDirection("mixed"),
    }));
    setSession({ queue, index: 0, results: [], config: { direction: "mixed", format: "mixed", mode: "custom" } });
    setScreen("session");
  }, []);

  const onAnswered = useCallback(
    (entries: ResultEntry[]) => {
      entries.forEach((e) => {
        store.updateWord(e.wordId, e.result, e.hintsUsed);
        store.recordFormatStat(e.format, e.result);
      });
      setSession((prev) => (prev ? { ...prev, results: [...prev.results, ...entries] } : prev));
    },
    [store]
  );

  const endSession = useCallback(
    (s: SessionState) => {
      const correct = s.results.filter((r) => r.result === "correct").length;
      const almost = s.results.filter((r) => r.result === "almost").length;
      const incorrect = s.results.filter((r) => r.result === "incorrect").length;
      const total = s.results.length || 1;
      const accuracy = Math.round((correct / total) * 100);
      const newWordsCount = s.results.filter((r) => store.wordState(r.wordId).timesSeen === 1).length;

      store.recordSession({
        date: Date.now(),
        total,
        correct,
        almost,
        incorrect,
        accuracy,
        format: s.config.format,
      });

      setSummary({ correct, almost, incorrect, total, accuracy, newWordsCount, results: s.results });
      setScreen("summary");
    },
    [store]
  );

  const nextQuestion = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.queue.length) {
        endSession(prev);
        return prev;
      }
      return { ...prev, index: nextIndex };
    });
  }, [endSession]);

  function goHome() {
    setScreen("home");
  }
  function goList() {
    setScreen("list");
  }
  function goStats() {
    setScreen("stats");
  }

  const currentWordId = session ? session.queue[session.index]?.words[0]?.id : null;
  const favorite = currentWordId ? store.wordState(currentWordId).favorite : false;

  return (
    <div className="max-w-[720px] mx-auto min-h-screen flex flex-col px-5 w-full">
      <TopBar screen={screen} goHome={goHome} goList={goList} goStats={goStats} />
      <main className="flex-1 py-6 pb-16">
        {screen === "home" && <HomeScreen onStart={startSession} />}

        {screen === "session" && session && session.queue[session.index] && (
          <SessionScreen
            index={session.index}
            total={session.queue.length}
            item={session.queue[session.index]}
            favorite={favorite}
            onExit={() => setModalOpen(true)}
            onToggleFav={() => currentWordId && store.toggleFavorite(currentWordId)}
            onAnswered={onAnswered}
            onNext={nextQuestion}
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
          if (session) endSession(session);
        }}
      />
    </div>
  );
}
