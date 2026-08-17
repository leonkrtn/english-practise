"use client";

import { useEffect, useState } from "react";

// Client-only preference, same pattern as sound.ts's mute toggle — deliberately not synced through
// the store/Supabase, since it's a display preference rather than learning progress.
const STORAGE_KEY = "mathSolveEnabled";

let solveEnabled = typeof window === "undefined" || window.localStorage.getItem(STORAGE_KEY) !== "0";
const listeners = new Set<(enabled: boolean) => void>();

export function setMathSolveEnabled(next: boolean) {
  solveEnabled = next;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  listeners.forEach((l) => l(solveEnabled));
}

/** Subscribes a component to the "show Solve problems in Math mode" preference; returns [enabled, setEnabled]. */
export function useMathSolveEnabled(): [boolean, (next: boolean) => void] {
  const [state, setState] = useState(solveEnabled);
  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return [state, setMathSolveEnabled];
}
