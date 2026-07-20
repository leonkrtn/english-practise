"use client";

import { useState } from "react";
import type { Direction } from "@/lib/types";

const DIR_OPTIONS: { val: Direction; label: string }[] = [
  { val: "en-de", label: "EN → DE" },
  { val: "de-en", label: "DE → EN" },
  { val: "mixed", label: "Mixed" },
];

const STAGES = [
  { emoji: "👀", title: "Kennenlernen", desc: "Wort, Übersetzung, Beispielsatz" },
  { emoji: "❓", title: "Abfragen", desc: "Kurzer Recall-Test" },
  { emoji: "🧩", title: "Einbauen", desc: "Im Satzkontext anwenden" },
  { emoji: "✍️", title: "Schreiben", desc: "Frei produzieren" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2.5">{children}</div>;
}

export default function HomeScreen({ onStart }: { onStart: (direction: Direction) => void }) {
  const [direction, setDirection] = useState<Direction>("mixed");

  return (
    <section className="animate-fade-in">
      <h1 className="text-[30px] font-bold tracking-tight mt-1 mb-1.5">Vocabulary Trainer</h1>
      <p className="text-ink-soft text-[15px] mb-7 leading-relaxed">English ↔ German · Verbs &amp; Adjectives · B2 → C1</p>

      <div className="mb-7">
        <SectionLabel>Wie eine Session abläuft</SectionLabel>
        <div className="bg-card border border-line-soft rounded-2xl p-5 shadow-sm">
          <p className="text-[14px] text-ink-soft leading-relaxed mb-4">
            Jede Session nimmt ~10 Wörter — neue plus welche, die du schon angefangen hast — und führt sie durch vier
            Lernstufen. Richtig beantwortet, kommt ein Wort <b className="text-ink">später in derselben Session</b>{" "}
            nochmal dran, auf der nächsten Stufe. Einmal fertig gelernt, taucht es in ein paar zufälligen Sessions
            wieder auf, damit es hängen bleibt.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {STAGES.map((s) => (
              <div key={s.title} className="flex items-start gap-2.5 bg-bg rounded-xl p-3">
                <span className="text-lg leading-none">{s.emoji}</span>
                <div>
                  <div className="text-[13px] font-semibold text-ink">{s.title}</div>
                  <div className="text-[11.5px] text-ink-faint mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      <button
        onClick={() => onStart(direction)}
        className="w-full rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-4 text-[16px] transition-colors active:scale-[0.97]"
      >
        Start Session
      </button>
    </section>
  );
}
