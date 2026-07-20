"use client";

import { useMemo } from "react";
import { GraduationCap, Repeat, Target } from "lucide-react";
import { useStore } from "@/lib/store";

export default function HomeScreen({ onStart }: { onStart: () => void }) {
  const store = useStore();

  const stats = useMemo(() => {
    const words = Object.values(store.words);
    const learned = words.filter((w) => w.stage === 4).length;
    let totalCorrect = 0;
    let totalAll = 0;
    words.forEach((w) => {
      totalCorrect += w.timesCorrect;
      totalAll += w.timesCorrect + w.timesAlmost + w.timesIncorrect;
    });
    const accuracy = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { learned, sessions: store.totalPracticeSessions || 0, accuracy };
  }, [store.words, store.totalPracticeSessions]);

  return (
    <section className="h-full flex flex-col">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">Vocabulary Trainer</h1>
        <p className="text-ink-soft text-[14px] mb-5 leading-snug">English ↔ German · Verbs &amp; Adjectives · B2 → C1</p>

        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={<GraduationCap size={16} />} value={stats.learned} label="Gelernt" />
          <StatTile icon={<Repeat size={16} />} value={stats.sessions} label="Sessions" />
          <StatTile icon={<Target size={16} />} value={`${stats.accuracy}%`} label="Genauigkeit" />
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={onStart}
        className="w-full rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-4 text-[16px] transition-colors active:scale-[0.97] mb-2"
      >
        Start Session
      </button>
    </section>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-card border border-line-soft rounded-xl px-2 py-3 text-center">
      <div className="flex items-center justify-center text-blue mb-1">{icon}</div>
      <div className="text-[17px] font-bold tracking-tight leading-none">{value}</div>
      <div className="text-[10.5px] text-ink-faint mt-1">{label}</div>
    </div>
  );
}
