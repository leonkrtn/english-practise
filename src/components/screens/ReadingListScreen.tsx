"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { READING_TEXTS, READING_TOPIC_META, type ReadingTopic } from "@/lib/financeReading";
import { Badge } from "@/components/ui/badge";

const TOPIC_FILTERS: { val: ReadingTopic | "all"; label: string }[] = [
  { val: "all", label: "All" },
  ...(Object.entries(READING_TOPIC_META) as [ReadingTopic, { label: string }][]).map(([val, meta]) => ({ val, label: meta.label })),
];

export default function ReadingListScreen({ onSelectText }: { onSelectText: (id: string) => void }) {
  const [filter, setFilter] = useState<ReadingTopic | "all">("all");

  const list = useMemo(() => (filter === "all" ? READING_TEXTS : READING_TEXTS.filter((t) => t.topic === filter)), [filter]);

  return (
    <section className="animate-fade-in">
      <h1 className="text-[24px] font-bold tracking-tight mt-1 mb-1">Reading</h1>
      <p className="text-[13px] text-ink-faint mb-3">
        Read a complex finance text, answer comprehension questions, then write and compare a summary.
      </p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {TOPIC_FILTERS.map((f) => (
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
      <div>
        {list.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectText(t.id)}
            className="flex items-center gap-3 py-3 px-1 border-b border-line-soft cursor-pointer hover:bg-blue-lighter hover:rounded-[10px] transition-colors"
          >
            <Badge className="h-auto text-[10px] font-bold uppercase rounded-[5px] px-1.5 py-0.5 shrink-0 text-center text-red bg-red-light">
              {READING_TOPIC_META[t.topic].label}
            </Badge>
            <div className="flex-1 min-w-0 text-[14.5px] font-semibold truncate">{t.title}</div>
            <ChevronRight size={16} className="text-ink-faint shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
