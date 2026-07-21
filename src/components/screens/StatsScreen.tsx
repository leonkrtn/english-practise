"use client";

import { useMemo } from "react";
import { VOCAB, VOCAB_BY_ID } from "@/lib/vocab";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import { activeGrammarRules } from "@/lib/grammarLearning";

const FMT_LABELS: Record<string, string> = {
  learn: "Kennenlernen",
  translate: "Direct Translation",
  gap: "Missing Word",
  mc: "Multiple Choice",
  sentence: "Sentence Translation",
  match: "Word Matching",
  build: "Sentence Building",
  multigap: "Fill Multiple Gaps",
  confusable: "Similar Words",
  "g-learn": "Kennenlernen",
  "g-mc": "Multiple Choice",
  "g-gap": "Lückentext",
  "g-build": "Satz umbauen",
  "g-error": "Fehler finden",
};

export default function StatsScreen() {
  const store = useStore();
  const grammarStore = useGrammarStore();

  const stats = useMemo(() => {
    const words = Object.entries(store.words);
    const practiced = words.filter(([, s]) => s.timesSeen > 0);
    const mastered = words.filter(([, s]) => s.stage === 4);
    const difficult = words.filter(([, s]) => s.timesSeen > 0 && s.score <= 2.5);
    const favorites = words.filter(([, s]) => s.favorite);
    let totalCorrect = 0,
      totalAll = 0;
    practiced.forEach(([, s]) => {
      totalCorrect += s.timesCorrect;
      totalAll += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    const overallAcc = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;

    const verbsTotal = VOCAB.filter((w) => w.type === "verb").length;
    const adjTotal = VOCAB.filter((w) => w.type === "adjective").length;
    const verbsPracticed = practiced.filter(([id]) => VOCAB_BY_ID[id]?.type === "verb").length;
    const adjPracticed = practiced.filter(([id]) => VOCAB_BY_ID[id]?.type === "adjective").length;

    return { practiced, mastered, difficult, favorites, overallAcc, verbsTotal, adjTotal, verbsPracticed, adjPracticed };
  }, [store.words]);

  const activeRules = useMemo(() => activeGrammarRules(grammarStore.blockedRuleIds), [grammarStore.blockedRuleIds]);

  const grammarStats = useMemo(() => {
    const activeIds = new Set(activeRules.map((r) => r.id));
    const rules = Object.entries(grammarStore.rules).filter(([id]) => activeIds.has(id));
    const practiced = rules.filter(([, s]) => s.timesSeen > 0);
    const known = rules.filter(([, s]) => s.stage === 4);
    let totalCorrect = 0,
      totalAll = 0;
    practiced.forEach(([, s]) => {
      totalCorrect += s.timesCorrect;
      totalAll += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    const overallAcc = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    return { practiced, known, overallAcc, total: activeRules.length };
  }, [activeRules, grammarStore.rules]);

  return (
    <section className="animate-fade-in">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-5">Statistics</h1>

      <h2 className="text-lg font-semibold tracking-tight mb-3">Vocabulary</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        <StatCard value={`${stats.practiced.length} / ${VOCAB.length}`} label="Words practiced" />
        <StatCard value={stats.mastered.length} label="Known" />
        <StatCard value={stats.difficult.length} label="Difficult" />
        <StatCard value={stats.favorites.length} label="Favorites" />
        <StatCard value={`${stats.overallAcc}%`} label="Overall accuracy" />
        <StatCard value={store.totalPracticeSessions || 0} label="Sessions completed" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight mb-3">Grammar</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        <StatCard value={`${grammarStats.practiced.length} / ${grammarStats.total}`} label="Rules practiced" />
        <StatCard value={grammarStats.known.length} label="Known" />
        <StatCard value={`${grammarStats.overallAcc}%`} label="Overall accuracy" />
        <StatCard value={grammarStore.totalPracticeSessions || 0} label="Sessions completed" />
      </div>

      <div className="mb-7">
        <h2 className="text-xl font-semibold tracking-tight mb-3.5">Accuracy by format</h2>
        {Object.keys(store.formatStats).length === 0 && Object.keys(grammarStore.formatStats).length === 0 ? (
          <p className="text-ink-soft text-[15px]">No sessions completed yet.</p>
        ) : (
          <>
            {Object.entries(store.formatStats).map(([f, v]) => {
              const total = v.correct + v.almost + v.incorrect;
              const acc = total ? Math.round((v.correct / total) * 100) : 0;
              return <BarRow key={f} label={FMT_LABELS[f] || f} value={acc + "%"} pct={acc} />;
            })}
            {Object.entries(grammarStore.formatStats).map(([f, v]) => {
              const total = v.correct + v.almost + v.incorrect;
              const acc = total ? Math.round((v.correct / total) * 100) : 0;
              return <BarRow key={f} label={(FMT_LABELS[f] || f) + " (Grammar)"} value={acc + "%"} pct={acc} />;
            })}
          </>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-3.5">Progress</h2>
        <BarRow label="Verbs" value={`${stats.verbsPracticed}/${stats.verbsTotal}`} pct={Math.round((stats.verbsPracticed / stats.verbsTotal) * 100)} />
        <BarRow label="Adjectives" value={`${stats.adjPracticed}/${stats.adjTotal}`} pct={Math.round((stats.adjPracticed / stats.adjTotal) * 100)} />
        <BarRow
          label="Grammar"
          value={`${grammarStats.practiced.length}/${grammarStats.total}`}
          pct={Math.round((grammarStats.practiced.length / grammarStats.total) * 100)}
        />
      </div>
    </section>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-card border border-line-soft rounded-[14px] p-4.5">
      <div className="text-[26px] font-bold tracking-tight">{value}</div>
      <div className="text-[12.5px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}

function BarRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5 text-[13px]">
      <div className="w-[120px] shrink-0 text-ink-soft">{label}</div>
      <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
        <div className="h-full bg-blue rounded-full" style={{ width: pct + "%" }} />
      </div>
      <div className="w-[38px] text-right text-ink-faint tabular-nums">{value}</div>
    </div>
  );
}
