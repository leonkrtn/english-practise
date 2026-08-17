"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { enqueueWrite } from "./offlineSync";
import type { MathTestRecord } from "./mathTest";

/**
 * Math test history. A plain hook rather than a Provider: the data is append-only and read by
 * exactly two screens, so there is nothing to share through context.
 *
 * Soft-fails on every path. An account whose database has not run migration 0011 yet simply gets
 * an empty history and keeps full use of the rest of the Mathematics mode — the same tolerance
 * store.tsx already applies to test_history for migration 0009.
 */
export function useMathTestHistory(userId: string | null) {
  const [history, setHistory] = useState<MathTestRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        setHistory([]);
        setReady(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("math_test_history")
          .select("*")
          .eq("user_id", userId)
          .order("occurred_at", { ascending: true })
          .limit(100);
        if (cancelled) return;
        if (error) {
          console.error("math_test_history unavailable", error);
          setHistory([]);
        } else {
          setHistory(
            (data || []).map((row) => ({
              date: new Date(row.occurred_at).getTime(),
              scope: row.scope,
              points: Number(row.points) || 0,
              total: row.total,
              percent: row.percent,
              passed: !!row.passed,
              durationSeconds: row.duration_seconds || 0,
            }))
          );
        }
      } catch (e) {
        if (cancelled) return;
        console.error("math_test_history load failed", e);
        setHistory([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const recordTest = useCallback(
    (record: MathTestRecord) => {
      // Optimistic: the local list updates regardless, so the result and stats screens are correct
      // for this session even when the write is queued or the table is missing.
      setHistory((prev) => [...prev, record]);
      if (!userId) return;
      const row = {
        user_id: userId,
        occurred_at: new Date(record.date).toISOString(),
        scope: record.scope,
        points: record.points,
        total: record.total,
        percent: record.percent,
        passed: record.passed,
        duration_seconds: record.durationSeconds,
      };
      supabase
        .from("math_test_history")
        .insert(row)
        .then(({ error }) => {
          if (!error) return;
          console.error("recordMathTest", error);
          enqueueWrite(`vocab:${userId}`, { table: "math_test_history", mode: "insert", values: row });
        });
    },
    [userId]
  );

  return { history, ready, recordTest };
}
