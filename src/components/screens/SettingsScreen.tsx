"use client";

import { useMemo } from "react";
import { GRAMMAR_RULES } from "@/lib/grammar-data";
import { useGrammarStore } from "@/lib/grammarStore";

export default function SettingsScreen() {
  const grammarStore = useGrammarStore();

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof GRAMMAR_RULES>();
    GRAMMAR_RULES.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return [...map.entries()];
  }, []);

  return (
    <section className="animate-fade-in pb-4">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">Settings</h1>
      <p className="text-ink-soft text-[14px] mb-5 leading-snug">
        Blockierte Regeln tauchen nirgendwo mehr auf — weder beim Grammatik-Lernen, bei &quot;Gelerntes wiederholen&quot; noch als
        Pflichtgrammatik beim Schreiben.
      </p>

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
