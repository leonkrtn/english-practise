"use client";

import { useMemo } from "react";
import { Calculator, ChevronRight, Landmark, Sigma } from "lucide-react";
import { useStore } from "@/lib/store";
import { VOCAB } from "@/lib/vocab";
import { MATH_RULES } from "@/lib/mathRules";

function ProgressBar({ pct, grad }: { pct: number; grad: string }) {
  return (
    <div className="h-1.5 rounded-full bg-line-soft overflow-hidden mt-2.5">
      <div className={"h-full rounded-full bg-gradient-to-r " + grad} style={{ width: pct + "%" }} />
    </div>
  );
}

function TrackCard({
  icon,
  iconTint,
  title,
  subtitle,
  learned,
  total,
  grad,
  onClick,
}: {
  icon: React.ReactNode;
  iconTint: string;
  title: string;
  subtitle: string;
  learned: number;
  total: number;
  grad: string;
  onClick: () => void;
}) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl px-5 py-4 bg-card border border-line-soft shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3.5">
        <span className={"w-11 h-11 rounded-full flex items-center justify-center shrink-0 " + iconTint}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-ink">{title}</div>
          <div className="text-[12.5px] text-ink-faint">{subtitle}</div>
        </div>
        <ChevronRight size={18} className="text-ink-faint shrink-0" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <ProgressBar pct={pct} grad={grad} />
      </div>
      <div className="text-[11.5px] text-ink-faint tabular-nums mt-1.5">
        {learned} / {total} gelernt
      </div>
    </button>
  );
}

export default function FinanceHomeScreen({
  onStartVocab,
  onStartMath,
}: {
  onStartVocab: (scope: "finance" | "math") => void;
  onStartMath: () => void;
}) {
  const store = useStore();

  const vocabCounts = useMemo(() => {
    const count = (category: "finance" | "math") => {
      const pool = VOCAB.filter((w) => w.category === category && !store.blockedWordIds.has(w.id));
      const learned = pool.filter((w) => store.words[w.id]?.stage === 4).length;
      return { learned, total: pool.length };
    };
    return { finance: count("finance"), math: count("math") };
  }, [store.words, store.blockedWordIds]);
  const { finance, math } = vocabCounts;
  const differentiation = useMemo(() => {
    const learned = MATH_RULES.filter((r) => store.words[r.id]?.stage === 4).length;
    return { learned, total: MATH_RULES.length };
  }, [store.words]);

  return (
    <section className="animate-fade-in pb-4">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">Finance</h1>
      <p className="text-ink-soft text-[13.5px] mb-5 leading-snug">Corporate Finance, Mathe-Vokabeln und Differentiationsregeln.</p>

      <div className="flex flex-col gap-3">
        <TrackCard
          icon={<Landmark size={19} />}
          iconTint="bg-green-light text-green"
          title="Corporate Finance"
          subtitle="Bilanz, Bewertung, M&A-Vokabular"
          learned={finance.learned}
          total={finance.total}
          grad="from-green to-green-dark"
          onClick={() => onStartVocab("finance")}
        />
        <TrackCard
          icon={<Sigma size={19} />}
          iconTint="bg-amber-light text-amber"
          title="Mathematik-Vokabular"
          subtitle="Englische Begriffe für Mathematik & Statistik"
          learned={math.learned}
          total={math.total}
          grad="from-amber to-amber-dark"
          onClick={() => onStartVocab("math")}
        />
        <TrackCard
          icon={<Calculator size={19} />}
          iconTint="bg-purple-light text-purple"
          title="Differentiation"
          subtitle="Ableitungsregeln lernen und anwenden"
          learned={differentiation.learned}
          total={differentiation.total}
          grad="from-purple to-purple-dark"
          onClick={onStartMath}
        />
      </div>
    </section>
  );
}
