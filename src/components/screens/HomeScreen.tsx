"use client";

import { useMemo, useState } from "react";
import { BookOpen, Blocks, Flame, Repeat, Shuffle, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import { VOCAB } from "@/lib/vocab";
import { GRAMMAR_RULES } from "@/lib/grammar-data";
import type { SessionMode } from "@/components/AppShell";

const MODES: {
  val: SessionMode;
  label: string;
  icon: typeof BookOpen;
  grad: string;
  tint: string;
  glow: string;
  ring: [string, string];
}[] = [
  {
    val: "vocab",
    label: "Vocabulary",
    icon: BookOpen,
    grad: "from-blue to-blue-dark",
    tint: "bg-blue-light text-blue",
    glow: "shadow-[0_10px_24px_-8px_rgba(0,113,227,0.5)]",
    ring: ["#0071e3", "#0058b8"],
  },
  {
    val: "grammar",
    label: "Grammar",
    icon: Blocks,
    grad: "from-purple to-purple-dark",
    tint: "bg-purple-light text-purple",
    glow: "shadow-[0_10px_24px_-8px_rgba(139,92,246,0.5)]",
    ring: ["#8b5cf6", "#6d3fd4"],
  },
  {
    val: "mixed",
    label: "Mixed",
    icon: Shuffle,
    grad: "from-blue to-purple",
    tint: "bg-gradient-to-br from-blue-light to-purple-light text-blue-dark",
    glow: "shadow-[0_10px_24px_-8px_rgba(99,90,230,0.45)]",
    ring: ["#0071e3", "#8b5cf6"],
  },
];

/** Consecutive calendar days (ending today or yesterday) with at least one completed session. */
function computeStreak(dates: number[]): number {
  if (!dates.length) return 0;
  const dayMs = 86400000;
  const days = new Set(dates.map((d) => Math.floor(d / dayMs)));
  const today = Math.floor(Date.now() / dayMs);
  let cursor = today;
  if (!days.has(cursor)) {
    if (days.has(cursor - 1)) cursor -= 1;
    else return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

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
    return { learned, total: VOCAB.length, sessions: store.totalPracticeSessions || 0, accuracy };
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
    return { learned, total: GRAMMAR_RULES.length, sessions: grammarStore.totalPracticeSessions || 0, accuracy };
  }, [grammarStore.rules, grammarStore.totalPracticeSessions]);

  // A practice streak reflects overall commitment, not the currently selected mode —
  // it's computed from both domains' session history so it doesn't flip when switching tabs.
  const streak = useMemo(() => {
    const dates = [...store.sessionHistory.map((s) => s.date), ...grammarStore.sessionHistory.map((s) => s.date)];
    return computeStreak(dates);
  }, [store.sessionHistory, grammarStore.sessionHistory]);

  const stats =
    mode === "grammar"
      ? grammarStats
      : mode === "mixed"
      ? {
          learned: vocabStats.learned + grammarStats.learned,
          total: vocabStats.total + grammarStats.total,
          sessions: Math.max(vocabStats.sessions, grammarStats.sessions),
          accuracy: Math.round((vocabStats.accuracy + grammarStats.accuracy) / 2),
        }
      : vocabStats;

  const active = MODES.find((m) => m.val === mode)!;
  const progressPct = stats.total ? Math.round((stats.learned / stats.total) * 100) : 0;

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

        <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <ProgressRing pct={progressPct} from={active.ring[0]} to={active.ring[1]}>
            <span className="text-[19px] font-bold tracking-tight leading-none">{stats.learned}</span>
            <span className="text-[10px] text-ink-faint mt-0.5">/ {stats.total}</span>
          </ProgressRing>
          <div className="flex-1 flex flex-col gap-2.5 min-w-0">
            <StatRow icon={<Repeat size={14} />} value={stats.sessions} label="Sessions" tint="bg-blue-light text-blue" />
            <StatRow icon={<Target size={14} />} value={`${stats.accuracy}%`} label="Genauigkeit" tint="bg-amber-light text-amber" />
            <StatRow
              icon={<Flame size={14} />}
              value={streak}
              label={streak === 1 ? "Tag Streak" : "Tage Streak"}
              tint="bg-red-light text-red"
            />
          </div>
        </div>

        {mode === "mixed" && (
          <div className="flex flex-col gap-2.5 mt-3">
            <MiniBar label="Vocabulary" learned={vocabStats.learned} total={vocabStats.total} grad="from-blue to-blue-dark" />
            <MiniBar label="Grammar" learned={grammarStats.learned} total={grammarStats.total} grad="from-purple to-purple-dark" />
          </div>
        )}
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

function ProgressRing({
  pct,
  from,
  to,
  size = 92,
  stroke = 9,
  children,
}: {
  pct: number;
  from: string;
  to: string;
  size?: number;
  stroke?: number;
  children: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#home-ring-grad)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="home-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function StatRow({ icon, value, label, tint }: { icon: React.ReactNode; value: string | number; label: string; tint: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={"w-7 h-7 rounded-full flex items-center justify-center shrink-0 " + tint}>{icon}</span>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[15px] font-bold tracking-tight tabular-nums">{value}</span>
        <span className="text-[11.5px] text-ink-faint truncate">{label}</span>
      </div>
    </div>
  );
}

function MiniBar({ label, learned, total, grad }: { label: string; learned: number; total: number; grad: string }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <div className="bg-card border border-line-soft rounded-xl px-3.5 py-2.5">
      <div className="flex justify-between items-baseline mb-1.5 text-[11.5px]">
        <span className="text-ink-soft font-semibold">{label}</span>
        <span className="text-ink-faint tabular-nums">
          {learned}/{total}
        </span>
      </div>
      <div className="h-1.5 bg-line-soft rounded-full overflow-hidden">
        <div className={"h-full rounded-full bg-gradient-to-r transition-[width] duration-500 " + grad} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
