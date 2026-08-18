"use client";

import { useMemo } from "react";
import { CheckCircle2, Flag, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import { activeGrammarRules } from "@/lib/grammarLearning";
import { computeGoalStatus, GOAL_WEEKS } from "@/lib/goal";

export default function GoalScreen() {
  const store = useStore();
  const grammarStore = useGrammarStore();

  const activeRules = useMemo(() => activeGrammarRules(grammarStore.blockedRuleIds), [grammarStore.blockedRuleIds]);

  const vocabCurrent = useMemo(() => Object.values(store.words).filter((w) => w.stage === 4).length, [store.words]);
  const grammarCurrent = useMemo(
    () => activeRules.filter((r) => grammarStore.rules[r.id]?.stage === 4).length,
    [activeRules, grammarStore.rules]
  );

  const status = useMemo(() => {
    if (store.goalStartedAt === null || store.goalBaselineTotal === null) return null;
    return computeGoalStatus({
      startedAt: store.goalStartedAt,
      baselineTotal: store.goalBaselineTotal,
      vocabCurrent,
      grammarTotalActive: activeRules.length,
      grammarCurrent,
    });
  }, [store.goalStartedAt, store.goalBaselineTotal, vocabCurrent, grammarCurrent, activeRules.length]);

  if (!status) {
    return (
      <section className="animate-fade-in">
        <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-5">Your {GOAL_WEEKS}-week goal</h1>
        <p className="text-ink-soft text-[14px]">Setting up your goal — reload the app if this stays here.</p>
      </section>
    );
  }

  const targetDateLabel = new Date(status.targetDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const daysRemainingRounded = Math.max(0, Math.ceil(status.daysRemaining));

  return (
    <section className="animate-fade-in pb-4">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">Your {GOAL_WEEKS}-week goal</h1>
      <p className="text-ink-soft text-[14px] mb-5 leading-relaxed">
        Every grammar fundamental plus {status.vocabTarget} core words — research puts that at most of everyday English, and it is the
        base that makes the language start to feel natural.
      </p>

      <div className="bg-card border border-line-soft rounded-2xl p-4.5 shadow-sm mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[13px] font-semibold text-ink-soft">Gesamtfortschritt</span>
          <span className="text-[22px] font-bold tracking-tight">{status.progressPct}%</span>
        </div>
        <div className="h-2.5 bg-line-soft rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue to-purple transition-[width] duration-500"
            style={{ width: status.progressPct + "%" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <MiniStat label={status.isPastDue ? "Goal period" : "Days left"} value={status.isPastDue ? "ended" : String(daysRemainingRounded)} />
          <MiniStat
            label="Status"
            value={status.progressPct >= 100 ? "done" : status.onTrack ? "on track" : "behind"}
            tone={status.progressPct >= 100 ? "good" : status.onTrack ? "good" : "warn"}
          />
        </div>
        <div className="text-[12px] text-ink-faint mt-3">Target date: {targetDateLabel}</div>
      </div>

      <h2 className="text-[15px] font-semibold tracking-tight mb-2.5">Breakdown</h2>
      <div className="flex flex-col gap-2.5 mb-4">
        <TargetBar label="Vocabulary" current={status.vocabCurrent} target={status.vocabTarget} grad="from-blue to-blue-dark" />
        <TargetBar label="Grammar" current={status.grammarCurrent} target={status.grammarTarget} grad="from-purple to-purple-dark" />
      </div>

      <div className="bg-card border border-line-soft rounded-2xl p-4.5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-ink-soft" />
          <span className="text-[13px] font-semibold text-ink-soft">Your pace</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <MiniStat label="Aktuell / Tag" value={status.velocityPerDay.toFixed(1)} />
          <MiniStat label="Needed / day" value={Number.isFinite(status.requiredVelocityPerDay) ? status.requiredVelocityPerDay.toFixed(1) : "—"} />
        </div>
        <div className="text-[13px] text-ink-soft leading-relaxed">
          {status.progressPct >= 100 ? (
            <span className="flex items-center gap-1.5 text-[#0d7a4f] font-semibold">
              <CheckCircle2 size={15} /> Geschafft — alle Grundlagen sitzen.
            </span>
          ) : status.projectedWeeks === null ? (
            "Not enough data for a projection yet — just get going and your pace will show up here."
          ) : status.onTrack ? (
            `At this pace you will be done in about ${Math.max(1, Math.round(status.projectedWeeks))} weeks — you are on track.`
          ) : (
            `At this pace it will take about ${Math.round(status.projectedWeeks)} weeks instead of ${GOAL_WEEKS}. A little more speed puts you back on track.`
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-[12px] text-ink-faint">
        <Flag size={13} /> Started on {new Date(status.startedAt).toLocaleDateString("en-GB")}
      </div>
    </section>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div className="bg-bg rounded-xl px-3 py-2.5">
      <div
        className={
          "text-[15px] font-bold tracking-tight capitalize " +
          (tone === "good" ? "text-[#0d7a4f]" : tone === "warn" ? "text-[#b8271b]" : "text-ink")
        }
      >
        {value}
      </div>
      <div className="text-[11px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}

function TargetBar({ label, current, target, grad }: { label: string; current: number; target: number; grad: string }) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="bg-card border border-line-soft rounded-xl px-3.5 py-3">
      <div className="flex justify-between items-baseline mb-1.5 text-[12.5px]">
        <span className="text-ink-soft font-semibold">{label}</span>
        <span className="text-ink-faint tabular-nums">
          {current}/{target}
        </span>
      </div>
      <div className="h-1.5 bg-line-soft rounded-full overflow-hidden">
        <div className={"h-full rounded-full bg-gradient-to-r transition-[width] duration-500 " + grad} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
