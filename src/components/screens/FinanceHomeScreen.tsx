"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Calculator,
  CircleCheck,
  Clock,
  Flame,
  GraduationCap,
  Landmark,
  ListChecks,
  PencilLine,
  Repeat,
  Sigma,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCustomMemo } from "@/lib/customMemoStore";
import { VOCAB } from "@/lib/vocab";
import { MATH_RULES, MATH_TOPICS, MATH_TOPIC_META, type MathTopic } from "@/lib/math";
import { topicProgress } from "@/lib/mathLearning";
import {
  MATH_GROUP_LABEL,
  MATH_TEST_LENGTH_OPTIONS,
  type MathTestLength,
  type MathTestScope,
  type MathTopicGroup,
} from "@/lib/mathTest";
import { memoRules, memoSets, memoSetMeta, type MemoSetId } from "@/lib/memo";
import { memoSetProgress } from "@/lib/memoLearning";
import { computeStreak } from "@/lib/progressStats";
import {
  ActivityStrip,
  ChipRow,
  LevelCard,
  MiniBar,
  ModeTabs,
  ProgressRing,
  StartButton,
  StatChip,
  StatRow,
  StickyActions,
  formatRelativeDate,
} from "@/components/home/shared";

/** The four tabs, styled exactly like the Vocabulary home's mode tabs. Owned by AppShell so the
 * selection survives leaving and returning to Home — the same reason HomeScreen's mode is lifted. */
export type FinanceTab = "vocab" | "math" | "rules" | "test";

const TABS: { val: FinanceTab; label: string; icon: typeof BookOpen; grad: string; tint: string; glow: string; ring: [string, string] }[] = [
  {
    val: "vocab",
    label: "Vocabulary",
    icon: Landmark,
    grad: "from-green to-green-dark",
    tint: "bg-green-light text-green",
    glow: "shadow-[0_10px_24px_-8px_rgba(30,182,118,0.5)]",
    ring: ["#1eb676", "#0e9464"],
  },
  {
    val: "math",
    label: "Mathematics",
    icon: Calculator,
    grad: "from-purple to-purple-dark",
    tint: "bg-purple-light text-purple",
    glow: "shadow-[0_10px_24px_-8px_rgba(139,92,246,0.5)]",
    ring: ["#8b5cf6", "#6d3fd4"],
  },
  {
    val: "rules",
    label: "Rules",
    icon: ListChecks,
    grad: "from-amber to-amber-dark",
    tint: "bg-amber-light text-amber",
    glow: "shadow-[0_10px_24px_-8px_rgba(232,161,46,0.5)]",
    ring: ["#e8a12e", "#c9860f"],
  },
  {
    val: "test",
    label: "Test",
    icon: GraduationCap,
    grad: "from-ink to-ink/70",
    tint: "bg-line-soft text-ink",
    glow: "shadow-[0_10px_24px_-8px_rgba(15,23,42,0.55)]",
    ring: ["#1d1d1f", "#48484f"],
  },
];

const SCOPE_OPTIONS: { val: "finance" | "math"; label: string }[] = [
  { val: "finance", label: "Corporate Finance" },
  { val: "math", label: "Math terms" },
];

export default function FinanceHomeScreen({
  tab,
  onTabChange,
  onStartVocab,
  onStartMath,
  onStartMemo,
  onOpenTheory,
  onOpenRules,
  onOpenEditor,
  onOpenStats,
  onStartTest,
}: {
  tab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
  onStartVocab: (scope: "finance" | "math") => void;
  onStartMath: (topic: MathTopic | null, drill: boolean) => void;
  onStartMemo: (setId: MemoSetId | null, drill: boolean) => void;
  onOpenTheory: () => void;
  onOpenRules: () => void;
  onOpenEditor: () => void;
  onOpenStats: () => void;
  onStartTest: (scope: MathTestScope, length: MathTestLength) => void;
}) {
  const store = useStore();
  const custom = useCustomMemo();
  const [vocabScope, setVocabScope] = useState<"finance" | "math">("finance");
  const [testScope, setTestScope] = useState<MathTestScope>({ kind: "all" });
  const [testLength, setTestLength] = useState<MathTestLength>(10);

  const vocabStats = useMemo(() => {
    const pool = VOCAB.filter((w) => w.category === vocabScope && !store.blockedWordIds.has(w.id));
    let learned = 0;
    let correct = 0;
    let answered = 0;
    pool.forEach((w) => {
      const s = store.words[w.id];
      if (!s) return;
      if (s.stage === 4) learned++;
      correct += s.timesCorrect;
      answered += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    return { learned, total: pool.length, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [vocabScope, store.words, store.blockedWordIds]);

  const vocabBreakdown = useMemo(() => {
    const count = (category: "finance" | "math") => {
      const pool = VOCAB.filter((w) => w.category === category && !store.blockedWordIds.has(w.id));
      const learned = pool.filter((w) => store.words[w.id]?.stage === 4).length;
      const inProgress = pool.filter((w) => {
        const s = store.words[w.id];
        return s && s.stage > 0 && s.stage < 4;
      }).length;
      return { learned, inProgress, total: pool.length };
    };
    return { finance: count("finance"), math: count("math") };
  }, [store.words, store.blockedWordIds]);

  const topics = useMemo(
    () => MATH_TOPICS.map((t) => topicProgress(t, store.wordState, store.totalPracticeSessions)),
    [store.wordState, store.totalPracticeSessions]
  );

  const mathStats = useMemo(() => {
    const learned = topics.reduce((n, t) => n + t.learned, 0);
    const inProgress = topics.reduce((n, t) => n + t.inProgress, 0);
    const due = topics.reduce((n, t) => n + t.due, 0);
    let correct = 0;
    let answered = 0;
    MATH_RULES.forEach((r) => {
      const s = store.words[r.id];
      if (!s) return;
      correct += s.timesCorrect;
      answered += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    return { learned, inProgress, due, total: MATH_RULES.length, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [topics, store.words]);

  // Recomputed each render rather than memoised: the rule pool is a module registry the learner's
  // own sets are pushed into, and a memo would need a hand-maintained dependency on it to stay fresh.
  const memoSetStats = memoSets().map((id) => memoSetProgress(id, store.wordState, store.totalPracticeSessions));

  const memoStats = useMemo(() => {
    const learned = memoSetStats.reduce((n, s) => n + s.learned, 0);
    const inProgress = memoSetStats.reduce((n, s) => n + s.inProgress, 0);
    const due = memoSetStats.reduce((n, s) => n + s.due, 0);
    let correct = 0;
    let answered = 0;
    memoRules().forEach((r) => {
      const s = store.words[r.id];
      if (!s) return;
      correct += s.timesCorrect;
      answered += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    return { learned, inProgress, due, total: memoRules().length, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [memoSetStats, store.words]);

  const allDates = useMemo(() => store.sessionHistory.map((s) => s.date), [store.sessionHistory]);
  const streak = useMemo(() => computeStreak(allDates), [allDates]);
  const recentSessions = useMemo(() => store.sessionHistory.slice(-6).reverse(), [store.sessionHistory]);

  const active = TABS.find((t) => t.val === tab)!;
  const stats = tab === "vocab" ? vocabStats : tab === "rules" ? memoStats : mathStats;
  const progressPct = stats.total ? Math.round((stats.learned / stats.total) * 100) : 0;

  return (
    <section className="flex flex-col pb-1">
      <div className="lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-6 lg:items-start">
        <div>
          <ModeTabs modes={TABS} active={tab} onChange={onTabChange} columns="grid-cols-4" />

          {tab === "vocab" && (
            <div className="grid grid-cols-2 gap-2 mb-5">
              {SCOPE_OPTIONS.map((sc) => (
                <button
                  key={sc.val}
                  onClick={() => setVocabScope(sc.val)}
                  className={
                    "flex items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center transition-all " +
                    (vocabScope === sc.val
                      ? "bg-green-light border-[1.5px] border-green text-[#0d7a4f]"
                      : "bg-card border-[1.5px] border-line-soft text-ink-soft hover:border-line")
                  }
                >
                  {sc.val === "finance" ? <Landmark size={14} /> : <Sigma size={14} />}
                  <span className="text-[11.5px] font-semibold leading-tight">{sc.label}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "test" ? (
            <TestOverviewCard
              scope={testScope}
              length={testLength}
              onScopeChange={setTestScope}
              onLengthChange={setTestLength}
              streak={streak}
            />
          ) : (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <ProgressRing pct={progressPct} from={active.ring[0]} to={active.ring[1]} gradientId="finance-ring-grad">
                <span className="text-[19px] font-bold tracking-tight leading-none">{stats.learned}</span>
                <span className="text-[10px] text-ink-faint mt-0.5">/ {stats.total}</span>
              </ProgressRing>
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                <StatRow icon={<Repeat size={14} />} value={store.totalPracticeSessions || 0} label="Sessions" tint="bg-blue-light text-blue" />
                <StatRow icon={<Target size={14} />} value={`${stats.accuracy}%`} label="Accuracy" tint="bg-amber-light text-amber" />
                <StatRow
                  icon={<Flame size={14} />}
                  value={streak}
                  label={streak === 1 ? "day streak" : "day streak"}
                  tint="bg-red-light text-red"
                />
              </div>
            </div>
          )}

          {tab === "vocab" && (
            <div className="flex flex-col gap-2.5 mt-3">
              <MiniBar
                label="Corporate Finance"
                learned={vocabBreakdown.finance.learned}
                inProgress={vocabBreakdown.finance.inProgress}
                total={vocabBreakdown.finance.total}
                grad="from-green to-green-dark"
              />
              <MiniBar
                label="Math terms"
                learned={vocabBreakdown.math.learned}
                inProgress={vocabBreakdown.math.inProgress}
                total={vocabBreakdown.math.total}
                grad="from-amber to-amber-dark"
              />
            </div>
          )}

          {tab === "rules" && (
            <div className="flex flex-col gap-2.5 mt-3">
              <div className="grid grid-cols-3 gap-2.5">
                <StatChip icon={<CircleCheck size={14} />} value={memoStats.learned} label="Learned" tint="bg-green-light text-green" />
                <StatChip icon={<Zap size={14} />} value={memoStats.inProgress} label="In progress" tint="bg-amber-light text-amber" />
                <StatChip icon={<Clock size={14} />} value={memoStats.due} label="Due" tint="bg-blue-light text-blue" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint mt-1.5 px-0.5">Rule sets · tap to practise</div>
              {memoSetStats.map((set) => {
                const meta = memoSetMeta(set.setId);
                return (
                  <MiniBar
                    key={set.setId}
                    label={meta.label}
                    learned={set.learned}
                    inProgress={set.inProgress}
                    total={set.total}
                    grad={meta.grad}
                    onClick={() => onStartMemo(set.setId, false)}
                    trailing={set.due > 0 ? <span className="text-blue font-semibold">{set.due} due</span> : undefined}
                  />
                );
              })}
            </div>
          )}

          {tab === "math" && (
            <div className="flex flex-col gap-2.5 mt-3">
              <div className="grid grid-cols-3 gap-2.5">
                <StatChip icon={<CircleCheck size={14} />} value={mathStats.learned} label="Learned" tint="bg-green-light text-green" />
                <StatChip icon={<Zap size={14} />} value={mathStats.inProgress} label="In progress" tint="bg-amber-light text-amber" />
                <StatChip icon={<Clock size={14} />} value={mathStats.due} label="Due" tint="bg-blue-light text-blue" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint mt-1.5 px-0.5">Topics · tap to practise</div>
              {topics.map((t) => {
                const meta = MATH_TOPIC_META[t.topic];
                return (
                  <MiniBar
                    key={t.topic}
                    label={meta.label}
                    learned={t.learned}
                    inProgress={t.inProgress}
                    total={t.total}
                    grad={meta.grad}
                    onClick={() => onStartMath(t.topic, false)}
                    trailing={t.due > 0 ? <span className="text-blue font-semibold">{t.due} due</span> : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-3 lg:mt-0">
          <LevelCard xp={store.xp} badgesEarned={store.badgeIds.size} />

          {tab === "math" && (
            <div className="grid grid-cols-2 gap-2.5">
              <SideAction icon={<BookOpen size={16} />} tint="bg-blue-light text-blue" label="Theory" sub={`${MATH_RULES.length} rules`} onClick={onOpenTheory} />
              <SideAction icon={<BarChart3 size={16} />} tint="bg-green-light text-green" label="Statistics" sub="Progress & tests" onClick={onOpenStats} />
            </div>
          )}

          {tab === "rules" && (
            <div className="grid grid-cols-2 gap-2.5">
              <SideAction
                icon={<BookOpen size={16} />}
                tint="bg-amber-light text-amber"
                label="Reference"
                sub={`${memoRules().length} rules`}
                onClick={onOpenRules}
              />
              <SideAction
                icon={<PencilLine size={16} />}
                tint="bg-purple-light text-purple"
                label="My sets"
                sub={custom.sets.length === 1 ? "1 own set" : `${custom.sets.length} own sets`}
                onClick={onOpenEditor}
              />
              <SideAction icon={<BarChart3 size={16} />} tint="bg-green-light text-green" label="Statistics" sub="Progress & tests" onClick={onOpenStats} />
            </div>
          )}

          <ActivityStrip dates={allDates} />

          {recentSessions.length > 0 && (
            <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm">
              <div className="text-[13px] font-semibold text-ink mb-1">Recent sessions</div>
              <div className="flex flex-col">
                {recentSessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={"w-2 h-2 rounded-full shrink-0 " + (s.format === "math" ? "bg-purple" : "bg-green")} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink">{s.format === "math" ? "Mathematics" : "Vocabulary"}</div>
                        <div className="text-[11px] text-ink-faint">{formatRelativeDate(s.date)}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{s.accuracy}%</div>
                      <div className="text-[11px] text-ink-faint tabular-nums">
                        {s.correct}/{s.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <StickyActions>
        {tab === "vocab" && <StartButton onClick={() => onStartVocab(vocabScope)} grad="from-green to-green-dark">Start session</StartButton>}

        {tab === "math" && (
          <>
            <button
              onClick={() => onStartMath(null, true)}
              className="w-full lg:flex-1 rounded-full border-[1.5px] border-line bg-card text-ink font-semibold py-3.5 text-[15px] transition-all active:scale-[0.98] hover:bg-line-soft inline-flex items-center justify-center gap-2"
            >
              <Timer size={15} /> Drill only
            </button>
            <StartButton onClick={() => onStartMath(null, false)} grad="from-purple to-purple-dark">
              Start session
            </StartButton>
          </>
        )}

        {tab === "rules" && (
          <>
            <button
              onClick={() => onStartMemo(null, true)}
              className="w-full lg:flex-1 rounded-full border-[1.5px] border-line bg-card text-ink font-semibold py-3.5 text-[15px] transition-all active:scale-[0.98] hover:bg-line-soft inline-flex items-center justify-center gap-2"
            >
              <Timer size={15} /> Drill only
            </button>
            <StartButton onClick={() => onStartMemo(null, false)} grad="from-amber to-amber-dark">
              Start session
            </StartButton>
          </>
        )}

        {tab === "test" && (
          <StartButton onClick={() => onStartTest(testScope, testLength)} grad="from-ink to-ink/80">
            Start test
          </StartButton>
        )}
      </StickyActions>
    </section>
  );
}

function SideAction({
  icon,
  tint,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-line-soft rounded-2xl p-3.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all text-left"
    >
      <span className={"w-8 h-8 rounded-full flex items-center justify-center mb-2 " + tint}>{icon}</span>
      <div className="text-[13px] font-semibold text-ink leading-tight">{label}</div>
      <div className="text-[11px] text-ink-faint truncate">{sub}</div>
    </button>
  );
}

function TestOverviewCard({
  scope,
  length,
  onScopeChange,
  onLengthChange,
  streak,
}: {
  scope: MathTestScope;
  length: MathTestLength;
  onScopeChange: (s: MathTestScope) => void;
  onLengthChange: (l: MathTestLength) => void;
  streak: number;
}) {
  return (
    <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <span className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-line-soft text-ink">
          <GraduationCap size={22} />
        </span>
        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
          <StatRow icon={<Target size={14} />} value={`${length}`} label="questions" tint="bg-amber-light text-amber" />
          <StatRow icon={<Flame size={14} />} value={streak} label="day streak" tint="bg-red-light text-red" />
        </div>
      </div>

      <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Scope</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <ScopeChip active={scope.kind === "all"} onClick={() => onScopeChange({ kind: "all" })}>
          All topics
        </ScopeChip>
        {(["calculus", "quantitative"] as MathTopicGroup[]).map((g) => (
          <ScopeChip key={g} active={scope.kind === "group" && scope.group === g} onClick={() => onScopeChange({ kind: "group", group: g })}>
            {MATH_GROUP_LABEL[g]}
          </ScopeChip>
        ))}
        {MATH_TOPICS.map((t) => (
          <ScopeChip key={t} active={scope.kind === "topic" && scope.topic === t} onClick={() => onScopeChange({ kind: "topic", topic: t })}>
            {MATH_TOPIC_META[t].label}
          </ScopeChip>
        ))}
      </div>

      <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Length</div>
      <ChipRow
        options={MATH_TEST_LENGTH_OPTIONS.map((l) => ({ val: l, label: `${l} questions` }))}
        value={length}
        onChange={onLengthChange}
      />
    </div>
  );
}

function ScopeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-[12px] font-semibold px-2.5 py-1.5 rounded-full border transition-colors " +
        (active ? "bg-ink text-white border-ink" : "border-line bg-card text-ink-soft hover:bg-line-soft")
      }
    >
      {children}
    </button>
  );
}
