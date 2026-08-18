"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { GRAMMAR_RULES } from "@/lib/grammar-data";
import { useGrammarStore } from "@/lib/grammarStore";
import { useStore } from "@/lib/store";
import { VOCAB_BY_ID } from "@/lib/vocab";
import { Button } from "@/components/ui/button";
import { LEARNING_PROFILES, PROFILE_ORDER } from "@/lib/learningProfile";
import { useMathSolveEnabled } from "@/lib/mathSettings";

export default function SettingsScreen() {
  const store = useStore();
  const grammarStore = useGrammarStore();
  const [mathSolveEnabled, setMathSolveEnabled] = useMathSolveEnabled();
  // Account state (app_meta.learning_profile), same source of truth the session engine reads —
  // no separate client-only copy to keep in sync.
  const profile = store.learningProfile;

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof GRAMMAR_RULES>();
    GRAMMAR_RULES.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return [...map.entries()];
  }, []);

  const blockedWords = useMemo(
    () => [...store.blockedWordIds].map((id) => VOCAB_BY_ID[id]).filter(Boolean),
    [store.blockedWordIds]
  );

  return (
    <section className="animate-fade-in pb-4">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">Settings</h1>

      <div className="mb-6">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-1">Learning pace</h2>
        <p className="text-ink-soft text-[13.5px] mb-3 leading-snug">
          Controls how much a session takes on and how far apart two sightings of the same item sit. Applies from your next
          session.
        </p>
        <div className="flex flex-col gap-2">
          {PROFILE_ORDER.map((id) => {
            const tuning = LEARNING_PROFILES[id];
            const selected = profile === id;
            return (
              <button
                key={id}
                onClick={() => store.setLearningProfile(id)}
                aria-pressed={selected}
                className={
                  "text-left rounded-xl border-[1.5px] px-3.5 py-3 transition-colors " +
                  (selected ? "border-blue bg-blue-light" : "border-line-soft bg-card hover:border-line")
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={"text-[14px] font-semibold " + (selected ? "text-blue-dark" : "text-ink")}>{tuning.label}</span>
                  <span className="text-[12px] text-ink-faint shrink-0">
                    {tuning.vocabBatchSize} words · gap {tuning.minRepeatGap}+
                  </span>
                </div>
                <p className="text-[12.5px] text-ink-soft leading-snug mt-1">{tuning.summary}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Mathematics</h2>
        <div className="flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-line-soft bg-card px-3.5 py-3">
          <div>
            <div className="text-[14px] font-medium text-ink">Typed-answer exercises</div>
            <p className="text-[12.5px] text-ink-soft leading-snug mt-0.5">
              Exercises where you type the result yourself (Solve, Simplify, Step by step, Word problems). Switched off, only multiple
              choice and &quot;find the error&quot; remain.
            </p>
          </div>
          <Switch checked={mathSolveEnabled} onChange={setMathSolveEnabled} />
        </div>
      </div>

      <p className="text-ink-soft text-[14px] mb-5 leading-snug">
        Blocked rules disappear everywhere — from grammar practice, from &quot;review learned&quot;, and from the required grammar in
        writing tasks.
      </p>

      <div className="mb-5">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Excluded words</h2>
        {blockedWords.length === 0 ? (
          <p className="text-ink-faint text-[13.5px]">
            None yet — use the block icon during an exercise to exclude a word permanently.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {blockedWords.map((w) => (
              <Button
                key={w.id}
                onClick={() => store.setWordBlocked(w.id, false)}
                title="Allow again"
                variant="ghost"
                className="h-auto inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line-soft bg-card px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-red/40 hover:text-red hover:bg-red-light transition-colors"
              >
                {w.en}
                <X size={12} />
              </Button>
            ))}
          </div>
        )}
      </div>

      {byCategory.map(([category, rules]) => (
        <div key={category} className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">{category}</h2>
          <div className="flex flex-col gap-2">
            {rules.map((rule) => {
              const blocked = grammarStore.blockedRuleIds.has(rule.id);
              return (
                <div
                  key={rule.id}
                  className={
                    "flex items-center justify-between gap-3 rounded-xl border-[1.5px] px-3.5 py-3 transition-colors " +
                    (blocked ? "border-line-soft bg-bg opacity-60" : "border-line-soft bg-card")
                  }
                >
                  <span className="text-[14px] font-medium text-ink">{rule.title}</span>
                  <Switch checked={!blocked} onChange={(checked) => grammarStore.setRuleBlocked(rule.id, !checked)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "relative w-11 h-6 rounded-full shrink-0 transition-colors " + (checked ? "bg-gradient-to-r from-blue to-purple" : "bg-line")
      }
    >
      <span
        className={
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform " +
          (checked ? "translate-x-[22px]" : "translate-x-0.5")
        }
      />
    </button>
  );
}
