"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, TriangleAlert, X } from "lucide-react";
import {
  MATH_DIFFICULTY_LABEL,
  MATH_RULES,
  MATH_TOPICS,
  MATH_TOPIC_META,
  type MathRule,
  type MathTopic,
} from "@/lib/math";
import { normalize } from "@/lib/utils";
import { useStore } from "@/lib/store";
import Formula from "@/components/Formula";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Searchable reference for every rule — open any time, no session required. */
export default function MathTheoryScreen({ onExit }: { onExit: () => void }) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<MathTopic | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = useMemo(() => {
    let list = MATH_RULES;
    if (topicFilter !== "all") list = list.filter((r) => r.topic === topicFilter);
    const q = normalize(query);
    if (q) {
      list = list.filter(
        (r) =>
          normalize(r.title).includes(q) ||
          normalize(r.explanation).includes(q) ||
          normalize(r.category).includes(q) ||
          normalize(MATH_TOPIC_META[r.topic].label).includes(q)
      );
    }
    return list;
  }, [query, topicFilter]);

  return (
    <section className="animate-fade-in pb-4">
      <div className="flex items-center gap-3 mb-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="Zurück"
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>Zurück</TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight leading-tight">Theorie</h1>
          <div className="text-[12.5px] text-ink-faint">{MATH_RULES.length} Regeln zum Nachschlagen</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 bg-card border-[1.5px] border-line rounded-xl px-3.5 py-2.5 mb-3">
        <Search size={16} className="text-ink-faint shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Regel, Thema oder Stichwort suchen…"
          className="h-auto flex-1 border-none bg-transparent text-[15px] outline-none text-ink p-0 focus-visible:ring-0 focus-visible:border-transparent"
        />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterChip active={topicFilter === "all"} onClick={() => setTopicFilter("all")}>
          Alle
        </FilterChip>
        {MATH_TOPICS.map((t) => (
          <FilterChip key={t} active={topicFilter === t} onClick={() => setTopicFilter(t)}>
            {MATH_TOPIC_META[t].label}
          </FilterChip>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 px-5 text-ink-faint text-sm">Keine Regel passt zur Suche.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {results.map((r) => (
            <TheoryCard
              key={r.id}
              rule={r}
              mastered={store.words[r.id]?.stage === 4}
              open={expanded === r.id}
              onToggle={() => setExpanded((cur) => (cur === r.id ? null : r.id))}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-colors " +
        (active ? "bg-ink text-white border-ink" : "border-line bg-card text-ink-soft hover:bg-line-soft")
      }
    >
      {children}
    </button>
  );
}

function TheoryCard({ rule, mastered, open, onToggle }: { rule: MathRule; mastered: boolean; open: boolean; onToggle: () => void }) {
  const meta = MATH_TOPIC_META[rule.topic];
  return (
    <div className="bg-card border border-line-soft rounded-2xl overflow-hidden">
      <button onClick={onToggle} aria-expanded={open} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-bg transition-colors">
        <span className={"w-1.5 h-10 rounded-full shrink-0 bg-gradient-to-b " + meta.grad} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14.5px] font-semibold text-ink">{rule.title}</span>
            {mastered && <span className="text-[10px] font-bold uppercase text-green bg-green-light rounded-full px-1.5 py-0.5">gelernt</span>}
          </div>
          <div className="text-[11.5px] text-ink-faint">
            {meta.label} · {MATH_DIFFICULTY_LABEL[rule.difficulty]}
          </div>
        </div>
        <ChevronDown size={16} className={"text-ink-faint shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="bg-bg rounded-xl p-4 mb-3 text-center overflow-x-auto">
            <Formula tex={rule.formulaTex} display className="text-[18px]" />
          </div>
          <p className="text-[14px] text-ink-soft leading-relaxed mb-3">{rule.explanation}</p>

          {rule.derivation && rule.derivation.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Herleitung</div>
              <div className="rounded-xl bg-bg p-3 flex flex-col gap-1.5 overflow-x-auto">
                {rule.derivation.map((l, i) => (
                  <Formula key={i} tex={l} className="text-[13.5px]" />
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Beispiele</div>
          <div className="flex flex-col gap-2 mb-3">
            {rule.examples.map((ex, i) => (
              <div key={i} className="bg-bg rounded-xl px-3.5 py-2.5 overflow-x-auto">
                <Formula tex={ex.problemTex} className="text-[14px]" />
                {ex.steps.map((s, j) => (
                  <div key={j} className="flex items-baseline gap-2 mt-1">
                    <span className="text-ink-faint text-[12px] shrink-0">=</span>
                    <Formula tex={s} className="text-[13.5px]" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {rule.pitfalls.length > 0 && (
            <div className="rounded-xl bg-red-light/40 ring-1 ring-inset ring-red/15 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-bold text-red mb-1.5">
                <TriangleAlert size={12} /> Typische Fehler
              </div>
              <ul className="flex flex-col gap-1.5">
                {rule.pitfalls.map((p, i) => (
                  <li key={i} className="text-[13px] text-ink-soft leading-snug flex gap-2">
                    <span className="text-red shrink-0">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
