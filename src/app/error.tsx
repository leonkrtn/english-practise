"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Without one, a render error anywhere in AppShell leaves a blank
 * screen with no way back — and since the whole session state lives in memory, the learner has no
 * idea whether their answers were saved. Progress is written per answer, so `reset()` genuinely
 * recovers: it remounts the tree, which re-reads everything from Supabase.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled render error", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="w-full max-w-[380px] bg-card border border-line-soft rounded-[18px] p-6 shadow-sm text-center">
        <h1 className="text-[17px] font-semibold text-ink">Something went wrong</h1>
        <p className="text-sm text-ink-soft leading-relaxed mt-2">
          Your progress is safe — it is saved after every answer. Only the session you were in cannot be resumed.
        </p>
        <Button
          onClick={reset}
          className="mt-5 h-auto w-full rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3.5 text-[15px] flex items-center justify-center gap-2"
        >
          <RotateCcw size={15} /> Reload
        </Button>
      </div>
    </div>
  );
}
