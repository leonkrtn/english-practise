"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock, RotateCcw, Sparkles, Target } from "lucide-react";
import { BAND_STYLES, type TestGrade, type TestQuestion, type TestAnswer, scoreAnswer } from "@/lib/testMode";
import { BadgeMedal } from "@/components/BadgeIcon";
import { useCountUp } from "@/lib/useCountUp";
import type { Badge } from "@/lib/gamification";

export interface TestResult {
  grade: TestGrade;
  questions: TestQuestion[];
  answers: Record<string, TestAnswer>;
  durationSeconds: number;
  xpEarned: number;
  newBadges: Badge[];
}

/**
 * The exam certificate. The grade counts up rather than appearing, and everything else on the
 * screen is arranged underneath it — the whole point of a graded test is that one number, so it
 * gets the room, and the per-question answer key sits collapsed below it for anyone who wants it.
 */
export default function TestResultScreen({ result, onHome, onRetry }: { result: TestResult; onHome: () => void; onRetry: () => void }) {
  const { grade } = result;
  const style = BAND_STYLES[grade.band];
  const shownGrade = useCountUp(grade.grade, 1200, 1);
  const shownXp = useCountUp(result.xpEarned, 900);
  const [keyOpen, setKeyOpen] = useState(false);

  const perDomain = useMemo(() => {
    const acc = { vocab: { points: 0, total: 0 }, grammar: { points: 0, total: 0 } };
    result.questions.forEach((q) => {
      acc[q.domain].total += 1;
      acc[q.domain].points += scoreAnswer(q, result.answers[q.id]);
    });
    return acc;
  }, [result.questions, result.answers]);

  return (
    <section className="animate-fade-in pb-4">
      <div className={"rounded-[22px] px-5 py-8 text-center mb-4 " + style.tint}>
        <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-soft mb-1">Nota final</div>
        <div className={"text-[64px] leading-none font-extrabold tracking-tight tabular-nums " + style.text}>
          {shownGrade.toFixed(1)}
          <span className="text-[26px] font-bold text-ink-faint"> / 20</span>
        </div>
        <div className={"inline-flex items-center gap-2 mt-3 rounded-full px-4 py-1.5 text-[14px] font-bold text-white bg-gradient-to-r " + style.grad}>
          {grade.bandLabel}
        </div>
        <div className="text-[12.5px] text-ink-soft mt-3">
          {grade.passed ? "Bestanden" : "Nicht bestanden"} · Bestehensgrenze 10 · Transkript-Note {grade.finalGrade}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <Tile icon={<Target size={13} />} value={`${formatPoints(grade.points)}/${grade.total}`} label="Punkte" />
        <Tile icon={<Target size={13} />} value={`${grade.accuracy}%`} label="Richtig" />
        <Tile icon={<Clock size={13} />} value={formatDuration(result.durationSeconds)} label="Dauer" />
      </div>

      {(perDomain.vocab.total > 0 || perDomain.grammar.total > 0) && (
        <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm mb-4">
          <div className="text-[13px] font-semibold text-ink mb-3">Nach Bereich</div>
          <div className="flex flex-col gap-2.5">
            {perDomain.vocab.total > 0 && (
              <DomainBar label="Vokabeln" points={perDomain.vocab.points} total={perDomain.vocab.total} grad="from-blue to-blue-dark" />
            )}
            {perDomain.grammar.total > 0 && (
              <DomainBar label="Grammatik" points={perDomain.grammar.points} total={perDomain.grammar.total} grad="from-purple to-purple-dark" />
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-gradient-to-r from-ink to-ink/85 text-white rounded-2xl px-4 py-3.5 mb-4">
        <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <Sparkles size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold tabular-nums">+{shownXp} XP</div>
          <div className="text-[11.5px] text-white/70">verdient in diesem Test</div>
        </div>
      </div>

      {result.newBadges.length > 0 && (
        <div className="bg-card border border-amber/30 rounded-2xl p-4 shadow-sm mb-4">
          <div className="text-[13px] font-semibold text-ink mb-3">Neu freigeschaltet</div>
          <div className="flex flex-col gap-2.5">
            {result.newBadges.map((b) => (
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

      <div className="bg-card border border-line-soft rounded-2xl shadow-sm mb-5 overflow-hidden">
        <button
          onClick={() => setKeyOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-line-soft/50 transition-colors"
        >
          <span className="text-[13px] font-semibold text-ink">Lösungen ansehen ({result.questions.length})</span>
          <ChevronDown size={16} className={"text-ink-faint transition-transform " + (keyOpen ? "rotate-180" : "")} />
        </button>
        {keyOpen && (
          <div className="border-t border-line-soft divide-y divide-line-soft animate-fade-in">
            {result.questions.map((q, i) => {
              const points = scoreAnswer(q, result.answers[q.id]);
              const given = formatGiven(q, result.answers[q.id]);
              return (
                <div key={q.id} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={
                        "mt-0.5 w-5 h-5 rounded-md text-[10.5px] font-bold flex items-center justify-center shrink-0 tabular-nums " +
                        (points === 1
                          ? "bg-green-light text-[#0d7a4f]"
                          : points > 0
                          ? "bg-amber-light text-[#96690f]"
                          : "bg-red-light text-[#b8271b]")
                      }
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-ink leading-snug">{q.prompt}</div>
                      <div className="text-[12px] mt-1 leading-relaxed">
                        <span className="text-ink-faint">Deine Antwort: </span>
                        <span className={points === 1 ? "text-[#0d7a4f] font-semibold" : "text-[#b8271b] font-semibold"}>{given || "—"}</span>
                        {points < 1 && (
                          <>
                            <span className="text-ink-faint"> · Richtig: </span>
                            <span className="text-ink font-semibold">{q.solution}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2.5">
        <button onClick={onHome} className="flex-1 rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3.5 text-[15px] transition-colors">
          Home
        </button>
        <button
          onClick={onRetry}
          className="flex-1 rounded-full bg-gradient-to-r from-ink to-ink/80 hover:brightness-125 text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        >
          <RotateCcw size={15} /> Neuer Test
        </button>
      </div>
    </section>
  );
}

function DomainBar({ label, points, total, grad }: { label: string; points: number; total: number; grad: string }) {
  const pct = total ? Math.round((points / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5 text-[12px]">
        <span className="text-ink-soft font-semibold">{label}</span>
        <span className="text-ink-faint tabular-nums">
          {formatPoints(points)}/{total} · {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-line-soft rounded-full overflow-hidden">
        <div className={"h-full rounded-full bg-gradient-to-r transition-[width] duration-700 " + grad} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function Tile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-card border border-line-soft rounded-xl px-3 py-3 text-center">
      <div className="flex items-center justify-center gap-1 text-[15px] font-bold tabular-nums">
        <span className="text-ink-faint">{icon}</span>
        {value}
      </div>
      <div className="text-[11px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}

/** Half points exist (a typed near-miss), so "12.5/25" must survive — but "12/25" shouldn't
 * render as "12.0/25". */
function formatPoints(points: number): string {
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

function formatGiven(q: TestQuestion, a: TestAnswer | undefined): string {
  if (!a) return "";
  if (a.kind === "mc") return a.chosen === null ? "" : q.options?.[a.chosen] ?? "";
  return a.text.trim();
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
