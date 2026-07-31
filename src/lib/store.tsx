"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isAuthError, supabase } from "./supabase";
import { blankWordState, type FormatStat, type SessionRecord, type TestRecord, type WordState, type AnswerResultKind, type LearningStage } from "./types";
import { DEFAULT_PROFILE_ID, isLearningProfileId, type LearningProfileId } from "./learningProfile";

interface StoreShape {
  words: Record<string, WordState>;
  formatStats: Record<string, FormatStat>;
  sessionHistory: SessionRecord[];
  testHistory: TestRecord[];
  totalPracticeSessions: number;
  goalStartedAt: number | null;
  goalBaselineTotal: number | null;
  blockedWordIds: Set<string>;
  xp: number;
  badgeIds: Set<string>;
  learningProfile: LearningProfileId;
}

interface StoreApi {
  ready: boolean;
  error: string | null;
  words: Record<string, WordState>;
  formatStats: Record<string, FormatStat>;
  sessionHistory: SessionRecord[];
  testHistory: TestRecord[];
  totalPracticeSessions: number;
  goalStartedAt: number | null;
  goalBaselineTotal: number | null;
  blockedWordIds: Set<string>;
  xp: number;
  badgeIds: Set<string>;
  learningProfile: LearningProfileId;
  wordState: (id: string) => WordState;
  updateWord: (id: string, result: AnswerResultKind, hintsUsed?: number) => void;
  recordFormatStat: (format: string, result: AnswerResultKind) => void;
  toggleFavorite: (id: string) => void;
  recordSession: (session: SessionRecord) => void;
  recordTest: (test: TestRecord) => void;
  setLearningStage: (id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => void;
  startGoalIfNeeded: (baselineTotal: number) => void;
  setWordBlocked: (id: string, blocked: boolean) => void;
  addXp: (amount: number) => void;
  unlockBadges: (ids: string[]) => void;
  setLearningProfile: (id: LearningProfileId) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

/** The slice of the store that lives in the single `app_meta` row, so it can be diffed as a unit
 * and written back as one partial upsert rather than one per changed field. */
type MetaSnapshot = Pick<
  StoreShape,
  "totalPracticeSessions" | "goalStartedAt" | "goalBaselineTotal" | "blockedWordIds" | "xp" | "badgeIds" | "learningProfile"
>;

function metaSnapshot(s: StoreShape): MetaSnapshot {
  return {
    totalPracticeSessions: s.totalPracticeSessions,
    goalStartedAt: s.goalStartedAt,
    goalBaselineTotal: s.goalBaselineTotal,
    blockedWordIds: s.blockedWordIds,
    xp: s.xp,
    badgeIds: s.badgeIds,
    learningProfile: s.learningProfile,
  };
}

function wordRow(userId: string, id: string, w: WordState) {
  return {
    user_id: userId,
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
    hints_used: w.hintsUsed,
    mastered_at: w.masteredAt ? new Date(w.masteredAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

/** Loads and persists this signed-in user's progress. Mount only once `userId` (a real account, not anonymous) is known. */
export function StoreProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StoreShape>({
    words: {},
    formatStats: {},
    sessionHistory: [],
    testHistory: [],
    totalPracticeSessions: 0,
    goalStartedAt: null,
    goalBaselineTotal: null,
    blockedWordIds: new Set(),
    xp: 0,
    badgeIds: new Set(),
    learningProfile: DEFAULT_PROFILE_ID,
  });

  // What the database is already known to hold. Every mutation below only touches React state; the
  // effects further down diff against these snapshots and write whatever actually changed. That
  // keeps Supabase calls out of the setState updaters — updaters must stay pure, and under React's
  // StrictMode they run twice, which for the two INSERT-backed tables meant duplicate rows in dev.
  // It also coalesces writes: a stage change plus a score change on the same word in one handler
  // used to be two round trips to the same row, and is now one.
  const persistedWords = useRef<Record<string, WordState>>({});
  const persistedFormatStats = useRef<Record<string, FormatStat>>({});
  const persistedMeta = useRef<MetaSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      try {
        // Ensures the access token is refreshed before the burst of queries below —
        // avoids a race where a token that's expired-but-not-yet-refreshed (e.g. after
        // the tab was suspended in the background) causes the very first requests to 401.
        await supabase.auth.getSession();
        const [wp, fs, sh, th, meta] = await Promise.all([
          supabase.from("word_progress").select("*").eq("user_id", userId),
          supabase.from("format_stats").select("*").eq("user_id", userId),
          supabase
            .from("session_history")
            .select("*")
            .eq("user_id", userId)
            .order("occurred_at", { ascending: true })
            .limit(200),
          supabase.from("test_history").select("*").eq("user_id", userId).order("occurred_at", { ascending: true }).limit(100),
          supabase.from("app_meta").select("*").eq("user_id", userId).maybeSingle(),
        ]);
        if (wp.error) throw wp.error;
        if (fs.error) throw fs.error;
        if (sh.error) throw sh.error;
        // Tests are a later addition — an account whose database hasn't run migration 0009 yet
        // should still load its vocabulary progress rather than fall into the error screen.
        if (th.error) console.error("test_history unavailable", th.error);

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
            hintsUsed: row.hints_used || 0,
            masteredAt: row.mastered_at ? new Date(row.mastered_at).getTime() : null,
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

        const testHistory: TestRecord[] = (th.data || []).map((row) => ({
          date: new Date(row.occurred_at).getTime(),
          scope: row.scope,
          total: row.total,
          correct: row.correct,
          accuracy: row.accuracy,
          grade: Number(row.grade),
          durationSeconds: row.duration_seconds || 0,
        }));

        if (cancelled) return;
        const loaded: StoreShape = {
          words,
          formatStats,
          sessionHistory,
          testHistory,
          totalPracticeSessions: meta.data ? meta.data.total_practice_sessions : 0,
          goalStartedAt: meta.data?.goal_started_at ? new Date(meta.data.goal_started_at).getTime() : null,
          goalBaselineTotal: meta.data?.goal_baseline_total ?? null,
          blockedWordIds: new Set(meta.data?.blocked_word_ids || []),
          xp: meta.data?.xp ?? 0,
          badgeIds: new Set(meta.data?.badge_ids || []),
          // An account whose database hasn't run migration 0010 yet (column missing from the
          // select result) falls back to the same default the column itself defaults to, same
          // reasoning as the test_history soft-fail above.
          learningProfile: isLearningProfileId(meta.data?.learning_profile) ? meta.data.learning_profile : DEFAULT_PROFILE_ID,
        };
        // Seed the "already persisted" snapshots before the state lands, so the diffing effects
        // don't read freshly loaded data as unsaved changes and write the whole account straight
        // back to the database.
        persistedWords.current = loaded.words;
        persistedFormatStats.current = loaded.formatStats;
        persistedMeta.current = metaSnapshot(loaded);
        setState(loaded);
        setReady(true);
      } catch (e) {
        console.error("Supabase init failed", e);
        if (cancelled) return;
        if (isAuthError(e)) {
          // Stale/invalid session — sign out so the user lands back on a working
          // login screen instead of a dead "could not connect" error.
          try {
            await supabase.auth.signOut();
          } catch (signOutErr) {
            console.error("Sign-out after auth error failed", signOutErr);
          }
          return;
        }
        setError(e instanceof Error ? e.message : "Could not connect to Supabase.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const wordState = useCallback(
    (id: string): WordState => state.words[id] || blankWordState(),
    [state.words]
  );

  // ---------- Persistence: diff the state against what the database already has ----------

  useEffect(() => {
    if (!ready) return;
    const previous = persistedWords.current;
    persistedWords.current = state.words;
    for (const [id, w] of Object.entries(state.words)) {
      if (previous[id] === w) continue;
      supabase
        .from("word_progress")
        .upsert(wordRow(userId, id, w), { onConflict: "user_id,word_id" })
        .then(({ error: err }) => {
          if (err) console.error("persistWord", err);
        });
    }
  }, [state.words, ready, userId]);

  useEffect(() => {
    if (!ready) return;
    const previous = persistedFormatStats.current;
    persistedFormatStats.current = state.formatStats;
    for (const [format, s] of Object.entries(state.formatStats)) {
      if (previous[format] === s) continue;
      supabase
        .from("format_stats")
        .upsert({ user_id: userId, format, correct: s.correct, almost: s.almost, incorrect: s.incorrect }, { onConflict: "user_id,format" })
        .then(({ error: err }) => {
          if (err) console.error("recordFormatStat", err);
        });
    }
  }, [state.formatStats, ready, userId]);

  useEffect(() => {
    if (!ready) return;
    const previous = persistedMeta.current;
    const next = metaSnapshot(state);
    persistedMeta.current = next;
    if (!previous) return;

    const patch: Record<string, unknown> = {};
    if (next.totalPracticeSessions !== previous.totalPracticeSessions) patch.total_practice_sessions = next.totalPracticeSessions;
    if (next.goalStartedAt !== previous.goalStartedAt) patch.goal_started_at = next.goalStartedAt ? new Date(next.goalStartedAt).toISOString() : null;
    if (next.goalBaselineTotal !== previous.goalBaselineTotal) patch.goal_baseline_total = next.goalBaselineTotal;
    if (next.blockedWordIds !== previous.blockedWordIds) patch.blocked_word_ids = [...next.blockedWordIds];
    if (next.xp !== previous.xp) patch.xp = next.xp;
    if (next.badgeIds !== previous.badgeIds) patch.badge_ids = [...next.badgeIds];
    if (next.learningProfile !== previous.learningProfile) patch.learning_profile = next.learningProfile;
    if (Object.keys(patch).length === 0) return;

    supabase
      .from("app_meta")
      .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
      .then(({ error: err }) => {
        if (err) console.error("app_meta", err);
      });
  }, [state, ready, userId]);

  // ---------- Mutations: pure state updates, persisted by the effects above ----------

  const updateWord = useCallback((id: string, result: AnswerResultKind, hintsUsed = 0) => {
    setState((prev) => {
      const w = { ...(prev.words[id] || blankWordState()) };
      w.timesSeen++;
      w.lastSeen = Date.now();
      w.hintsUsed += hintsUsed;
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
      return { ...prev, words: { ...prev.words, [id]: w } };
    });
  }, []);

  const recordFormatStat = useCallback((format: string, result: AnswerResultKind) => {
    setState((prev) => {
      const s = { ...(prev.formatStats[format] || { correct: 0, almost: 0, incorrect: 0 }) };
      s[result]++;
      return { ...prev, formatStats: { ...prev.formatStats, [format]: s } };
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => {
      const w = { ...(prev.words[id] || blankWordState()) };
      w.favorite = !w.favorite;
      return { ...prev, words: { ...prev.words, [id]: w } };
    });
  }, []);

  const setLearningStage = useCallback((id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => {
    setState((prev) => {
      const w = { ...(prev.words[id] || blankWordState()) };
      const justMastered = stage === 4 && w.stage !== 4;
      w.stage = stage;
      w.reviewStreak = reviewStreak;
      w.dueAtSession = dueAtSession;
      if (justMastered && w.masteredAt === null) w.masteredAt = Date.now();
      return { ...prev, words: { ...prev.words, [id]: w } };
    });
  }, []);

  // The two history tables are append-only, so their rows are inserted straight from the argument
  // rather than diffed — but still outside the updater, which must not run a side effect twice.
  const recordSession = useCallback(
    (session: SessionRecord) => {
      supabase
        .from("session_history")
        .insert({
          user_id: userId,
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
      setState((prev) => ({
        ...prev,
        sessionHistory: [...prev.sessionHistory, session],
        totalPracticeSessions: (prev.totalPracticeSessions || 0) + 1,
      }));
    },
    [userId]
  );

  const recordTest = useCallback(
    (test: TestRecord) => {
      supabase
        .from("test_history")
        .insert({
          user_id: userId,
          occurred_at: new Date(test.date).toISOString(),
          scope: test.scope,
          total: test.total,
          correct: test.correct,
          accuracy: test.accuracy,
          grade: test.grade,
          duration_seconds: test.durationSeconds,
        })
        .then(({ error: err }) => {
          if (err) console.error("recordTest", err);
        });
      setState((prev) => ({ ...prev, testHistory: [...prev.testHistory, test] }));
    },
    [userId]
  );

  // Deliberately called once per finished session/test with the whole payout, not once per answer:
  // XP is displayed live from the session's own running total, so persisting it mid-session would
  // only add a database write per question without changing anything the learner sees.
  const addXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const unlockBadges = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setState((prev) => {
      const next = new Set(prev.badgeIds);
      ids.forEach((id) => next.add(id));
      // Identity has to stay stable when nothing was actually added, or the meta effect would see
      // a "change" and write on every evaluation.
      if (next.size === prev.badgeIds.size) return prev;
      return { ...prev, badgeIds: next };
    });
  }, []);

  const startGoalIfNeeded = useCallback((baselineTotal: number) => {
    setState((prev) => {
      if (prev.goalStartedAt !== null) return prev;
      return { ...prev, goalStartedAt: Date.now(), goalBaselineTotal: baselineTotal };
    });
  }, []);

  const setWordBlocked = useCallback((id: string, blocked: boolean) => {
    setState((prev) => {
      if (prev.blockedWordIds.has(id) === blocked) return prev;
      const next = new Set(prev.blockedWordIds);
      if (blocked) next.add(id);
      else next.delete(id);
      return { ...prev, blockedWordIds: next };
    });
  }, []);

  const setLearningProfile = useCallback((id: LearningProfileId) => {
    setState((prev) => (prev.learningProfile === id ? prev : { ...prev, learningProfile: id }));
  }, []);

  const api: StoreApi = useMemo(
    () => ({
      ready,
      error,
      words: state.words,
      formatStats: state.formatStats,
      sessionHistory: state.sessionHistory,
      testHistory: state.testHistory,
      totalPracticeSessions: state.totalPracticeSessions,
      goalStartedAt: state.goalStartedAt,
      goalBaselineTotal: state.goalBaselineTotal,
      blockedWordIds: state.blockedWordIds,
      xp: state.xp,
      badgeIds: state.badgeIds,
      learningProfile: state.learningProfile,
      wordState,
      updateWord,
      recordFormatStat,
      toggleFavorite,
      recordSession,
      recordTest,
      setLearningStage,
      startGoalIfNeeded,
      setWordBlocked,
      addXp,
      unlockBadges,
      setLearningProfile,
    }),
    [
      ready,
      error,
      state,
      wordState,
      updateWord,
      recordFormatStat,
      toggleFavorite,
      recordSession,
      recordTest,
      setLearningStage,
      startGoalIfNeeded,
      setWordBlocked,
      addXp,
      unlockBadges,
      setLearningProfile,
    ]
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
