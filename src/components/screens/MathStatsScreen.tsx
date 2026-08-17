"use client";

import { useMemo } from "react";
import { Target, TrendingDown, Trophy, X } from "lucide-react";
import { MATH_RULES, MATH_TOPICS, MATH_TOPIC_META } from "@/lib/math";
import { topicProgress } from "@/lib/mathLearning";
import { labelForScopeId, mathBandFor, type MathTestRecord } from "@/lib/mathTest";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Every math-exercise format, with the label shown in the per-format accuracy table. */
const FORMAT_LABELS: [string, string][] = [
  ["math-learn", "Lernkarten"],
  ["math-mc", "Multiple Choice"],
  ["math-solve", "Solve"],
  ["math-simplify", "Simplify"],
  ["math-steps", "Schritt für Schritt"],
  ["math-error", "Fehler finden"],
  ["math-word", "Textaufgaben"],
];

export default function MathStatsScreen({ testHistory, onExit }: { testHistory: MathTestRecord[]; onExit: () => void }) {
  const store = useStore();

  const topics = useMemo(
    () => MATH_TOPICS.map((t) => topicProgress(t, store.wordState, store.totalPracticeSessions)),
    [store.wordState, store.totalPracticeSessions]
  );

  const overall = useMemo(() => {
    const learned = topics.reduce((n, t) => n + t.learned, 0);
    const total = topics.reduce((n, t) => n + t.total, 0);
    const due = topics.reduce((n, t) => n + t.due, 0);
    let correct = 0;
    let answered = 0;
    MATH_RULES.forEach((r) => {
      const s = store.words[r.id];
      if (!s) return;
      correct += s.timesCorrect;
      answered += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    return { learned, total, due, accuracy: answered ? Math.round((correct / answered) * 100) : 0, answered };
  }, [topics, store.words]);

  /** The rules that most need work: seen at least twice, ranked by how often they went wrong. */
  const weakest = useMemo(() => {
    return MATH_RULES.map((r) => {
      const s = store.words[r.id];
      const seen = s ? s.timesCorrect + s.timesAlmost + s.timesIncorrect : 0;
      const wrong = s ? s.timesIncorrect : 0;
      return { rule: r, seen, wrong, rate: seen > 0 ? wrong / seen : 0 };
    })
      .filter((e) => e.seen >= 2 && e.wrong > 0)
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
      .slice(0, 6);
  }, [store.words]);

  const formats = useMemo(
    () =>
      FORMAT_LABELS.map(([key, label]) => {
        const s = store.formatStats[key];
        const total = s ? s.correct + s.almost + s.incorrect : 0;
        return { label, total, accuracy: total ? Math.round((s!.correct / total) * 100) : 0 };
      }).filter((f) => f.total > 0),
    [store.formatStats]
  );

  const bestTest = testHistory.reduce<MathTestRecord | null>((best, t) => (!best || t.percent > best.percent ? t : best), null);
  const recentTests = testHistory.slice(-6).reverse();

  return (
    <section className="animate-fade-in pb-4">
      <div className="flex items-center gap-3 mb-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="Zurück"
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>Zurück</TooltipContent>
        </Tooltip>
        <h1 className="text-[22px] font-bold tracking-tight">Mathe-Statistik</h1>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatTile value={`${overall.learned}/${overall.total}`} label="Regeln gelernt" tint="bg-green-light text-green" icon={<Trophy size={14} />} />
        <StatTile value={`${overall.accuracy}%`} label="Genauigkeit" tint="bg-amber-light text-amber" icon={<Target size={14} />} />
        <StatTile value={String(overall.due)} label="Fällig" tint="bg-blue-light text-blue" icon={<TrendingDown size={14} />} />
      </div>

      <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Nach Thema</h2>
      <div className="flex flex-col gap-2 mb-5">
        {topics.map((t) => {
          const meta = MATH_TOPIC_META[t.topic];
          const pct = t.total ? Math.round((t.learned / t.total) * 100) : 0;
          return (
            <div key={t.topic} className="bg-card border border-line-soft rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[13.5px] font-semibold text-ink truncate">{meta.label}</span>
                <span className="text-[12px] text-ink-faint tabular-nums shrink-0">
                  {t.learned}/{t.total}
                  {t.due > 0 && <span className="text-blue font-semibold"> · {t.due} fällig</span>}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-line-soft overflow-hidden">
                <div className={"h-full rounded-full bg-gradient-to-r " + meta.grad} style={{ width: pct + "%" }} />
              </div>
            </div>
          );
        })}
      </div>

      {formats.length > 0 && (
        <>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Nach Aufgabentyp</h2>
          <div className="bg-card border border-line-soft rounded-2xl p-4 mb-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {formats.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="text-ink-soft truncate">{f.label}</span>
                  <span className="text-ink font-semibold tabular-nums shrink-0">{f.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {weakest.length > 0 && (
        <>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Schwächste Regeln</h2>
          <div className="bg-card border border-line-soft rounded-2xl overflow-hidden mb-5">
            {weakest.map((e, i) => (
              <div key={e.rule.id} className={"flex items-center gap-3 px-4 py-2.5 " + (i > 0 ? "border-t border-line-soft" : "")}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink truncate">{e.rule.title}</div>
                  <div className="text-[11px] text-ink-faint">{MATH_TOPIC_META[e.rule.topic].label}</div>
                </div>
                <span className="text-[12px] font-semibold text-red tabular-nums shrink-0">
                  {e.wrong}/{e.seen} falsch
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">Tests</h2>
      {testHistory.length === 0 ? (
        <div className="bg-card border border-line-soft rounded-2xl px-4 py-6 text-center text-[13.5px] text-ink-faint">
          Noch kein Test geschrieben.
        </div>
      ) : (
        <>
          {bestTest && (
            <div className="bg-card border border-line-soft rounded-2xl p-4 mb-2.5 flex items-center gap-3">
              <span className={"w-10 h-10 rounded-full flex items-center justify-center shrink-0 " + mathBandFor(bestTest.percent).tint}>
                <Trophy size={17} className={mathBandFor(bestTest.percent).text} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">Bestes Ergebnis</div>
                <div className="text-[12px] text-ink-faint tabular-nums">
                  {bestTest.percent}% · {bestTest.points}/{bestTest.total} Punkte
                </div>
              </div>
            </div>
          )}
          <div className="bg-card border border-line-soft rounded-2xl overflow-hidden">
            {recentTests.map((t, i) => (
              <div key={t.date} className={"flex items-center justify-between gap-3 px-4 py-2.5 " + (i > 0 ? "border-t border-line-soft" : "")}>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">{labelForScopeId(t.scope)}</div>
                  <div className="text-[11px] text-ink-faint">{new Date(t.date).toLocaleDateString("de-DE")}</div>
                </div>
                <span className={"text-[13px] font-bold tabular-nums shrink-0 " + mathBandFor(t.percent).text}>{t.percent}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function StatTile({ value, label, tint, icon }: { value: string; label: string; tint: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-line-soft rounded-2xl p-3.5 flex flex-col items-center text-center gap-1">
      <span className={"w-8 h-8 rounded-full flex items-center justify-center " + tint}>{icon}</span>
      <div className="text-[17px] font-bold tabular-nums leading-none mt-0.5">{value}</div>
      <div className="text-[11px] text-ink-faint leading-tight">{label}</div>
    </div>
  );
}
