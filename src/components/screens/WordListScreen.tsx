"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleCheck, Lightbulb, Search, Star } from "lucide-react";
import { VOCAB } from "@/lib/vocab";
import { normalize } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { needsIntensification } from "@/lib/intensify";

const FILTERS = [
  { val: "all", label: "All" },
  { val: "known", label: "Known" },
  { val: "verb", label: "Verbs" },
  { val: "adjective", label: "Adjectives" },
  { val: "favorites", label: "Favorites" },
  { val: "mistakes", label: "Mistakes" },
  { val: "unpracticed", label: "Unpracticed" },
  { val: "intensify", label: "Intensivieren" },
];

export default function WordListScreen({ onSelectWord }: { onSelectWord: (id: string) => void }) {
  const store = useStore();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search box without typing a "/" into it — the common convention (GitHub,
  // Slack, …) for jumping straight to search on a page that's otherwise all filter buttons and rows.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const list = useMemo(() => {
    let l = VOCAB;
    if (filter === "verb") l = l.filter((w) => w.type === "verb");
    if (filter === "adjective") l = l.filter((w) => w.type === "adjective");
    if (filter === "favorites") l = l.filter((w) => store.wordState(w.id).favorite);
    if (filter === "mistakes") l = l.filter((w) => store.wordState(w.id).recentMistake);
    if (filter === "known") l = l.filter((w) => store.wordState(w.id).stage === 4);
    if (filter === "unpracticed") l = l.filter((w) => store.wordState(w.id).timesSeen === 0);
    if (filter === "intensify") l = l.filter((w) => needsIntensification(store.wordState(w.id)));
    const q = normalize(query);
    if (q) l = l.filter((w) => normalize(w.en).includes(q) || w.de.some((d) => normalize(d).includes(q)));
    return l.slice().sort((a, b) => a.en.localeCompare(b.en));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query, store.words]);

  return (
    <section className="animate-fade-in">
      <h1 className="text-[24px] font-bold tracking-tight mt-1 mb-3">Words</h1>
      <div className="flex items-center gap-2.5 bg-card border-[1.5px] border-line rounded-xl px-3.5 py-2.5 mb-3">
        <Search size={16} className="text-ink-faint shrink-0" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search English or German… (/)"
          className="flex-1 border-none bg-transparent text-[15px] outline-none text-ink"
        />
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={
              "text-[13px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors " +
              (filter === f.val ? "bg-ink text-white border-ink" : "border-line bg-card text-ink-soft hover:bg-line-soft")
            }
          >
            {f.label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="text-center py-16 px-5 text-ink-faint text-sm">No words match your search.</div>
      ) : (
        <div>
          {list.map((w) => {
            const s = store.wordState(w.id);
            return (
              <div
                key={w.id}
                onClick={() => onSelectWord(w.id)}
                className="flex items-center gap-3 py-3 px-1 border-b border-line-soft cursor-pointer hover:bg-blue-lighter hover:rounded-[10px] transition-colors"
              >
                <span
                  className={
                    "text-[10px] font-bold uppercase rounded-[5px] px-1.5 py-0.5 shrink-0 w-7 text-center " +
                    (w.type === "adjective" ? "text-purple bg-purple-light" : "text-blue bg-blue-light")
                  }
                >
                  {w.type === "verb" ? "V" : "ADJ"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-semibold">{w.en}</div>
                  <div className="text-[12.5px] text-ink-faint">{w.de.join(" / ")}</div>
                </div>
                {needsIntensification(s) && (
                  <span title="Braucht viele Hints" className="flex items-center gap-0.5 text-[11px] font-semibold text-amber shrink-0">
                    <Lightbulb size={13} /> {s.hintsUsed}
                  </span>
                )}
                {s.stage === 4 && <CircleCheck size={14} className="text-green shrink-0" />}
                <div className="text-[11px] text-ink-faint whitespace-nowrap">{s.timesSeen ? Math.round(s.score * 20) + "%" : "new"}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    store.toggleFavorite(w.id);
                  }}
                  className={"bg-transparent border-none shrink-0 flex items-center " + (s.favorite ? "text-amber" : "text-line")}
                >
                  <Star size={16} fill={s.favorite ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
