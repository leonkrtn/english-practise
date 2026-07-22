"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { GRAMMAR_RULES } from "@/lib/grammar-data";
import { useGrammarStore } from "@/lib/grammarStore";
import { useStore } from "@/lib/store";
import { VOCAB_BY_ID } from "@/lib/vocab";

export default function SettingsScreen() {
  const store = useStore();
  const grammarStore = useGrammarStore();

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
      <p className="text-ink-soft text-[14px] mb-5 leading-snug">
        Blockierte Regeln tauchen nirgendwo mehr auf — weder beim Grammatik-Lernen, bei &quot;Gelerntes wiederholen&quot; noch als
        Pflichtgrammatik beim Schreiben.
      </p>

      <div className="mb-5">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Ausgeschlossene Wörter</h2>
        {blockedWords.length === 0 ? (
          <p className="text-ink-faint text-[13.5px]">
            Noch keine — mit dem Block-Symbol während einer Übung kannst du ein Wort dauerhaft ausschließen.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {blockedWords.map((w) => (
              <button
                key={w.id}
                onClick={() => store.setWordBlocked(w.id, false)}
                title="Wieder zulassen"
                className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line-soft bg-card px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-red/40 hover:text-red hover:bg-red-light transition-colors"
              >
                {w.en}
                <X size={12} />
              </button>
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
