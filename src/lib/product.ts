"use client";

import { useEffect, useState } from "react";

// Which top-level experience the learner is in — chosen once at the start and remembered, same
// client-only-preference pattern as sound.ts/mathSettings.ts. null = not chosen yet (show the chooser).
export type Product = "english" | "finance";

const STORAGE_KEY = "product";

function readStored(): Product | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "english" || raw === "finance" ? raw : null;
}

let product: Product | null = readStored();
const listeners = new Set<(p: Product | null) => void>();

export function setProduct(next: Product | null) {
  product = next;
  if (typeof window !== "undefined") {
    if (next) window.localStorage.setItem(STORAGE_KEY, next);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((l) => l(product));
}

/** Subscribes a component to the current product choice; returns [product, setProduct]. */
export function useProduct(): [Product | null, (next: Product | null) => void] {
  const [state, setState] = useState(product);
  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return [state, setProduct];
}
