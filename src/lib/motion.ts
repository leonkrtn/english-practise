"use client";

/** True when the user has asked the OS for reduced motion. Checked live rather than cached since it
 * can change while the app is open. The global rule in globals.css already collapses CSS
 * animations/transitions to near-zero under this setting, but it can't reach anime.js — that drives
 * duration through JS params, so anything built with it needs to check this itself. */
export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Scales an anime.js duration down to effectively zero under prefers-reduced-motion, otherwise
 * passes it through unchanged. Also fine to use for a `stagger()` per-item delay, which is really
 * just a small duration between items. */
export function motionMs(ms: number): number {
  return reducedMotion() ? 1 : ms;
}
