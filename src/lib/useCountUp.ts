"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 up to `target` over `durationMs`, easing out so it decelerates into the
 * final value instead of stopping dead. Used by every headline figure on the summary and result
 * screens — a number that counts up reads as something you *earned*, where the same number
 * appearing instantly reads as a fact about you.
 *
 * Driven by requestAnimationFrame rather than a timer so it stays in step with the display's
 * refresh rate and pauses automatically in a backgrounded tab. Under prefers-reduced-motion the
 * loop still runs, but with a zero duration — the first frame lands on the target, which keeps
 * this a single code path instead of a special case that writes state during the effect body.
 */
export function useCountUp(target: number, durationMs = 900, decimals = 0): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : durationMs;
    const start = performance.now();
    const factor = 10 ** decimals;

    function tick(now: number) {
      const t = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased * factor) / factor);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs, decimals]);

  return value;
}
