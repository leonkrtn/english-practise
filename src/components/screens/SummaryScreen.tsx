"use client";

import { useEffect, useMemo } from "react";
import { ArrowUpRight, PartyPopper, Sparkles, Zap } from "lucide-react";
import { VOCAB_BY_ID } from "@/lib/vocab";
import { GRAMMAR_RULES_BY_ID } from "@/lib/grammar-data";
import { useStore } from "@/lib/store";
import { levelProgress } from "@/lib/gamification";
import { useCountUp } from "@/lib/useCountUp";
import { BadgeMedal } from "@/components/BadgeIcon";
import type { Badge } from "@/lib/gamification";
import type { ResultEntry } from "@/lib/types";
import type { GrammarResultEntry } from "@/lib/grammarTypes";

export interface SummaryStats {
  correct: number;
  almost: number;
  incorrect: number;
  total: number;
  accuracy: number;
  newWordsCount: number;
  results: ResultEntry[];
  /** Only present for a session that included grammar. */
  grammarResults?: GrammarResultEntry[];
  /** Learning-session only: words that reached the final "schreiben" stage and now enter long-term review. */
  wordsMastered?: number;
  /** Learning-session only: words still in progress, picked up again in a future session. */
  wordsInProgress?: number;
  rulesMastered?: number;
  rulesInProgress?: number;
  /** XP this session paid out, and the total the learner had before it — together they're what
   * makes a level-up during the session visible on this screen. */
  xpEarned: number;
  xpBefore: number;
  bestCombo: number;
  /** Badges unlocked by this session, filled in by AppShell once progress has been persisted. */
  newBadges?: Badge[];
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

  const wrongRuleIds = useMemo(
    () => [...new Set((stats.grammarResults || []).filter((r) => r.result !== "correct").map((r) => r.ruleId))],
    [stats.grammarResults]
  );

  const shownAccuracy = useCountUp(stats.accuracy, 1000);
  const shownXp = useCountUp(stats.xpEarned, 900);

  const before = levelProgress(stats.xpBefore);
  const after = levelProgress(stats.xpBefore + stats.xpEarned);
  const leveledUp = after.level > before.level;

  // Enter goes home, R repeats the mistakes — same two actions as the buttons, so finishing a
  // session and starting the follow-up drill never needs the mouse.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === "Enter") {
        if (activeTag === "BUTTON" || activeTag === "A") return;
        e.preventDefault();
        onHome();
        return;
      }
      if (e.key.toLowerCase() === "r" && wrongWordIds.length > 0) {
        e.preventDefault();
        onRepeat(wrongWordIds);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHome, onRepeat, wrongWordIds]);

  return (
    <section className="animate-fade-in pb-4">
      <div className="text-center py-8 px-5">
        <div className="text-[52px] font-extrabold tracking-tight text-blue tabular-nums leading-none">{shownAccuracy}%</div>
        <div className="text-[15px] text-ink-faint mt-1.5">
          {stats.total} Fragen · {stats.newWordsCount} neu
        </div>
      </div>

      {/* The reward block, deliberately directly under the headline number: XP earned, where that
          leaves the level bar, and the session's best combo. */}
      <div className="bg-gradient-to-br from-ink to-ink/80 text-white rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Sparkles size={19} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-extrabold tabular-nums leading-none">+{shownXp} XP</div>
            <div className="text-[11.5px] text-white/70 mt-1">
              Level {after.level} · {after.title}
            </div>
          </div>
          {stats.bestCombo >= 3 && (
            <div className="flex items-center gap-1 text-[12px] font-bold bg-white/15 rounded-full px-2.5 py-1 shrink-0">
              <Zap size={12} fill="currentColor" /> {stats.bestCombo}x Combo
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="relative h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-[width] duration-1000 ease-out" style={{ width: after.pct + "%" }} />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-white/60 tabular-nums">
            <span>
              {after.intoLevel} / {after.levelSpan} XP
            </span>
            <span>noch {after.remaining} bis Level {after.level + 1}</span>
          </div>
        </div>
        {leveledUp && (
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center gap-2 text-[13px] font-semibold animate-pop-in">
            <ArrowUpRight size={15} />
            Level {before.level} → {after.level}: {after.title}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <SStat value={stats.correct} label="Richtig" color="text-green" />
        <SStat value={stats.almost} label="Fast" color="text-amber" />
        <SStat value={stats.incorrect} label="Falsch" color="text-red" />
      </div>

      {(!!stats.wordsMastered || !!stats.wordsInProgress || !!stats.rulesMastered || !!stats.rulesInProgress) && (
        <div className="flex flex-wrap gap-2.5 mb-4">
          {!!stats.wordsMastered && (
            <div className="flex-1 min-w-[45%] bg-green-light border border-green/20 rounded-xl px-4 py-3.5 text-center">
              <div className="text-[19px] font-bold text-green tabular-nums">{stats.wordsMastered}</div>
              <div className="text-[12px] text-[#0d7a4f] mt-0.5">{stats.wordsMastered === 1 ? "Wort gelernt" : "Wörter gelernt"}</div>
            </div>
          )}
          {!!stats.wordsInProgress && (
            <div className="flex-1 min-w-[45%] bg-blue-light border border-blue/20 rounded-xl px-4 py-3.5 text-center">
              <div className="text-[19px] font-bold text-blue-dark tabular-nums">{stats.wordsInProgress}</div>
              <div className="text-[12px] text-blue-dark mt-0.5">Wörter in Arbeit</div>
            </div>
          )}
          {!!stats.rulesMastered && (
            <div className="flex-1 min-w-[45%] bg-green-light border border-green/20 rounded-xl px-4 py-3.5 text-center">
              <div className="text-[19px] font-bold text-green tabular-nums">{stats.rulesMastered}</div>
              <div className="text-[12px] text-[#0d7a4f] mt-0.5">{stats.rulesMastered === 1 ? "Regel gelernt" : "Regeln gelernt"}</div>
            </div>
          )}
          {!!stats.rulesInProgress && (
            <div className="flex-1 min-w-[45%] bg-purple-light border border-purple/20 rounded-xl px-4 py-3.5 text-center">
              <div className="text-[19px] font-bold text-purple tabular-nums">{stats.rulesInProgress}</div>
              <div className="text-[12px] text-purple mt-0.5">Regeln in Arbeit</div>
            </div>
          )}
        </div>
      )}

      {!!stats.newBadges?.length && (
        <div className="bg-card border border-amber/30 rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(232,161,46,0.35)] mb-4">
          <div className="text-[13px] font-semibold text-ink mb-3">Neu freigeschaltet</div>
          <div className="flex flex-col gap-2.5">
            {stats.newBadges.map((b) => (
              <div key={b.id} className="flex items-center gap-3 animate-pop-in">
                <BadgeMedal badge={b} earned size={36} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink">{b.title}</div>
                  <div className="text-[11.5px] text-ink-faint">{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight mb-3.5">Personal Review</h2>
        {wrongWordIds.length === 0 && wrongRuleIds.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 px-5 text-ink-faint text-sm">
            <PartyPopper size={22} className="text-blue" />
            Perfekte Session — nichts zu wiederholen!
          </div>
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
              {wrongRuleIds.slice(0, 12).map((id) => {
                const rule = GRAMMAR_RULES_BY_ID[id];
                if (!rule) return null;
                return (
                  <div key={id} className="flex justify-between items-center px-3.5 py-2.5 bg-card border border-line-soft rounded-[10px] text-sm">
                    <span>
                      {rule.title} <span className="text-ink-faint">— {rule.category}</span>
                    </span>
                    <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-purple-light text-purple">review</span>
                  </div>
                );
              })}
            </div>
            {topError && (
              <p className="text-ink-soft text-[15px] mt-3.5 mb-1">
                Häufigster Fehler: <b>{topError[0]}</b>
              </p>
            )}
            {weakestFormat && (
              <p className="text-ink-soft text-[15px] m-0">
                Schwächstes Format: <b>{weakestFormat}</b> ({Math.round(weakestAcc * 100)}% richtig)
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2.5">
        <button onClick={onHome} className="flex-1 rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3.5 text-[15px] transition-colors">
          Home
        </button>
        {wrongWordIds.length > 0 && (
          <button
            onClick={() => onRepeat(wrongWordIds)}
            className="flex-1 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3.5 text-[15px] transition-colors"
          >
            Fehler wiederholen
          </button>
        )}
      </div>
    </section>
  );
}

function SStat({ value, label, color }: { value: number; label: string; color: string }) {
  const shown = useCountUp(value, 700);
  return (
    <div className="text-center px-2 py-3.5 bg-card border border-line-soft rounded-xl">
      <div className={"text-[19px] font-bold tabular-nums " + color}>{shown}</div>
      <div className="text-[11px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}
