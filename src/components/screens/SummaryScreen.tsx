"use client";

import { useMemo } from "react";
import { VOCAB_BY_ID } from "@/lib/vocab";
import { useStore } from "@/lib/store";
import type { ResultEntry } from "@/lib/types";

export interface SummaryStats {
  correct: number;
  almost: number;
  incorrect: number;
  total: number;
  accuracy: number;
  newWordsCount: number;
  results: ResultEntry[];
  /** Learning-session only: words that reached the final "schreiben" stage and now enter long-term review. */
  wordsMastered?: number;
  /** Learning-session only: words still in progress, picked up again in a future session. */
  wordsInProgress?: number;
}

export default function SummaryScreen({ stats, onHome, onRepeat }: { stats: SummaryStats; onHome: () => void; onRepeat: (wordIds: string[]) => void }) {
  const store = useStore();

  const { wrongWordIds, topError, weakestFormat, weakestAcc } = useMemo(() => {
    const wrongWordIds = [...new Set(stats.results.filter((r) => r.result !== "correct").map((r) => r.wordId))];
    const errorCounts: Record<string, number> = {};
    stats.results.forEach((r) => {
      if (r.errorType) errorCounts[r.errorType] = (errorCounts[r.errorType] || 0) + 1;
    });
    const topError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0] as [string, number] | undefined;

    const formatCounts: Record<string, { c: number; t: number }> = {};
    stats.results.forEach((r) => {
      if (!formatCounts[r.format]) formatCounts[r.format] = { c: 0, t: 0 };
      formatCounts[r.format].t++;
      if (r.result === "correct") formatCounts[r.format].c++;
    });
    let weakestFormat: string | null = null;
    let weakestAcc = 2;
    Object.entries(formatCounts).forEach(([f, v]) => {
      const acc = v.c / v.t;
      if (acc < weakestAcc) {
        weakestAcc = acc;
        weakestFormat = f;
      }
    });
    return { wrongWordIds, topError, weakestFormat, weakestAcc };
  }, [stats.results]);

  return (
    <section className="animate-fade-in">
      <div className="text-center py-9 px-5">
        <div className="text-[52px] font-extrabold tracking-tight text-blue">{stats.accuracy}%</div>
        <div className="text-[15px] text-ink-faint mt-1">
          {stats.total} questions · {stats.newWordsCount} new words practiced
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 my-6">
        <SStat value={stats.correct} label="Correct" color="text-green" />
        <SStat value={stats.almost} label="Almost" color="text-amber" />
        <SStat value={stats.incorrect} label="Incorrect" color="text-red" />
      </div>

      {(stats.wordsMastered !== undefined || stats.wordsInProgress !== undefined) && (
        <div className="flex gap-2.5 mb-7">
          {stats.wordsMastered !== undefined && stats.wordsMastered > 0 && (
            <div className="flex-1 bg-green-light border border-green/20 rounded-xl px-4 py-3.5 text-center">
              <div className="text-[19px] font-bold text-green">{stats.wordsMastered}</div>
              <div className="text-[12px] text-[#0d7a4f] mt-0.5">
                {stats.wordsMastered === 1 ? "Wort gelernt — kommt bald zur Wiederholung" : "Wörter gelernt — kommen bald zur Wiederholung"}
              </div>
            </div>
          )}
          {stats.wordsInProgress !== undefined && stats.wordsInProgress > 0 && (
            <div className="flex-1 bg-blue-light border border-blue/20 rounded-xl px-4 py-3.5 text-center">
              <div className="text-[19px] font-bold text-blue-dark">{stats.wordsInProgress}</div>
              <div className="text-[12px] text-blue-dark mt-0.5">weiter in Arbeit — nächstes Mal geht&apos;s weiter</div>
            </div>
          )}
        </div>
      )}
      <div className="mb-7">
        <h2 className="text-xl font-semibold tracking-tight mb-3.5">Personal Review</h2>
        {wrongWordIds.length === 0 ? (
          <div className="text-center py-16 px-5 text-ink-faint text-sm">Perfect session — no mistakes to review! 🎉</div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {wrongWordIds.slice(0, 12).map((id) => {
                const w = VOCAB_BY_ID[id];
                const mistake = store.wordState(id).recentMistake;
                return (
                  <div key={id} className="flex justify-between items-center px-3.5 py-2.5 bg-card border border-line-soft rounded-[10px] text-sm">
                    <span>
                      {w.en} — {w.de[0]}
                    </span>
                    <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-red-light text-[#b8271b]">{mistake ? "review" : "ok"}</span>
                  </div>
                );
              })}
            </div>
            {topError && (
              <p className="text-ink-soft text-[15px] mt-3.5 mb-1">
                Most common issue: <b>{topError[0]}</b>
              </p>
            )}
            {weakestFormat && (
              <p className="text-ink-soft text-[15px] m-0">
                Weakest format: <b>{weakestFormat}</b> ({Math.round(weakestAcc * 100)}% correct)
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex gap-2.5 mt-6">
        <button onClick={onHome} className="flex-1 rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3.5 text-[15px] transition-colors">
          Home
        </button>
        {wrongWordIds.length > 0 && (
          <button
            onClick={() => onRepeat(wrongWordIds)}
            className="flex-1 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3.5 text-[15px] transition-colors"
          >
            Repeat Mistakes
          </button>
        )}
      </div>
    </section>
  );
}

function SStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center px-2 py-3.5 bg-card border border-line-soft rounded-xl">
      <div className={"text-[19px] font-bold " + color}>{value}</div>
      <div className="text-[11px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}
