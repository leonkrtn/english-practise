"use client";

import { useEffect, useState } from "react";

export type FeedbackResultKind = "correct" | "almost" | "incorrect";

const STORAGE_KEY = "soundMuted";

let ctx: AudioContext | null = null;
let muted = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1";
const listeners = new Set<(muted: boolean) => void>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  listeners.forEach((l) => l(muted));
}

export function toggleMuted() {
  setMuted(!muted);
}

function onMuteChange(fn: (muted: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Subscribes a component to the current mute state; returns [muted, toggle]. */
export function useSoundMuted(): [boolean, () => void] {
  const [state, setState] = useState(muted);
  useEffect(() => onMuteChange(setState), []);
  return [state, toggleMuted];
}

function tone(freq: number, startTime: number, duration: number, type: OscillatorType, peak: number, audioCtx: AudioContext) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function playChime(freqs: number[], spacing: number, peak = 0.18) {
  if (muted) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  freqs.forEach((f, i) => tone(f, now + i * spacing, 0.22, "sine", peak, audioCtx));
}

function playBuzz() {
  if (muted) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  tone(196, now, 0.16, "sawtooth", 0.1, audioCtx);
  tone(146, now + 0.09, 0.22, "sawtooth", 0.1, audioCtx);
}

/** Bright ascending major arpeggio — the "you got it right" ding. */
export function playCorrect() {
  playChime([523.25, 659.25, 783.99], 0.08);
}

/** Softer, neutral two-note chime for a close-but-not-quite answer. */
export function playAlmost() {
  playChime([392, 440], 0.09, 0.14);
}

/** Low descending buzz — the "that was wrong" sound. */
export function playIncorrect() {
  playBuzz();
}

export function playFeedbackSound(result: FeedbackResultKind) {
  if (result === "correct") playCorrect();
  else if (result === "almost") playAlmost();
  else playIncorrect();
}
