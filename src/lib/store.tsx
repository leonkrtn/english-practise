"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase, supabaseConfigError } from "./supabase";
import { blankWordState, type FormatStat, type SessionRecord, type WordState, type AnswerResultKind, type LearningStage } from "./types";

interface StoreShape {
  words: Record<string, WordState>;
  formatStats: Record<string, FormatStat>;
  sessionHistory: SessionRecord[];
  totalPracticeSessions: number;
}

interface StoreApi {
  ready: boolean;
  error: string | null;
  words: Record<string, WordState>;
  formatStats: Record<string, FormatStat>;
  sessionHistory: SessionRecord[];
  totalPracticeSessions: number;
  wordState: (id: string) => WordState;
  updateWord: (id: string, result: AnswerResultKind, hintsUsed?: number) => void;
  recordFormatStat: (format: string, result: AnswerResultKind) => void;
  toggleFavorite: (id: string) => boolean;
  recordSession: (session: SessionRecord) => void;
  setLearningStage: (id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StoreShape>({
    words: {},
    formatStats: {},
    sessionHistory: [],
    totalPracticeSessions: 0,
  });
  const userId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (supabaseConfigError) throw new Error(supabaseConfigError);
        const { data: sessionData } = await supabase.auth.getSession();
        let session = sessionData.session;
        if (!session) {
          const { data, error: signErr } = await supabase.auth.signInAnonymously();
          if (signErr) throw signErr;
          session = data.session;
        }
        if (!session) throw new Error("Could not create a Supabase session.");
        userId.current = session.user.id;

        const [wp, fs, sh, meta] = await Promise.all([
          supabase.from("word_progress").select("*").eq("user_id", session.user.id),
          supabase.from("format_stats").select("*").eq("user_id", session.user.id),
          supabase
            .from("session_history")
            .select("*")
            .eq("user_id", session.user.id)
            .order("occurred_at", { ascending: true })
            .limit(200),
          supabase.from("app_meta").select("*").eq("user_id", session.user.id).maybeSingle(),
        ]);
        if (wp.error) throw wp.error;
        if (fs.error) throw fs.error;
        if (sh.error) throw sh.error;

        const words: Record<string, WordState> = {};
        (wp.data || []).forEach((row) => {
          words[row.word_id] = {
            score: Number(row.score) || 0,
            timesSeen: row.times_seen || 0,
            timesCorrect: row.times_correct || 0,
            timesIncorrect: row.times_incorrect || 0,
            timesAlmost: row.times_almost || 0,
            favorite: !!row.favorite,
            spellingErrors: row.spelling_errors || 0,
            confusions: row.confusions || 0,
            lastSeen: row.last_seen ? new Date(row.last_seen).getTime() : null,
            recentMistake: !!row.recent_mistake,
            streak: row.streak || 0,
            stage: (row.stage ?? 0) as LearningStage,
            reviewStreak: row.review_streak || 0,
            dueAtSession: row.due_at_session ?? null,
          };
        });

        const formatStats: Record<string, FormatStat> = {};
        (fs.data || []).forEach((row) => {
          formatStats[row.format] = { correct: row.correct || 0, almost: row.almost || 0, incorrect: row.incorrect || 0 };
        });

        const sessionHistory: SessionRecord[] = (sh.data || []).map((row) => ({
          date: new Date(row.occurred_at).getTime(),
          total: row.total,
          correct: row.correct,
          almost: row.almost,
          incorrect: row.incorrect,
          accuracy: row.accuracy,
          format: row.format,
        }));

        if (cancelled) return;
        setState({
          words,
          formatStats,
          sessionHistory,
          totalPracticeSessions: meta.data ? meta.data.total_practice_sessions : 0,
        });
        setReady(true);
      } catch (e) {
        console.error("Supabase init failed", e);
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not connect to Supabase.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wordState = useCallback(
    (id: string): WordState => state.words[id] || blankWordState(),
    [state.words]
  );

  const persistWord = useCallback((id: string, w: WordState) => {
    if (!userId.current) return;
    supabase
      .from("word_progress")
      .upsert(
        {
          user_id: userId.current,
          word_id: id,
          score: w.score,
          times_seen: w.timesSeen,
          times_correct: w.timesCorrect,
          times_incorrect: w.timesIncorrect,
          times_almost: w.timesAlmost,
          favorite: w.favorite,
          spelling_errors: w.spellingErrors,
          confusions: w.confusions,
          last_seen: w.lastSeen ? new Date(w.lastSeen).toISOString() : null,
          recent_mistake: w.recentMistake,
          streak: w.streak,
          stage: w.stage,
          review_streak: w.reviewStreak,
          due_at_session: w.dueAtSession,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,word_id" }
      )
      .then(({ error: err }) => {
        if (err) console.error("persistWord", err);
      });
  }, []);

  const updateWord = useCallback(
    (id: string, result: AnswerResultKind, hintsUsed = 0) => {
      setState((prev) => {
        const w = { ...(prev.words[id] || blankWordState()) };
        w.timesSeen++;
        w.lastSeen = Date.now();
        if (result === "correct") {
          w.timesCorrect++;
          w.streak++;
          const inc = hintsUsed > 0 ? 0.5 : 1;
          w.score = Math.min(5, w.score + inc);
          w.recentMistake = false;
        } else if (result === "almost") {
          w.timesAlmost++;
          w.streak = 0;
          w.score = Math.min(5, Math.max(1, w.score + 0.25));
          w.recentMistake = true;
        } else {
          w.timesIncorrect++;
          w.streak = 0;
          w.score = Math.max(0, w.score - 2);
          w.recentMistake = true;
        }
        persistWord(id, w);
        return { ...prev, words: { ...prev.words, [id]: w } };
      });
    },
    [persistWord]
  );

  const recordFormatStat = useCallback((format: string, result: AnswerResultKind) => {
    setState((prev) => {
      const s = { ...(prev.formatStats[format] || { correct: 0, almost: 0, incorrect: 0 }) };
      s[result]++;
      if (userId.current) {
        supabase
          .from("format_stats")
          .upsert(
            { user_id: userId.current, format, correct: s.correct, almost: s.almost, incorrect: s.incorrect },
            { onConflict: "user_id,format" }
          )
          .then(({ error: err }) => {
            if (err) console.error("recordFormatStat", err);
          });
      }
      return { ...prev, formatStats: { ...prev.formatStats, [format]: s } };
    });
  }, []);

  const toggleFavorite = useCallback(
    (id: string): boolean => {
      let fav = false;
      setState((prev) => {
        const w = { ...(prev.words[id] || blankWordState()) };
        w.favorite = !w.favorite;
        fav = w.favorite;
        persistWord(id, w);
        return { ...prev, words: { ...prev.words, [id]: w } };
      });
      return fav;
    },
    [persistWord]
  );

  const setLearningStage = useCallback(
    (id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => {
      setState((prev) => {
        const w = { ...(prev.words[id] || blankWordState()) };
        w.stage = stage;
        w.reviewStreak = reviewStreak;
        w.dueAtSession = dueAtSession;
        persistWord(id, w);
        return { ...prev, words: { ...prev.words, [id]: w } };
      });
    },
    [persistWord]
  );

  const recordSession = useCallback((session: SessionRecord) => {
    setState((prev) => {
      const total = (prev.totalPracticeSessions || 0) + 1;
      if (userId.current) {
        supabase
          .from("session_history")
          .insert({
            user_id: userId.current,
            occurred_at: new Date(session.date).toISOString(),
            total: session.total,
            correct: session.correct,
            almost: session.almost,
            incorrect: session.incorrect,
            accuracy: session.accuracy,
            format: session.format,
          })
          .then(({ error: err }) => {
            if (err) console.error("recordSession", err);
          });
        supabase
          .from("app_meta")
          .upsert({ user_id: userId.current, total_practice_sessions: total }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("app_meta", err);
          });
      }
      return { ...prev, sessionHistory: [...prev.sessionHistory, session], totalPracticeSessions: total };
    });
  }, []);

  const api: StoreApi = {
    ready,
    error,
    words: state.words,
    formatStats: state.formatStats,
    sessionHistory: state.sessionHistory,
    totalPracticeSessions: state.totalPracticeSessions,
    wordState,
    updateWord,
    recordFormatStat,
    toggleFavorite,
    recordSession,
    setLearningStage,
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
