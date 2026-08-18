"use client";

import { useEffect, useMemo, useState } from "react";
import { Blocks, BookOpen, Flame, GraduationCap, LayoutGrid, Sparkles, Target, Trophy } from "lucide-react";
import { VOCAB, VOCAB_BY_ID, countsTowardVocab, inIdiomScope } from "@/lib/vocab";
import { useStore } from "@/lib/store";
import { useGrammarStore } from "@/lib/grammarStore";
import { activeGrammarRules } from "@/lib/grammarLearning";
import { needsIntensification } from "@/lib/intensify";
import { buildCumulativeSeries, buildAccuracySeries } from "@/lib/chartData";
import { buildBadgeSnapshot, computeStreak } from "@/lib/progressStats";
import { levelProgress, BADGES, BADGE_GROUP_LABELS, type BadgeGroup } from "@/lib/gamification";
import { bandForGrade, BAND_STYLES } from "@/lib/testMode";
import { TrendLineChart, TrendBarChart } from "@/components/StatCharts";
import { BadgeCard } from "@/components/BadgeIcon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TREND_DAYS = 14;

const FMT_LABELS: Record<string, string> = {
  learn: "Introduction",
  translate: "Direct Translation",
  gap: "Missing Word",
  mc: "Multiple Choice",
  sentence: "Sentence Translation",
  match: "Word Matching",
  build: "Sentence Building",
  multigap: "Fill Multiple Gaps",
  confusable: "Similar Words",
  "g-learn": "Introduction",
  "g-mc": "Multiple Choice",
  "g-gap": "Gap fill",
  "g-build": "Rebuild sentence",
  "g-error": "Find the error",
  "g-conjugate": "Correct form",
  "g-translate": "Translate sentence",
  "g-transform": "Rewrite sentence",
  "g-situation": "Situation choice",
  writing: "Writing",
  linking: "Sentence Linking",
  "linking-vocab": "Learn connectors",
  "linking-essay": "Linking essay",
  speed: "Speed round",
  reading: "Reading",
};

/** Formats whose stats belong to a standalone practice mode rather than to grammar itself — they
 * live in the grammar store only because that's where their session history is filed. */
const NON_GRAMMAR_FORMATS = new Set(["writing", "linking", "linking-vocab", "linking-essay", "reading"]);

type Tab = "overview" | "vocab" | "grammar" | "tests" | "badges";

const TABS: { val: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { val: "overview", label: "Overview", icon: LayoutGrid },
  { val: "vocab", label: "Vocabulary", icon: BookOpen },
  { val: "grammar", label: "Grammar", icon: Blocks },
  { val: "tests", label: "Tests", icon: GraduationCap },
  { val: "badges", label: "Badges", icon: Trophy },
];

/**
 * Five focused tabs instead of one long scroll: the previous single page put twenty-odd numbers,
 * four charts and two lists in a row, which made none of them easy to find. The Übersicht tab now
 * answers "how am I doing" on its own, and each other tab holds exactly one topic.
 */
export default function StatsScreen() {
  const store = useStore();
  const grammarStore = useGrammarStore();
  const [tab, setTab] = useState<Tab>("overview");

  // 1-5 jump straight to a tab and the arrow keys walk them, matching how Home's mode tiles work.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= TABS.length) {
        e.preventDefault();
        setTab(TABS[num - 1].val);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setTab((current) => {
          const i = TABS.findIndex((t) => t.val === current);
          const next = e.key === "ArrowRight" ? (i + 1) % TABS.length : (i - 1 + TABS.length) % TABS.length;
          return TABS[next].val;
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const vocab = useMemo(() => {
    // Same set the Vocabulary session and the Home card use — excluded words and Finance-mode-only
    // math terms don't belong in this track's totals. See countsTowardVocab().
    const words = Object.entries(store.words).filter(([id]) => countsTowardVocab(id, store.blockedWordIds));
    const practiced = words.filter(([, s]) => s.timesSeen > 0);
    const mastered = words.filter(([, s]) => s.stage === 4);
    const difficult = words.filter(([, s]) => s.timesSeen > 0 && s.score <= 2.5);
    const favorites = words.filter(([, s]) => s.favorite);
    const intensify = words.filter(([, s]) => needsIntensification(s));
    let totalCorrect = 0;
    let totalAll = 0;
    practiced.forEach(([, s]) => {
      totalCorrect += s.timesCorrect;
      totalAll += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });

    const notBlocked = (w: { id: string }) => !store.blockedWordIds.has(w.id);
    const verbsTotal = VOCAB.filter((w) => w.type === "verb" && notBlocked(w)).length;
    const adjTotal = VOCAB.filter((w) => w.type === "adjective" && notBlocked(w)).length;
    const financeTotal = VOCAB.filter((w) => w.category === "finance" && notBlocked(w)).length;
    // Math is the one track the list above excludes, so it is counted straight from the catalogue.
    const mathTotal = VOCAB.filter((w) => w.category === "math" && notBlocked(w)).length;
    // Idioms are excluded from the Vocabulary track too — same reasoning as math.
    const idiomTotal = VOCAB.filter((w) => inIdiomScope(w) && notBlocked(w)).length;

    return {
      practiced,
      mastered,
      difficult,
      favorites,
      intensify,
      answers: totalAll,
      accuracy: totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0,
      verbsTotal,
      adjTotal,
      financeTotal,
      mathTotal,
      idiomTotal,
      verbsPracticed: practiced.filter(([id]) => VOCAB_BY_ID[id]?.type === "verb").length,
      adjPracticed: practiced.filter(([id]) => VOCAB_BY_ID[id]?.type === "adjective").length,
      financePracticed: practiced.filter(([id]) => VOCAB_BY_ID[id]?.category === "finance").length,
      // Math and idioms sit outside the Vocabulary track, so their progress is read from the raw
      // store rather than from `practiced` — which by definition contains neither.
      mathPracticed: Object.entries(store.words).filter(
        ([id, s]) => s.timesSeen > 0 && !store.blockedWordIds.has(id) && VOCAB_BY_ID[id]?.category === "math"
      ).length,
      idiomPracticed: Object.entries(store.words).filter(
        ([id, s]) => s.timesSeen > 0 && !store.blockedWordIds.has(id) && VOCAB_BY_ID[id]?.category === "idiom"
      ).length,
    };
  }, [store.words, store.blockedWordIds]);

  const topIntensify = useMemo(
    () =>
      vocab.intensify
        .slice()
        .sort((a, b) => b[1].hintsUsed / b[1].timesSeen - a[1].hintsUsed / a[1].timesSeen)
        .slice(0, 5)
        .map(([id, s]) => ({ word: VOCAB_BY_ID[id], state: s }))
        .filter((x) => x.word),
    [vocab.intensify]
  );

  const activeRules = useMemo(() => activeGrammarRules(grammarStore.blockedRuleIds), [grammarStore.blockedRuleIds]);

  const grammar = useMemo(() => {
    const activeIds = new Set(activeRules.map((r) => r.id));
    const rules = Object.entries(grammarStore.rules).filter(([id]) => activeIds.has(id));
    const practiced = rules.filter(([, s]) => s.timesSeen > 0);
    const known = rules.filter(([, s]) => s.stage === 4);
    let totalCorrect = 0;
    let totalAll = 0;
    practiced.forEach(([, s]) => {
      totalCorrect += s.timesCorrect;
      totalAll += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
    });
    return { practiced, known, answers: totalAll, accuracy: totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0, total: activeRules.length };
  }, [activeRules, grammarStore.rules]);

  const byCategory = useMemo(() => {
    const map: Record<string, { learned: number; total: number }> = {};
    activeRules.forEach((r) => {
      if (!map[r.category]) map[r.category] = { learned: 0, total: 0 };
      map[r.category].total++;
      if (grammarStore.rules[r.id]?.stage === 4) map[r.category].learned++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [activeRules, grammarStore.rules]);

  const streak = useMemo(
    () => computeStreak([...store.sessionHistory.map((s) => s.date), ...grammarStore.sessionHistory.map((s) => s.date)]),
    [store.sessionHistory, grammarStore.sessionHistory]
  );

  const overallAccuracy = useMemo(() => {
    const all = vocab.answers + grammar.answers;
    if (!all) return 0;
    return Math.round(((vocab.accuracy * vocab.answers + grammar.accuracy * grammar.answers) / all) * 1) / 1;
  }, [vocab.answers, vocab.accuracy, grammar.answers, grammar.accuracy]);

  // "Words learned over time" charts the Vocabulary track, so it uses the same set as the counters.
  const vocabCumulative = useMemo(
    () =>
      buildCumulativeSeries(
        Object.entries(store.words)
          .filter(([id]) => countsTowardVocab(id, store.blockedWordIds))
          .map(([, s]) => s),
        TREND_DAYS
      ),
    [store.words, store.blockedWordIds]
  );
  const vocabAccuracySeries = useMemo(() => buildAccuracySeries(store.sessionHistory, TREND_DAYS), [store.sessionHistory]);
  const grammarCumulative = useMemo(() => buildCumulativeSeries(Object.values(grammarStore.rules), TREND_DAYS), [grammarStore.rules]);
  const grammarAccuracySeries = useMemo(() => buildAccuracySeries(grammarStore.sessionHistory, TREND_DAYS), [grammarStore.sessionHistory]);

  const level = levelProgress(store.xp);
  const totalSessions = store.sessionHistory.length + grammarStore.sessionHistory.length;

  const tests = useMemo(() => {
    const history = store.testHistory;
    if (history.length === 0) return null;
    const grades = history.map((t) => t.grade);
    return {
      history: history.slice().reverse(),
      count: history.length,
      best: Math.max(...grades),
      average: Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10,
      passed: history.filter((t) => Math.round(t.grade) >= 10).length,
    };
  }, [store.testHistory]);

  const badgesByGroup = useMemo(() => {
    const groups = new Map<BadgeGroup, typeof BADGES>();
    BADGES.forEach((b) => {
      if (!groups.has(b.group)) groups.set(b.group, []);
      groups.get(b.group)!.push(b);
    });
    return [...groups.entries()];
  }, []);

  // The same snapshot the unlock check runs against, so a locked badge's "3/7" hint is measured
  // with exactly the numbers that will eventually unlock it.
  const badgeSnapshot = useMemo(
    () =>
      buildBadgeSnapshot({
        words: store.words,
        blockedWordIds: store.blockedWordIds,
        rules: grammarStore.rules,
        blockedRuleIds: grammarStore.blockedRuleIds,
        sessionHistory: store.sessionHistory,
        grammarSessionHistory: grammarStore.sessionHistory,
        testHistory: store.testHistory,
        xp: store.xp,
      }),
    [
      store.words,
      store.blockedWordIds,
      store.sessionHistory,
      store.testHistory,
      store.xp,
      grammarStore.rules,
      grammarStore.blockedRuleIds,
      grammarStore.sessionHistory,
    ]
  );

  return (
    <section className="animate-fade-in pb-4">
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-4">Statistiken</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full h-auto! justify-start rounded-none bg-transparent p-0 gap-1.5 mb-5 overflow-x-auto -mx-1 px-1 pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.val}
                value={t.val}
                className="h-auto shrink-0 flex items-center gap-1.5 rounded-full border border-line-soft bg-card px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft whitespace-nowrap transition-all hover:border-line hover:text-ink-soft data-active:border-ink data-active:bg-ink data-active:text-white data-active:shadow-sm"
              >
                <Icon size={13} />
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {tab === "overview" && (
        <>
          <div className="bg-gradient-to-br from-ink to-ink/80 text-white rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-[22px] font-extrabold tabular-nums">
                {level.level}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-bold truncate">{level.title}</div>
                <div className="text-[12px] text-white/70 tabular-nums mt-0.5">{store.xp} XP gesamt</div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end text-[15px] font-bold">
                  <Trophy size={14} /> {store.badgeIds.size}
                </div>
                <div className="text-[11px] text-white/60">von {BADGES.length} Erfolgen</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: level.pct + "%" }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-white/60 tabular-nums">
                <span className="flex items-center gap-1">
                  <Sparkles size={10} /> {level.intoLevel} / {level.levelSpan} XP
                </span>
                <span>noch {level.remaining} bis Level {level.level + 1}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Flame size={14} className="text-red" />} value={streak} label={"day streak"} />
            <StatCard icon={<Target size={14} className="text-amber" />} value={`${overallAccuracy}%`} label="Overall accuracy" />
            <StatCard icon={<BookOpen size={14} className="text-blue" />} value={vocab.mastered.length} label="Words learned" />
            <StatCard icon={<Blocks size={14} className="text-purple" />} value={`${grammar.known.length}/${grammar.total}`} label="Rules learned" />
          </div>

          <SectionTitle>Fortschritt</SectionTitle>
          <div className="bg-card border border-line-soft rounded-2xl p-4 mb-6">
            <BarRow label="Verbs" value={`${vocab.verbsPracticed}/${vocab.verbsTotal}`} pct={pct(vocab.verbsPracticed, vocab.verbsTotal)} />
            <BarRow label="Adjectives" value={`${vocab.adjPracticed}/${vocab.adjTotal}`} pct={pct(vocab.adjPracticed, vocab.adjTotal)} />
            <BarRow label="Finance" value={`${vocab.financePracticed}/${vocab.financeTotal}`} pct={pct(vocab.financePracticed, vocab.financeTotal)} />
            <BarRow label="Math" value={`${vocab.mathPracticed}/${vocab.mathTotal}`} pct={pct(vocab.mathPracticed, vocab.mathTotal)} />
            <BarRow label="Idioms" value={`${vocab.idiomPracticed}/${vocab.idiomTotal}`} pct={pct(vocab.idiomPracticed, vocab.idiomTotal)} />
            <BarRow label="Grammar" value={`${grammar.practiced.length}/${grammar.total}`} pct={pct(grammar.practiced.length, grammar.total)} last />
          </div>

          <SectionTitle>Sessions</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard value={totalSessions} label="Total sessions" />
            <StatCard value={store.totalPracticeSessions || 0} label="of which vocabulary" />
            <StatCard value={grammarStore.totalPracticeSessions || 0} label="of which grammar" />
            <StatCard value={tests?.count ?? 0} label="Tests geschrieben" />
          </div>
        </>
      )}

      {tab === "vocab" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <StatCard value={`${vocab.practiced.length} / ${VOCAB.length}`} label="Practised" />
            <StatCard value={vocab.mastered.length} label="Learned" />
            <StatCard value={`${vocab.accuracy}%`} label="Accuracy" />
            <StatCard value={vocab.difficult.length} label="Schwierig" />
            <StatCard value={vocab.intensify.length} label="Needs practice" />
            <StatCard value={vocab.favorites.length} label="Favoriten" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            <ChartCard title={`Words learned · last ${TREND_DAYS} days`}>
              <TrendLineChart points={vocabCumulative} gradFrom="#0071e3" gradTo="#0058b8" />
            </ChartCard>
            <ChartCard title={`Accuracy per day · last ${TREND_DAYS} days`}>
              <TrendBarChart points={vocabAccuracySeries} from="#0071e3" to="#8b5cf6" />
            </ChartCard>
          </div>

          <SectionTitle>Accuracy by format</SectionTitle>
          <FormatBars stats={store.formatStats} labels={FMT_LABELS} />

          {topIntensify.length > 0 && (
            <>
              <SectionTitle hint="Words where you needed a hint more often than average — even when the answer ended up correct.">
                Needs practice
              </SectionTitle>
              <div className="flex flex-col gap-2">
                {topIntensify.map(({ word, state }) => (
                  <div key={word.id} className="flex items-center justify-between gap-3 bg-card border border-line-soft rounded-xl px-3.5 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-ink">{word.en}</div>
                      <div className="text-[12px] text-ink-faint truncate">{word.de.join(" / ")}</div>
                    </div>
                    <div className="text-[12px] text-amber font-semibold whitespace-nowrap shrink-0">
                      {state.hintsUsed} Hints / {state.timesSeen}×
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === "grammar" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard value={`${grammar.practiced.length} / ${grammar.total}`} label="Practised" />
            <StatCard value={grammar.known.length} label="Learned" />
            <StatCard value={`${grammar.accuracy}%`} label="Accuracy" />
            <StatCard value={grammarStore.totalPracticeSessions || 0} label="Sessions" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            <ChartCard title={`Rules learned · last ${TREND_DAYS} days`}>
              <TrendLineChart points={grammarCumulative} gradFrom="#8b5cf6" gradTo="#6d3fd4" />
            </ChartCard>
            <ChartCard title={`Accuracy per day · last ${TREND_DAYS} days`}>
              <TrendBarChart points={grammarAccuracySeries} from="#8b5cf6" to="#0071e3" />
            </ChartCard>
          </div>

          {byCategory.length > 0 && (
            <>
              <SectionTitle>Nach Kategorie</SectionTitle>
              <div className="bg-card border border-line-soft rounded-2xl p-4 mb-6">
                {byCategory.map(([category, c], i) => (
                  <BarRow key={category} label={category} value={`${c.learned}/${c.total}`} pct={pct(c.learned, c.total)} last={i === byCategory.length - 1} />
                ))}
              </div>
            </>
          )}

          <SectionTitle hint="Reine Grammatikformate. Linking und Reading haben eigene Bereiche.">Accuracy by format</SectionTitle>
          <FormatBars
            stats={Object.fromEntries(Object.entries(grammarStore.formatStats).filter(([f]) => !NON_GRAMMAR_FORMATS.has(f)))}
            labels={FMT_LABELS}
          />

          <SectionTitle>Other practice</SectionTitle>
          <FormatBars
            stats={Object.fromEntries(Object.entries(grammarStore.formatStats).filter(([f]) => NON_GRAMMAR_FORMATS.has(f)))}
            labels={FMT_LABELS}
            emptyLabel="No linking or reading practice completed yet."
          />
        </>
      )}

      {tab === "tests" && (
        <>
          {!tests ? (
            <EmptyState
              icon={<GraduationCap size={22} className="text-ink-faint" />}
              text="No test taken yet. Start one from Test mode on the home screen — graded on the Portuguese 0-20 scale."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard value={tests.count} label={tests.count === 1 ? "Test" : "Tests"} />
                <StatCard value={tests.best.toFixed(1)} label="Beste Note" />
                <StatCard value={tests.average.toFixed(1)} label="Durchschnitt" />
                <StatCard value={`${tests.passed}/${tests.count}`} label="Passed" />
              </div>

              <SectionTitle hint="Bestehensgrenze 10 · 10–13 Suficiente · 14–15 Bom · 16–17 Muito Bom · 18–20 Excelente">
                Alle Tests
              </SectionTitle>
              <div className="flex flex-col gap-2">
                {tests.history.map((t, i) => {
                  const band = bandForGrade(t.grade);
                  const style = BAND_STYLES[band.band];
                  return (
                    <div key={i} className="flex items-center gap-3 bg-card border border-line-soft rounded-xl px-3.5 py-3">
                      <span className={"w-11 h-11 rounded-full flex items-center justify-center shrink-0 " + style.tint + " " + style.text}>
                        <span className="text-[15px] font-extrabold tabular-nums">{t.grade.toFixed(1)}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-semibold text-ink">
                          {band.label} <span className="text-ink-faint font-normal">· {scopeLabel(t.scope)}</span>
                        </div>
                        <div className="text-[11.5px] text-ink-faint tabular-nums">
                          {t.correct}/{t.total} richtig · {formatDuration(t.durationSeconds)} ·{" "}
                          {new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {tab === "badges" && (
        <>
          <div className="bg-card border border-line-soft rounded-2xl p-4 mb-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[13px] font-semibold text-ink">Badges unlocked</span>
              <span className="text-[13px] font-bold tabular-nums">
                {store.badgeIds.size} / {BADGES.length}
              </span>
            </div>
            <div className="h-2 bg-line-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber to-amber-dark transition-[width] duration-700"
                style={{ width: pct(store.badgeIds.size, BADGES.length) + "%" }}
              />
            </div>
          </div>

          {badgesByGroup.map(([group, badges]) => (
            <div key={group} className="mb-5">
              <SectionTitle>{BADGE_GROUP_LABELS[group]}</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                {badges.map((b) => (
                  <BadgeCard
                    key={b.id}
                    badge={b}
                    earned={store.badgeIds.has(b.id)}
                    progress={b.progress?.(badgeSnapshot)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function pct(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}

function scopeLabel(scope: string): string {
  return scope === "vocab" ? "Vocabulary" : scope === "grammar" ? "Grammar" : "Vocabulary + Grammar";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")} min`;
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[17px] font-semibold tracking-tight">{children}</h2>
      {hint && <p className="text-ink-faint text-[12.5px] mt-0.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-line-soft rounded-2xl p-4">
      <div className="text-[13px] font-semibold text-ink mb-2.5">{title}</div>
      {children}
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-card border border-line-soft rounded-[14px] px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[24px] font-bold tracking-tight tabular-nums leading-none">
        {icon}
        {value}
      </div>
      <div className="text-[12px] text-ink-faint mt-1.5">{label}</div>
    </div>
  );
}

function FormatBars({
  stats,
  labels,
  emptyLabel = "No sessions completed yet.",
}: {
  stats: Record<string, { correct: number; almost: number; incorrect: number }>;
  labels: Record<string, string>;
  emptyLabel?: string;
}) {
  const rows = Object.entries(stats)
    .map(([f, v]) => {
      const total = v.correct + v.almost + v.incorrect;
      return { format: f, total, accuracy: total ? Math.round((v.correct / total) * 100) : 0 };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  if (rows.length === 0) return <p className="text-ink-soft text-[13.5px] mb-6">{emptyLabel}</p>;

  return (
    <div className="bg-card border border-line-soft rounded-2xl p-4 mb-6">
      {rows.map((r, i) => (
        <BarRow key={r.format} label={labels[r.format] || r.format} value={r.accuracy + "%"} pct={r.accuracy} last={i === rows.length - 1} />
      ))}
    </div>
  );
}

/** Weakest bars are shown in amber/red so a problem area is visible without reading the numbers. */
function BarRow({ label, value, pct, last }: { label: string; value: string; pct: number; last?: boolean }) {
  const tone = pct >= 80 ? "bg-green" : pct >= 55 ? "bg-amber" : "bg-red";
  return (
    <div className={"flex items-center gap-2.5 text-[13px] " + (last ? "" : "mb-2.5")}>
      <div className="w-[130px] shrink-0 text-ink-soft truncate">{label}</div>
      <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-[width] duration-500 " + tone} style={{ width: pct + "%" }} />
      </div>
      <div className="w-[46px] text-right text-ink-faint tabular-nums shrink-0">{value}</div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center py-16 px-6 bg-card border border-line-soft rounded-2xl">
      {icon}
      <p className="text-ink-soft text-[13.5px] leading-relaxed max-w-[380px]">{text}</p>
    </div>
  );
}
