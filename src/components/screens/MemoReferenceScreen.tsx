"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, Search, X } from "lucide-react";
import { memoRules, memoSets, memoSetMeta, type MemoRule, type MemoSetId } from "@/lib/memo";
import { normalize } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { FactList, RuleHeadline } from "@/components/memo-exercises/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function filterRules(setFilter: MemoSetId | "all", query: string): MemoRule[] {
  let list = memoRules();
  if (setFilter !== "all") list = list.filter((r) => r.setId === setFilter);
  const q = normalize(query);
  if (!q) return list;
  return list.filter(
    (r) =>
      normalize(r.title).includes(q) ||
      normalize(r.statement).includes(q) ||
      normalize(r.explanation).includes(q) ||
      normalize(r.category).includes(q) ||
      r.facts.some((f) => normalize(f.label).includes(q) || normalize(f.value).includes(q))
  );
}

/** Searchable reference for every memorisable rule — open any time, no session required. */
export default function MemoReferenceScreen({ onExit }: { onExit: () => void }) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [setFilter, setSetFilter] = useState<MemoSetId | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Filtering a hundred-odd rules per keystroke is cheaper than memoising it: the pool lives in a
  // module registry the learner's own sets are pushed into, so a memo would need a hand-maintained
  // dependency on that registry's version to avoid going stale.
  const results = filterRules(setFilter, query);

  return (
    <section className="animate-fade-in pb-4">
      <div className="flex items-center gap-3 mb-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="Back"
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight leading-tight">Rule reference</h1>
          <div className="text-[12.5px] text-ink-faint">{memoRules().length} rules to look up</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 bg-card border-[1.5px] border-line rounded-xl px-3.5 py-2.5 mb-3">
        <Search size={16} className="text-ink-faint shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search rule, fact or keyword…"
          className="h-auto flex-1 border-none bg-transparent text-[15px] outline-none text-ink p-0 focus-visible:ring-0 focus-visible:border-transparent"
        />
      </div>

      {memoSets().length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <FilterChip active={setFilter === "all"} onClick={() => setSetFilter("all")}>
            All
          </FilterChip>
          {memoSets().map((s) => (
            <FilterChip key={s} active={setFilter === s} onClick={() => setSetFilter(s)}>
              {memoSetMeta(s).label}
            </FilterChip>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-16 px-5 text-ink-faint text-sm">No rule matches your search.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {results.map((r) => (
            <RuleCard
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

function RuleCard({ rule, mastered, open, onToggle }: { rule: MemoRule; mastered: boolean; open: boolean; onToggle: () => void }) {
  const meta = memoSetMeta(rule.setId);
  return (
    <div className="bg-card border border-line-soft rounded-2xl overflow-hidden">
      <button onClick={onToggle} aria-expanded={open} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-bg transition-colors">
        <span className={"w-1.5 h-10 rounded-full shrink-0 bg-gradient-to-b " + meta.grad} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14.5px] font-semibold text-ink">{rule.title}</span>
            {mastered && <span className="text-[10px] font-bold uppercase text-green bg-green-light rounded-full px-1.5 py-0.5">learned</span>}
          </div>
          <div className="text-[11.5px] text-ink-faint">
            {meta.label} · {rule.category}
          </div>
        </div>
        <ChevronDown size={16} className={"text-ink-faint shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          <RuleHeadline rule={rule} compact />

          <p className="text-[14px] text-ink-soft leading-relaxed mb-3">{rule.explanation}</p>

          {rule.facts.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Key facts</div>
              <FactList facts={rule.facts} muted />
            </div>
          )}

          {rule.example && (
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Example</div>
              <div className="bg-bg rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink-soft leading-relaxed">{rule.example}</div>
            </div>
          )}

          {rule.mnemonic && (
            <div className="rounded-xl bg-purple-light/50 ring-1 ring-inset ring-purple/15 p-3.5 flex gap-2.5">
              <Lightbulb size={13} className="text-purple shrink-0 mt-0.5" />
              <div className="text-[13px] text-ink-soft leading-relaxed">{rule.mnemonic}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
