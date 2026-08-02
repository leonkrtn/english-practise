"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isAuthError, supabase } from "./supabase";
import { blankGrammarRuleState, type GrammarFormatStat, type GrammarRuleState, type GrammarSessionRecord } from "./grammarTypes";
import type { AnswerResultKind, LearningStage } from "./types";
import { enqueueWrite, flushQueue, loadSnapshot, pendingCount, saveSnapshot } from "./offlineSync";

interface GrammarStoreShape {
  rules: Record<string, GrammarRuleState>;
  formatStats: Record<string, GrammarFormatStat>;
  sessionHistory: GrammarSessionRecord[];
  totalPracticeSessions: number;
  blockedRuleIds: Set<string>;
}

interface GrammarStoreApi {
  ready: boolean;
  error: string | null;
  /** See StoreApi.offline (store.tsx) — same meaning, mirrored for grammar progress. */
  offline: boolean;
  pendingSync: number;
  rules: Record<string, GrammarRuleState>;
  formatStats: Record<string, GrammarFormatStat>;
  sessionHistory: GrammarSessionRecord[];
  totalPracticeSessions: number;
  blockedRuleIds: Set<string>;
  ruleState: (id: string) => GrammarRuleState;
  updateRule: (id: string, result: AnswerResultKind, hintsUsed?: number) => void;
  recordFormatStat: (format: string, result: AnswerResultKind) => void;
  setLearningStage: (id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => void;
  recordSession: (session: GrammarSessionRecord) => void;
  setRuleBlocked: (id: string, blocked: boolean) => void;
}

const GrammarStoreContext = createContext<GrammarStoreApi | null>(null);

/** The slice living in the single `grammar_meta` row — diffed as a unit, written as one upsert. */
type GrammarMetaSnapshot = Pick<GrammarStoreShape, "totalPracticeSessions" | "blockedRuleIds">;

/** JSON-safe mirror of GrammarStoreShape — see the equivalent in store.tsx. */
type SerializedGrammarStoreShape = Omit<GrammarStoreShape, "blockedRuleIds"> & { blockedRuleIds: string[] };

function serializeSnapshot(s: GrammarStoreShape): SerializedGrammarStoreShape {
  return { ...s, blockedRuleIds: [...s.blockedRuleIds] };
}

function deserializeSnapshot(s: SerializedGrammarStoreShape): GrammarStoreShape {
  return { ...s, blockedRuleIds: new Set(s.blockedRuleIds || []) };
}

function ruleRow(userId: string, id: string, s: GrammarRuleState) {
  return {
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
    mastered_at: s.masteredAt ? new Date(s.masteredAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

/** Grammar progress, kept entirely separate from vocabulary progress (own tables, own session clock). */
export function GrammarStoreProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const namespace = `grammar:${userId}`;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const refreshPendingSync = useCallback(() => setPendingSync(pendingCount(namespace)), [namespace]);
  const [state, setState] = useState<GrammarStoreShape>({ rules: {}, formatStats: {}, sessionHistory: [], totalPracticeSessions: 0, blockedRuleIds: new Set() });

  // Mirrors the vocabulary store: mutations stay pure, the effects below diff against what the
  // database is known to hold and write only what changed. See store.tsx for the full reasoning.
  const persistedRules = useRef<Record<string, GrammarRuleState>>({});
  const persistedFormatStats = useRef<Record<string, GrammarFormatStat>>({});
  const persistedMeta = useRef<GrammarMetaSnapshot | null>(null);

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
            masteredAt: row.mastered_at ? new Date(row.mastered_at).getTime() : null,
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
        const loaded: GrammarStoreShape = {
          rules,
          formatStats,
          sessionHistory,
          totalPracticeSessions: meta.data ? meta.data.total_practice_sessions : 0,
          blockedRuleIds: new Set(meta.data?.blocked_rule_ids || []),
        };
        persistedRules.current = loaded.rules;
        persistedFormatStats.current = loaded.formatStats;
        persistedMeta.current = { totalPracticeSessions: loaded.totalPracticeSessions, blockedRuleIds: loaded.blockedRuleIds };
        setState(loaded);
        setOffline(false);
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
        // Same offline fallback as the vocabulary store: fall back to the last locally cached
        // snapshot instead of a dead end, and queue writes from here for replay once reconnected.
        const cached = loadSnapshot<SerializedGrammarStoreShape>(namespace);
        if (cached) {
          const loaded = deserializeSnapshot(cached);
          persistedRules.current = loaded.rules;
          persistedFormatStats.current = loaded.formatStats;
          persistedMeta.current = { totalPracticeSessions: loaded.totalPracticeSessions, blockedRuleIds: loaded.blockedRuleIds };
          setState(loaded);
          setOffline(true);
          refreshPendingSync();
          setReady(true);
          return;
        }
        setError(e instanceof Error ? e.message : "Could not load grammar progress.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, namespace, refreshPendingSync]);

  useEffect(() => {
    if (!ready) return;
    saveSnapshot(namespace, serializeSnapshot(state));
  }, [state, ready, namespace]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    async function tryFlush() {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const { remaining } = await flushQueue(namespace, supabase);
      if (cancelled) return;
      refreshPendingSync();
      if (remaining === 0) setOffline(false);
    }
    tryFlush();
    window.addEventListener("online", tryFlush);
    return () => {
      cancelled = true;
      window.removeEventListener("online", tryFlush);
    };
  }, [ready, namespace, refreshPendingSync]);

  const ruleState = useCallback((id: string): GrammarRuleState => state.rules[id] || blankGrammarRuleState(), [state.rules]);

  // ---------- Persistence: diff the state against what the database already has ----------

  useEffect(() => {
    if (!ready) return;
    const previous = persistedRules.current;
    persistedRules.current = state.rules;
    for (const [id, r] of Object.entries(state.rules)) {
      if (previous[id] === r) continue;
      const row = ruleRow(userId, id, r);
      supabase
        .from("grammar_progress")
        .upsert(row, { onConflict: "user_id,rule_id" })
        .then(({ error: err }) => {
          if (!err) return;
          console.error("persistRule", err);
          enqueueWrite(namespace, { table: "grammar_progress", mode: "upsert", values: row, onConflict: "user_id,rule_id", dedupeKey: id });
          setOffline(true);
          refreshPendingSync();
        });
    }
  }, [state.rules, ready, userId, namespace, refreshPendingSync]);

  useEffect(() => {
    if (!ready) return;
    const previous = persistedFormatStats.current;
    persistedFormatStats.current = state.formatStats;
    for (const [format, f] of Object.entries(state.formatStats)) {
      if (previous[format] === f) continue;
      const row = { user_id: userId, format, correct: f.correct, almost: f.almost, incorrect: f.incorrect };
      supabase
        .from("grammar_format_stats")
        .upsert(row, { onConflict: "user_id,format" })
        .then(({ error: err }) => {
          if (!err) return;
          console.error("grammar recordFormatStat", err);
          enqueueWrite(namespace, { table: "grammar_format_stats", mode: "upsert", values: row, onConflict: "user_id,format", dedupeKey: format });
          setOffline(true);
          refreshPendingSync();
        });
    }
  }, [state.formatStats, ready, userId, namespace, refreshPendingSync]);

  useEffect(() => {
    if (!ready) return;
    const previous = persistedMeta.current;
    const next: GrammarMetaSnapshot = { totalPracticeSessions: state.totalPracticeSessions, blockedRuleIds: state.blockedRuleIds };
    persistedMeta.current = next;
    if (!previous) return;

    const patch: Record<string, unknown> = {};
    if (next.totalPracticeSessions !== previous.totalPracticeSessions) patch.total_practice_sessions = next.totalPracticeSessions;
    if (next.blockedRuleIds !== previous.blockedRuleIds) patch.blocked_rule_ids = [...next.blockedRuleIds];
    if (Object.keys(patch).length === 0) return;

    const row = { user_id: userId, ...patch };
    supabase
      .from("grammar_meta")
      .upsert(row, { onConflict: "user_id" })
      .then(({ error: err }) => {
        if (!err) return;
        console.error("grammar_meta", err);
        enqueueWrite(namespace, { table: "grammar_meta", mode: "upsert", values: row, onConflict: "user_id", dedupeKey: "grammar_meta" });
        setOffline(true);
        refreshPendingSync();
      });
  }, [state.totalPracticeSessions, state.blockedRuleIds, ready, userId, namespace, refreshPendingSync]);

  // ---------- Mutations: pure state updates, persisted by the effects above ----------

  const updateRule = useCallback((id: string, result: AnswerResultKind, hintsUsed = 0) => {
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
      return { ...prev, rules: { ...prev.rules, [id]: s } };
    });
  }, []);

  const recordFormatStat = useCallback((format: string, result: AnswerResultKind) => {
    setState((prev) => {
      const s = { ...(prev.formatStats[format] || { correct: 0, almost: 0, incorrect: 0 }) };
      s[result]++;
      return { ...prev, formatStats: { ...prev.formatStats, [format]: s } };
    });
  }, []);

  const setLearningStage = useCallback((id: string, stage: LearningStage, reviewStreak: number, dueAtSession: number | null) => {
    setState((prev) => {
      const s = { ...(prev.rules[id] || blankGrammarRuleState()) };
      const justMastered = stage === 4 && s.stage !== 4;
      s.stage = stage;
      s.reviewStreak = reviewStreak;
      s.dueAtSession = dueAtSession;
      if (justMastered && s.masteredAt === null) s.masteredAt = Date.now();
      return { ...prev, rules: { ...prev.rules, [id]: s } };
    });
  }, []);

  // Append-only table, so the row is inserted straight from the argument — but still outside the
  // updater, which must not run a side effect twice.
  const recordSession = useCallback(
    (session: GrammarSessionRecord) => {
      const row = {
        user_id: userId,
        occurred_at: new Date(session.date).toISOString(),
        total: session.total,
        correct: session.correct,
        almost: session.almost,
        incorrect: session.incorrect,
        accuracy: session.accuracy,
        format: session.format,
      };
      supabase
        .from("grammar_session_history")
        .insert(row)
        .then(({ error: err }) => {
          if (!err) return;
          console.error("grammar recordSession", err);
          enqueueWrite(namespace, { table: "grammar_session_history", mode: "insert", values: row });
          setOffline(true);
          refreshPendingSync();
        });
      setState((prev) => ({
        ...prev,
        sessionHistory: [...prev.sessionHistory, session],
        totalPracticeSessions: (prev.totalPracticeSessions || 0) + 1,
      }));
    },
    [userId, namespace, refreshPendingSync]
  );

  const setRuleBlocked = useCallback((id: string, blocked: boolean) => {
    setState((prev) => {
      if (prev.blockedRuleIds.has(id) === blocked) return prev;
      const next = new Set(prev.blockedRuleIds);
      if (blocked) next.add(id);
      else next.delete(id);
      return { ...prev, blockedRuleIds: next };
    });
  }, []);

  const api: GrammarStoreApi = useMemo(
    () => ({
      ready,
      error,
      offline,
      pendingSync,
      rules: state.rules,
      formatStats: state.formatStats,
      sessionHistory: state.sessionHistory,
      totalPracticeSessions: state.totalPracticeSessions,
      blockedRuleIds: state.blockedRuleIds,
      ruleState,
      updateRule,
      recordFormatStat,
      setLearningStage,
      recordSession,
      setRuleBlocked,
    }),
    [ready, error, offline, pendingSync, state, ruleState, updateRule, recordFormatStat, setLearningStage, recordSession, setRuleBlocked]
  );

  return <GrammarStoreContext.Provider value={api}>{children}</GrammarStoreContext.Provider>;
}

export function useGrammarStore(): GrammarStoreApi {
  const ctx = useContext(GrammarStoreContext);
  if (!ctx) throw new Error("useGrammarStore must be used within GrammarStoreProvider");
  return ctx;
}
