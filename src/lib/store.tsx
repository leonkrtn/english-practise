"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
  toggleFavorite: (id: string) => boolean;
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
        setState({
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
        });
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

  const persistWord = useCallback(
    (id: string, w: WordState) => {
      supabase
        .from("word_progress")
        .upsert(
          {
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
          },
          { onConflict: "user_id,word_id" }
        )
        .then(({ error: err }) => {
          if (err) console.error("persistWord", err);
        });
    },
    [userId]
  );

  const updateWord = useCallback(
    (id: string, result: AnswerResultKind, hintsUsed = 0) => {
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
        persistWord(id, w);
        return { ...prev, words: { ...prev.words, [id]: w } };
      });
    },
    [persistWord]
  );

  const recordFormatStat = useCallback(
    (format: string, result: AnswerResultKind) => {
      setState((prev) => {
        const s = { ...(prev.formatStats[format] || { correct: 0, almost: 0, incorrect: 0 }) };
        s[result]++;
        supabase
          .from("format_stats")
          .upsert(
            { user_id: userId, format, correct: s.correct, almost: s.almost, incorrect: s.incorrect },
            { onConflict: "user_id,format" }
          )
          .then(({ error: err }) => {
            if (err) console.error("recordFormatStat", err);
          });
        return { ...prev, formatStats: { ...prev.formatStats, [format]: s } };
      });
    },
    [userId]
  );

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
        const justMastered = stage === 4 && w.stage !== 4;
        w.stage = stage;
        w.reviewStreak = reviewStreak;
        w.dueAtSession = dueAtSession;
        if (justMastered && w.masteredAt === null) w.masteredAt = Date.now();
        persistWord(id, w);
        return { ...prev, words: { ...prev.words, [id]: w } };
      });
    },
    [persistWord]
  );

  const recordSession = useCallback(
    (session: SessionRecord) => {
      setState((prev) => {
        const total = (prev.totalPracticeSessions || 0) + 1;
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
        supabase
          .from("app_meta")
          .upsert({ user_id: userId, total_practice_sessions: total }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("app_meta", err);
          });
        return { ...prev, sessionHistory: [...prev.sessionHistory, session], totalPracticeSessions: total };
      });
    },
    [userId]
  );

  const recordTest = useCallback(
    (test: TestRecord) => {
      setState((prev) => {
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
        return { ...prev, testHistory: [...prev.testHistory, test] };
      });
    },
    [userId]
  );

  // Deliberately called once per finished session/test with the whole payout, not once per answer:
  // XP is displayed live from the session's own running total, so persisting it mid-session would
  // only add a database write per question without changing anything the learner sees.
  const addXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      setState((prev) => {
        const xp = prev.xp + amount;
        supabase
          .from("app_meta")
          .upsert({ user_id: userId, xp }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("addXp", err);
          });
        return { ...prev, xp };
      });
    },
    [userId]
  );

  const unlockBadges = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      setState((prev) => {
        const next = new Set(prev.badgeIds);
        ids.forEach((id) => next.add(id));
        if (next.size === prev.badgeIds.size) return prev;
        supabase
          .from("app_meta")
          .upsert({ user_id: userId, badge_ids: [...next] }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("unlockBadges", err);
          });
        return { ...prev, badgeIds: next };
      });
    },
    [userId]
  );

  const startGoalIfNeeded = useCallback(
    (baselineTotal: number) => {
      setState((prev) => {
        if (prev.goalStartedAt !== null) return prev;
        const startedAt = Date.now();
        supabase
          .from("app_meta")
          .upsert(
            { user_id: userId, goal_started_at: new Date(startedAt).toISOString(), goal_baseline_total: baselineTotal },
            { onConflict: "user_id" }
          )
          .then(({ error: err }) => {
            if (err) console.error("startGoalIfNeeded", err);
          });
        return { ...prev, goalStartedAt: startedAt, goalBaselineTotal: baselineTotal };
      });
    },
    [userId]
  );

  const setWordBlocked = useCallback(
    (id: string, blocked: boolean) => {
      setState((prev) => {
        const next = new Set(prev.blockedWordIds);
        if (blocked) next.add(id);
        else next.delete(id);
        supabase
          .from("app_meta")
          .upsert({ user_id: userId, blocked_word_ids: [...next] }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("app_meta blocked_word_ids", err);
          });
        return { ...prev, blockedWordIds: next };
      });
    },
    [userId]
  );

  const setLearningProfile = useCallback(
    (id: LearningProfileId) => {
      setState((prev) => {
        supabase
          .from("app_meta")
          .upsert({ user_id: userId, learning_profile: id }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("setLearningProfile", err);
          });
        return { ...prev, learningProfile: id };
      });
    },
    [userId]
  );

  const api: StoreApi = {
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
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
