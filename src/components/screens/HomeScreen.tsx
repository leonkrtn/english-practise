"use client";

import { useState } from "react";
import type { Direction, ExerciseFormat, SelectionMode } from "@/lib/types";

const DIR_OPTIONS: { val: Direction; label: string }[] = [
  { val: "en-de", label: "EN → DE" },
  { val: "de-en", label: "DE → EN" },
  { val: "mixed", label: "Mixed" },
];

const FMT_OPTIONS: { val: ExerciseFormat; icon: string; title: string; desc: string }[] = [
  { val: "mixed", icon: "🔀", title: "Mixed Practice", desc: "Random mix of all formats below" },
  { val: "translate", icon: "✍️", title: "Direct Translation", desc: "Type the translation" },
  { val: "gap", icon: "📝", title: "Missing Word", desc: "Fill the blank in a sentence" },
  { val: "mc", icon: "☑️", title: "Multiple Choice", desc: "Pick the right option" },
  { val: "sentence", icon: "💬", title: "Sentence Translation", desc: "Translate a full sentence" },
  { val: "match", icon: "🔗", title: "Word Matching", desc: "Match pairs of words" },
  { val: "build", icon: "🧩", title: "Sentence Building", desc: "Reorder shuffled words" },
  { val: "multigap", icon: "📄", title: "Fill Multiple Gaps", desc: "Short paragraph, several blanks" },
  { val: "confusable", icon: "⚖️", title: "Similar Words", desc: "Commonly confused pairs" },
];

const MODE_OPTIONS: { val: SelectionMode; label: string }[] = [
  { val: "all", label: "All words" },
  { val: "new", label: "New words" },
  { val: "difficult", label: "Difficult words" },
  { val: "mistakes", label: "Recent mistakes" },
  { val: "favorites", label: "Favorites" },
];

const LEN_OPTIONS: { val: number; label: string }[] = [
  { val: 10, label: "10" },
  { val: 20, label: "20" },
  { val: 50, label: "50" },
  { val: 100, label: "100" },
  { val: 0, label: "Unlimited" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2.5">{children}</div>;
}

export default function HomeScreen({
  onStart,
}: {
  onStart: (direction: Direction, format: ExerciseFormat, mode: SelectionMode, length: number) => void;
}) {
  const [direction, setDirection] = useState<Direction>("mixed");
  const [format, setFormat] = useState<ExerciseFormat>("mixed");
  const [mode, setMode] = useState<SelectionMode>("all");
  const [length, setLength] = useState<number>(20);

  return (
    <section className="animate-fade-in">
      <h1 className="text-[30px] font-bold tracking-tight mt-1 mb-1.5">Vocabulary Trainer</h1>
      <p className="text-ink-soft text-[15px] mb-7 leading-relaxed">English ↔ German · Verbs &amp; Adjectives · B2 → C1</p>

      <div className="mb-7">
        <SectionLabel>Direction</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {DIR_OPTIONS.map((o) => (
            <button
              key={o.val}
              onClick={() => setDirection(o.val)}
              className={
                "border-[1.5px] rounded-[10px] px-2.5 py-3.5 text-center text-sm font-semibold transition-colors " +
                (direction === o.val ? "border-blue bg-blue-light text-blue-dark" : "border-line bg-card text-ink-soft hover:border-[#c7c7cc] hover:bg-blue-lighter")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <SectionLabel>Exercise format</SectionLabel>
        <div className="flex flex-col gap-2">
          {FMT_OPTIONS.map((o) => (
            <button
              key={o.val}
              onClick={() => setFormat(o.val)}
              className={
                "flex items-center gap-3 border-[1.5px] rounded-[10px] px-3.5 py-3.5 text-left transition-colors " +
                (format === o.val ? "border-blue bg-blue-light" : "border-line bg-card hover:border-[#c7c7cc] hover:bg-blue-lighter")
              }
            >
              <div className={"w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-base shrink-0 " + (format === o.val ? "bg-blue text-white" : "bg-line-soft")}>
                {o.icon}
              </div>
              <div className="flex-1">
                <div className="text-[14.5px] font-semibold text-ink">{o.title}</div>
                <div className="text-[12.5px] text-ink-faint mt-0.5">{o.desc}</div>
              </div>
              <div className={"w-5 h-5 rounded-full border-[1.5px] shrink-0 relative " + (format === o.val ? "bg-blue border-blue" : "border-line")}>
                {format === o.val && <span className="absolute left-[6px] top-[2px] w-1 h-2.5 border-white border-r-2 border-b-2 rotate-45" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <SectionLabel>Word selection</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {MODE_OPTIONS.map((o) => (
            <button
              key={o.val}
              onClick={() => setMode(o.val)}
              className={
                "border-[1.5px] rounded-[10px] px-2.5 py-3.5 text-center text-sm font-semibold transition-colors " +
                (mode === o.val ? "border-blue bg-blue-light text-blue-dark" : "border-line bg-card text-ink-soft hover:border-[#c7c7cc] hover:bg-blue-lighter")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <SectionLabel>Session length</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {LEN_OPTIONS.map((o) => (
            <button
              key={o.val}
              onClick={() => setLength(o.val)}
              className={
                "border-[1.5px] rounded-[10px] px-2.5 py-3.5 text-center text-sm font-semibold transition-colors " +
                (length === o.val ? "border-blue bg-blue-light text-blue-dark" : "border-line bg-card text-ink-soft hover:border-[#c7c7cc] hover:bg-blue-lighter")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(direction, format, mode, length)}
        className="w-full rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-4 text-[16px] transition-colors active:scale-[0.97]"
      >
        Start Session
      </button>
    </section>
  );
}
