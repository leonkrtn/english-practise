"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { isAuthError, supabase } from "./supabase";
import { blankGrammarRuleState, type GrammarFormatStat, type GrammarRuleState, type GrammarSessionRecord } from "./grammarTypes";
import type { AnswerResultKind, LearningStage } from "./types";

interface GrammarStoreShape {
  rules: Record<string, GrammarRuleState>;
  formatStats: Record<string, GrammarFormatStat>;
  sessionHistory: GrammarSessionRecord[];
  totalPracticeSessions: number;
}

interface GrammarStoreApi {
  ready: boolean;
  error: string | null;
  rules: Record<string, GrammarRuleState>;
  formatStats: Record<string, GrammarFormatStat>;
  sessionHistory: GrammarSessionRecord[];
  totalPracticeSessions: number;
  ruleState: (id: string) => GrammarRuleState;
  updateRule: (id: string, result: AnswerResultKind, hintsUsed?: number) => void;
  recordFormatStat: (format: string, result: AnswerResultKind) => void;
  setLearningStage: (id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => void;
  recordSession: (session: GrammarSessionRecord) => void;
}

const GrammarStoreContext = createContext<GrammarStoreApi | null>(null);

/** Grammar progress, kept entirely separate from vocabulary progress (own tables, own session clock). */
export function GrammarStoreProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<GrammarStoreShape>({ rules: {}, formatStats: {}, sessionHistory: [], totalPracticeSessions: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      try {
        // Ensures the access token is refreshed before the burst of queries below —
        // avoids a race where a token that's expired-but-not-yet-refreshed (e.g. after
        // the tab was suspended in the background) causes the very first requests to 401.
        await supabase.auth.getSession();
        const [rp, fs, sh, meta] = await Promise.all([
          supabase.from("grammar_progress").select("*").eq("user_id", userId),
          supabase.from("grammar_format_stats").select("*").eq("user_id", userId),
          supabase.from("grammar_session_history").select("*").eq("user_id", userId).order("occurred_at", { ascending: true }).limit(200),
          supabase.from("grammar_meta").select("*").eq("user_id", userId).maybeSingle(),
        ]);
        if (rp.error) throw rp.error;
        if (fs.error) throw fs.error;
        if (sh.error) throw sh.error;

        const rules: Record<string, GrammarRuleState> = {};
        (rp.data || []).forEach((row) => {
          rules[row.rule_id] = {
            stage: (row.stage ?? 0) as LearningStage,
            reviewStreak: row.review_streak || 0,
            dueAtSession: row.due_at_session ?? null,
            timesSeen: row.times_seen || 0,
            timesCorrect: row.times_correct || 0,
            timesIncorrect: row.times_incorrect || 0,
            timesAlmost: row.times_almost || 0,
            lastSeen: row.last_seen ? new Date(row.last_seen).getTime() : null,
            recentMistake: !!row.recent_mistake,
            streak: row.streak || 0,
            score: Number(row.score) || 0,
          };
        });

        const formatStats: Record<string, GrammarFormatStat> = {};
        (fs.data || []).forEach((row) => {
          formatStats[row.format] = { correct: row.correct || 0, almost: row.almost || 0, incorrect: row.incorrect || 0 };
        });

        const sessionHistory: GrammarSessionRecord[] = (sh.data || []).map((row) => ({
          date: new Date(row.occurred_at).getTime(),
          total: row.total,
          correct: row.correct,
          almost: row.almost,
          incorrect: row.incorrect,
          accuracy: row.accuracy,
          format: row.format,
        }));

        if (cancelled) return;
        setState({ rules, formatStats, sessionHistory, totalPracticeSessions: meta.data ? meta.data.total_practice_sessions : 0 });
        setReady(true);
      } catch (e) {
        console.error("Grammar store init failed", e);
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
        setError(e instanceof Error ? e.message : "Could not load grammar progress.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ruleState = useCallback((id: string): GrammarRuleState => state.rules[id] || blankGrammarRuleState(), [state.rules]);

  const persistRule = useCallback(
    (id: string, s: GrammarRuleState) => {
      supabase
        .from("grammar_progress")
        .upsert(
          {
            user_id: userId,
            rule_id: id,
            stage: s.stage,
            review_streak: s.reviewStreak,
            due_at_session: s.dueAtSession,
            times_seen: s.timesSeen,
            times_correct: s.timesCorrect,
            times_incorrect: s.timesIncorrect,
            times_almost: s.timesAlmost,
            last_seen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
            recent_mistake: s.recentMistake,
            streak: s.streak,
            score: s.score,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,rule_id" }
        )
        .then(({ error: err }) => {
          if (err) console.error("persistRule", err);
        });
    },
    [userId]
  );

  const updateRule = useCallback(
    (id: string, result: AnswerResultKind, hintsUsed = 0) => {
      setState((prev) => {
        const s = { ...(prev.rules[id] || blankGrammarRuleState()) };
        s.timesSeen++;
        s.lastSeen = Date.now();
        if (result === "correct") {
          s.timesCorrect++;
          s.streak++;
          const inc = hintsUsed > 0 ? 0.5 : 1;
          s.score = Math.min(5, s.score + inc);
          s.recentMistake = false;
        } else if (result === "almost") {
          s.timesAlmost++;
          s.streak = 0;
          s.score = Math.min(5, Math.max(1, s.score + 0.25));
          s.recentMistake = true;
        } else {
          s.timesIncorrect++;
          s.streak = 0;
          s.score = Math.max(0, s.score - 2);
          s.recentMistake = true;
        }
        persistRule(id, s);
        return { ...prev, rules: { ...prev.rules, [id]: s } };
      });
    },
    [persistRule]
  );

  const recordFormatStat = useCallback(
    (format: string, result: AnswerResultKind) => {
      setState((prev) => {
        const s = { ...(prev.formatStats[format] || { correct: 0, almost: 0, incorrect: 0 }) };
        s[result]++;
        supabase
          .from("grammar_format_stats")
          .upsert({ user_id: userId, format, correct: s.correct, almost: s.almost, incorrect: s.incorrect }, { onConflict: "user_id,format" })
          .then(({ error: err }) => {
            if (err) console.error("grammar recordFormatStat", err);
          });
        return { ...prev, formatStats: { ...prev.formatStats, [format]: s } };
      });
    },
    [userId]
  );

  const setLearningStage = useCallback(
    (id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => {
      setState((prev) => {
        const s = { ...(prev.rules[id] || blankGrammarRuleState()) };
        s.stage = stage;
        s.reviewStreak = reviewStreak;
        s.dueAtSession = dueAtSession;
        persistRule(id, s);
        return { ...prev, rules: { ...prev.rules, [id]: s } };
      });
    },
    [persistRule]
  );

  const recordSession = useCallback(
    (session: GrammarSessionRecord) => {
      setState((prev) => {
        const total = (prev.totalPracticeSessions || 0) + 1;
        supabase
          .from("grammar_session_history")
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
            if (err) console.error("grammar recordSession", err);
          });
        supabase
          .from("grammar_meta")
          .upsert({ user_id: userId, total_practice_sessions: total }, { onConflict: "user_id" })
          .then(({ error: err }) => {
            if (err) console.error("grammar_meta", err);
          });
        return { ...prev, sessionHistory: [...prev.sessionHistory, session], totalPracticeSessions: total };
      });
    },
    [userId]
  );

  const api: GrammarStoreApi = {
    ready,
    error,
    rules: state.rules,
    formatStats: state.formatStats,
    sessionHistory: state.sessionHistory,
    totalPracticeSessions: state.totalPracticeSessions,
    ruleState,
    updateRule,
    recordFormatStat,
    setLearningStage,
    recordSession,
  };

  return <GrammarStoreContext.Provider value={api}>{children}</GrammarStoreContext.Provider>;
}

export function useGrammarStore(): GrammarStoreApi {
  const ctx = useContext(GrammarStoreContext);
  if (!ctx) throw new Error("useGrammarStore must be used within GrammarStoreProvider");
  return ctx;
}
