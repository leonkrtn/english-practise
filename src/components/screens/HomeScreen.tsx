"use client";

import { useMemo, useState } from "react";
import { BookOpen, Blocks, GraduationCap, Repeat, Shuffle, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import type { SessionMode } from "@/components/AppShell";

const MODES: {
  val: SessionMode;
  label: string;
  icon: typeof BookOpen;
  grad: string;
  tint: string;
  glow: string;
}[] = [
  {
    val: "vocab",
    label: "Vocabulary",
    icon: BookOpen,
    grad: "from-blue to-blue-dark",
    tint: "bg-blue-light text-blue",
    glow: "shadow-[0_10px_24px_-8px_rgba(0,113,227,0.5)]",
  },
  {
    val: "grammar",
    label: "Grammar",
    icon: Blocks,
    grad: "from-purple to-purple-dark",
    tint: "bg-purple-light text-purple",
    glow: "shadow-[0_10px_24px_-8px_rgba(139,92,246,0.5)]",
  },
  {
    val: "mixed",
    label: "Mixed",
    icon: Shuffle,
    grad: "from-blue to-purple",
    tint: "bg-gradient-to-br from-blue-light to-purple-light text-blue-dark",
    glow: "shadow-[0_10px_24px_-8px_rgba(99,90,230,0.45)]",
  },
];

export default function HomeScreen({ onStart }: { onStart: (mode: SessionMode) => void }) {
  const store = useStore();
  const grammarStore = useGrammarStore();
  const [mode, setMode] = useState<SessionMode>("vocab");

  const vocabStats = useMemo(() => {
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

  const grammarStats = useMemo(() => {
    const rules = Object.values(grammarStore.rules);
    const learned = rules.filter((r) => r.stage === 4).length;
    let totalCorrect = 0;
    let totalAll = 0;
    rules.forEach((r) => {
      totalCorrect += r.timesCorrect;
      totalAll += r.timesCorrect + r.timesAlmost + r.timesIncorrect;
    });
    const accuracy = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { learned, sessions: grammarStore.totalPracticeSessions || 0, accuracy };
  }, [grammarStore.rules, grammarStore.totalPracticeSessions]);

  const stats =
    mode === "grammar"
      ? grammarStats
      : mode === "mixed"
      ? {
          learned: vocabStats.learned + grammarStats.learned,
          sessions: Math.max(vocabStats.sessions, grammarStats.sessions),
          accuracy: Math.round((vocabStats.accuracy + grammarStats.accuracy) / 2),
        }
      : vocabStats;

  const active = MODES.find((m) => m.val === mode)!;

  return (
    <section className="h-full flex flex-col">
      <div>
        <h1 className="text-[27px] font-bold tracking-tight mt-1 mb-1">
          <span className="bg-gradient-to-r from-blue via-blue-dark to-purple bg-clip-text text-transparent">Vocabulary</span> Trainer
        </h1>
        <p className="text-ink-soft text-[14px] mb-5 leading-snug">English ↔ German · Grammar · B2 → C1</p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.val;
            return (
              <button
                key={m.val}
                onClick={() => setMode(m.val)}
                className={
                  "flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center transition-all duration-200 " +
                  (isActive
                    ? `bg-gradient-to-br ${m.grad} text-white ${m.glow} scale-[1.02]`
                    : "bg-card border border-line-soft text-ink-soft hover:border-line hover:-translate-y-0.5 hover:shadow-md")
                }
              >
                <span
                  className={
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors " +
                    (isActive ? "bg-white/20" : m.tint)
                  }
                >
                  <Icon size={17} />
                </span>
                <span className="text-[13px] font-semibold">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <StatTile icon={<GraduationCap size={16} />} value={stats.learned} label="Gelernt" tint="bg-green-light text-green" />
          <StatTile icon={<Repeat size={16} />} value={stats.sessions} label="Sessions" tint="bg-blue-light text-blue" />
          <StatTile icon={<Target size={16} />} value={`${stats.accuracy}%`} label="Genauigkeit" tint="bg-amber-light text-amber" />
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => onStart(mode)}
        className={
          "w-full rounded-full bg-gradient-to-r text-white font-semibold py-4 text-[16px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 shadow-[0_14px_30px_-10px_rgba(15,23,42,0.4)] mb-2 " +
          active.grad
        }
      >
        Start Session
      </button>
    </section>
  );
}

function StatTile({ icon, value, label, tint }: { icon: React.ReactNode; value: string | number; label: string; tint: string }) {
  return (
    <div className="bg-card border border-line-soft rounded-xl px-2 py-3 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className={"w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1.5 " + tint}>{icon}</div>
      <div className="text-[17px] font-bold tracking-tight leading-none">{value}</div>
      <div className="text-[10.5px] text-ink-faint mt-1">{label}</div>
    </div>
  );
}
