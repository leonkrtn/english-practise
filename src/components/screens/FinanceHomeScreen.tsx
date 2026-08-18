"use client";

import { useMemo, useState } from "react";
import { BarChart3, BookOpen, ChevronRight, GraduationCap, Landmark, Play, Sigma, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
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
import Formula from "@/components/Formula";
import { Button } from "@/components/ui/button";

export default function FinanceHomeScreen({
  onStartVocab,
  onStartMath,
  onOpenTheory,
  onOpenStats,
  onStartTest,
}: {
  onStartVocab: (scope: "finance" | "math") => void;
  onStartMath: (topic: MathTopic | null) => void;
  onOpenTheory: () => void;
  onOpenStats: () => void;
  onStartTest: (scope: MathTestScope, length: MathTestLength) => void;
}) {
  const store = useStore();
  const [testOpen, setTestOpen] = useState(false);
  const [testScope, setTestScope] = useState<MathTestScope>({ kind: "all" });
  const [testLength, setTestLength] = useState<MathTestLength>(10);

  const vocabCounts = useMemo(() => {
    const count = (category: "finance" | "math") => {
      const pool = VOCAB.filter((w) => w.category === category && !store.blockedWordIds.has(w.id));
      const learned = pool.filter((w) => store.words[w.id]?.stage === 4).length;
      return { learned, total: pool.length };
    };
    return { finance: count("finance"), math: count("math") };
  }, [store.words, store.blockedWordIds]);

  const topics = useMemo(
    () => MATH_TOPICS.map((t) => topicProgress(t, store.wordState, store.totalPracticeSessions)),
    [store.wordState, store.totalPracticeSessions]
  );

  const mathOverall = useMemo(() => {
    const learned = topics.reduce((n, t) => n + t.learned, 0);
    const due = topics.reduce((n, t) => n + t.due, 0);
    return { learned, total: MATH_RULES.length, due };
  }, [topics]);

  return (
    <section className="animate-fade-in pb-4">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">Finance</h1>
      <p className="text-ink-soft text-[13.5px] mb-5 leading-snug">
        Corporate-Finance-Vokabular und {MATH_RULES.length} Mathematik-Regeln über {MATH_TOPICS.length} Themen.
      </p>

      <div className="lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:items-start">
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Vokabular</h2>
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <VocabCard
              icon={<Landmark size={17} />}
              tint="bg-green-light text-green"
              title="Corporate Finance"
              learned={vocabCounts.finance.learned}
              total={vocabCounts.finance.total}
              grad="from-green to-green-dark"
              onClick={() => onStartVocab("finance")}
            />
            <VocabCard
              icon={<Sigma size={17} />}
              tint="bg-amber-light text-amber"
              title="Mathe-Begriffe"
              learned={vocabCounts.math.learned}
              total={vocabCounts.math.total}
              grad="from-amber to-amber-dark"
              onClick={() => onStartVocab("math")}
            />
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint">Mathematik</h2>
            <span className="text-[11.5px] text-ink-faint tabular-nums">
              {mathOverall.learned}/{mathOverall.total} gelernt
              {mathOverall.due > 0 && <span className="text-blue font-semibold"> · {mathOverall.due} fällig</span>}
            </span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {topics.map((t) => {
              const meta = MATH_TOPIC_META[t.topic];
              const pct = t.total ? Math.round((t.learned / t.total) * 100) : 0;
              const sample = MATH_RULES.find((r) => r.topic === t.topic);
              return (
                <button
                  key={t.topic}
                  onClick={() => onStartMath(t.topic)}
                  className="w-full text-left rounded-2xl bg-card border border-line-soft px-4 py-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={"w-1.5 h-9 rounded-full shrink-0 bg-gradient-to-b " + meta.grad} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-ink">{meta.label}</span>
                        {t.due > 0 && (
                          <span className="text-[10px] font-bold uppercase text-blue bg-blue-light rounded-full px-1.5 py-0.5">
                            {t.due} fällig
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-ink-faint truncate">{meta.blurb}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-semibold text-ink tabular-nums">
                        {t.learned}/{t.total}
                        {t.inProgress > 0 && <span className="text-ink-faint font-normal"> · {t.inProgress} offen</span>}
                      </div>
                      {sample && (
                        <div className="hidden sm:block max-w-[130px] overflow-hidden">
                          <Formula tex={sample.formulaTex} className="text-[10px] text-ink-faint" />
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-ink-faint shrink-0" />
                  </div>
                  {/* Two segments: solid for mastered, translucent for started-but-not-yet-mastered, so a
                      session's work is visible immediately instead of the bar staying at zero until mastery. */}
                  <div className="h-1.5 rounded-full bg-line-soft overflow-hidden mt-2.5 flex">
                    <div className={"h-full bg-gradient-to-r " + meta.grad} style={{ width: pct + "%" }} />
                    <div
                      className={"h-full bg-gradient-to-r opacity-30 " + meta.grad}
                      style={{ width: (t.total ? Math.round((t.inProgress / t.total) * 100) : 0) + "%" }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-2 lg:mt-0">
          <ActionCard
            icon={<Sparkles size={17} />}
            tint="bg-purple-light text-purple"
            title="Gemischt üben"
            subtitle="Alle Themen, fällige Wiederholungen zuerst"
            onClick={() => onStartMath(null)}
          />
          <ActionCard
            icon={<BookOpen size={17} />}
            tint="bg-blue-light text-blue"
            title="Theorie"
            subtitle={`${MATH_RULES.length} Regeln nachschlagen`}
            onClick={onOpenTheory}
          />
          <ActionCard
            icon={<BarChart3 size={17} />}
            tint="bg-green-light text-green"
            title="Statistik"
            subtitle="Fortschritt, Genauigkeit, Testverlauf"
            onClick={onOpenStats}
          />

          <div className="bg-card border border-line-soft rounded-2xl overflow-hidden">
            <button
              onClick={() => setTestOpen((v) => !v)}
              aria-expanded={testOpen}
              className="w-full text-left px-4 py-3.5 flex items-center gap-3.5 hover:bg-bg transition-colors"
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-line-soft text-ink">
                <GraduationCap size={17} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink">Test</div>
                <div className="text-[11.5px] text-ink-faint">Benotete Prüfung mit Auswertung</div>
              </div>
              <ChevronRight size={16} className={"text-ink-faint shrink-0 transition-transform " + (testOpen ? "rotate-90" : "")} />
            </button>

            {testOpen && (
              <div className="px-4 pb-4 border-t border-line-soft pt-3">
                <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Umfang</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <ScopeChip active={testScope.kind === "all"} onClick={() => setTestScope({ kind: "all" })}>
                    Alle Themen
                  </ScopeChip>
                  {(["calculus", "quantitative"] as MathTopicGroup[]).map((g) => (
                    <ScopeChip
                      key={g}
                      active={testScope.kind === "group" && testScope.group === g}
                      onClick={() => setTestScope({ kind: "group", group: g })}
                    >
                      {MATH_GROUP_LABEL[g]}
                    </ScopeChip>
                  ))}
                  {MATH_TOPICS.map((t) => (
                    <ScopeChip
                      key={t}
                      active={testScope.kind === "topic" && testScope.topic === t}
                      onClick={() => setTestScope({ kind: "topic", topic: t })}
                    >
                      {MATH_TOPIC_META[t].label}
                    </ScopeChip>
                  ))}
                </div>

                <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Länge</div>
                <div className="flex gap-1.5 mb-4">
                  {MATH_TEST_LENGTH_OPTIONS.map((l) => (
                    <ScopeChip key={l} active={testLength === l} onClick={() => setTestLength(l)}>
                      {l} Fragen
                    </ScopeChip>
                  ))}
                </div>

                <Button
                  onClick={() => onStartTest(testScope, testLength)}
                  variant="ghost"
                  className="h-auto w-full rounded-full bg-gradient-to-r from-ink to-ink/80 hover:brightness-125 hover:text-white text-white font-semibold py-3 text-[14.5px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
                >
                  <Play size={14} /> Test starten
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function VocabCard({
  icon,
  tint,
  title,
  learned,
  total,
  grad,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  learned: number;
  total: number;
  grad: string;
  onClick: () => void;
}) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl bg-card border border-line-soft px-4 py-3.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <span className={"w-9 h-9 rounded-full flex items-center justify-center mb-2 " + tint}>{icon}</span>
      <div className="text-[13.5px] font-semibold text-ink leading-tight">{title}</div>
      <div className="text-[11.5px] text-ink-faint tabular-nums mb-2">
        {learned} / {total}
      </div>
      <div className="h-1.5 rounded-full bg-line-soft overflow-hidden">
        <div className={"h-full rounded-full bg-gradient-to-r " + grad} style={{ width: pct + "%" }} />
      </div>
    </button>
  );
}

function ActionCard({
  icon,
  tint,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-card border border-line-soft px-4 py-3.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-3.5"
    >
      <span className={"w-10 h-10 rounded-full flex items-center justify-center shrink-0 " + tint}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink">{title}</div>
        <div className="text-[11.5px] text-ink-faint truncate">{subtitle}</div>
      </div>
      <ChevronRight size={16} className="text-ink-faint shrink-0" />
    </button>
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
