"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";
import { memoRule, setCustomMemoContent, type CustomMemoSet, type MemoFact, type MemoRule } from "./memo";

/** What the editor collects for one card. */
export interface CustomCardInput {
  title: string;
  statement: string;
  explanation: string;
  facts: MemoFact[];
}

interface CustomMemoApi {
  ready: boolean;
  /** True when the database hasn't run migration 0012 — the mode still works, minus own sets. */
  unavailable: boolean;
  sets: CustomMemoSet[];
  /** Bumped on every change; components that read the memo registry take this as a memo dependency. */
  version: number;
  cardsForSet: (setId: string) => MemoRule[];
  createSet: (label: string) => Promise<string | null>;
  renameSet: (setId: string, label: string) => Promise<void>;
  deleteSet: (setId: string) => Promise<void>;
  createCard: (setId: string, input: CustomCardInput) => Promise<void>;
  updateCard: (cardId: string, input: CustomCardInput) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

const CustomMemoContext = createContext<CustomMemoApi | null>(null);

interface CardRow {
  id: string;
  set_id: string;
  title: string;
  statement: string;
  explanation: string;
  facts: MemoFact[] | null;
  position: number;
}

/**
 * A card id has to exist before its row does: the learner can answer a card the moment it is
 * created, and that answer is written to word_progress under this id. Generating it client-side
 * keeps content and progress in step even if the insert is still in flight.
 */
const newCardId = () => "custom:" + crypto.randomUUID();

function toRule(row: CardRow): MemoRule {
  return memoRule({
    id: row.id,
    setId: row.set_id,
    category: "My cards",
    title: row.title,
    statement: row.statement,
    explanation: row.explanation ?? "",
    facts: row.facts ?? [],
    custom: true,
  });
}

/** The learner's own rule sets: content only — their progress lives in word_progress like everything else. */
interface Content {
  sets: CustomMemoSet[];
  rules: MemoRule[];
  /** Bumped on every applied change — see CustomMemoApi.version. */
  version: number;
}

export function CustomMemoProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [content, setContent] = useState<Content>({ sets: [], rules: [], version: 0 });

  // The registry the session builder reads is module-level, so every change has to reach two places
  // at once. The ref is what mutations compute from: it is current immediately, whereas `content`
  // is a render away, and two edits in one tick would otherwise both build on the older list.
  const contentRef = useRef(content);
  const apply = useCallback((next: Omit<Content, "version">) => {
    const merged = { ...next, version: contentRef.current.version + 1 };
    contentRef.current = merged;
    setCustomMemoContent(merged.sets, merged.rules);
    setContent(merged);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, c] = await Promise.all([
        supabase.from("custom_memo_sets").select("id,label").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase
          .from("custom_memo_cards")
          .select("id,set_id,title,statement,explanation,facts,position")
          .eq("user_id", userId)
          .order("position", { ascending: true }),
      ]);
      if (cancelled) return;
      // Own sets are a later addition — an account whose database hasn't run migration 0012 keeps
      // the built-in sets rather than losing the whole Rules mode.
      if (s.error || c.error) {
        console.error("custom_memo unavailable", s.error ?? c.error);
        setUnavailable(true);
        setReady(true);
        return;
      }
      apply({
        sets: (s.data ?? []).map((row) => ({ id: row.id as string, label: row.label as string })),
        rules: (c.data ?? []).map((row) => toRule(row as CardRow)),
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, apply]);

  const { sets, rules, version } = content;

  const createSet = useCallback(
    async (label: string) => {
      const id = crypto.randomUUID();
      const { error } = await supabase.from("custom_memo_sets").insert({ id, user_id: userId, label });
      if (error) {
        console.error("createSet", error);
        return null;
      }
      apply({ ...contentRef.current, sets: [...contentRef.current.sets, { id, label }] });
      return id;
    },
    [userId, apply]
  );

  const renameSet = useCallback(async (setId: string, label: string) => {
    const { error } = await supabase.from("custom_memo_sets").update({ label, updated_at: new Date().toISOString() }).eq("id", setId);
    if (error) return console.error("renameSet", error);
    apply({ ...contentRef.current, sets: contentRef.current.sets.map((s) => (s.id === setId ? { ...s, label } : s)) });
  }, [apply]);

  const deleteSet = useCallback(async (setId: string) => {
    const { error } = await supabase.from("custom_memo_sets").delete().eq("id", setId);
    if (error) return console.error("deleteSet", error);
    apply({
      sets: contentRef.current.sets.filter((s) => s.id !== setId),
      rules: contentRef.current.rules.filter((r) => r.setId !== setId),
    });
  }, [apply]);

  const createCard = useCallback(
    async (setId: string, input: CustomCardInput) => {
      const id = newCardId();
      const row = {
        id,
        set_id: setId,
        user_id: userId,
        title: input.title,
        statement: input.statement,
        explanation: input.explanation,
        facts: input.facts,
        position: contentRef.current.rules.filter((r) => r.setId === setId).length,
      };
      const { error } = await supabase.from("custom_memo_cards").insert(row);
      if (error) return console.error("createCard", error);
      apply({ ...contentRef.current, rules: [...contentRef.current.rules, toRule(row as CardRow)] });
    },
    [userId, apply]
  );

  const updateCard = useCallback(async (cardId: string, input: CustomCardInput) => {
    const { error } = await supabase
      .from("custom_memo_cards")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", cardId);
    if (error) return console.error("updateCard", error);
    apply({ ...contentRef.current, rules: contentRef.current.rules.map((r) => (r.id === cardId ? { ...r, ...input } : r)) });
  }, [apply]);

  const deleteCard = useCallback(async (cardId: string) => {
    const { error } = await supabase.from("custom_memo_cards").delete().eq("id", cardId);
    if (error) return console.error("deleteCard", error);
    apply({ ...contentRef.current, rules: contentRef.current.rules.filter((r) => r.id !== cardId) });
  }, [apply]);

  const cardsForSet = useCallback((setId: string) => rules.filter((r) => r.setId === setId), [rules]);

  const api: CustomMemoApi = useMemo(
    () => ({ ready, unavailable, sets, version, cardsForSet, createSet, renameSet, deleteSet, createCard, updateCard, deleteCard }),
    [ready, unavailable, sets, version, cardsForSet, createSet, renameSet, deleteSet, createCard, updateCard, deleteCard]
  );

  return <CustomMemoContext.Provider value={api}>{children}</CustomMemoContext.Provider>;
}

export function useCustomMemo(): CustomMemoApi {
  const ctx = useContext(CustomMemoContext);
  if (!ctx) throw new Error("useCustomMemo must be used within CustomMemoProvider");
  return ctx;
}
