"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "./store";
import { useGrammarStore } from "./grammarStore";
import { buildBadgeSnapshot } from "./progressStats";
import { BADGES_BY_ID, newlyEarnedBadges, type Badge } from "./gamification";

/**
 * Watches both stores for newly earned badges, persists them, and reports the ones unlocked since
 * the current run started.
 *
 * Evaluated continuously rather than at the end of each session, for two reasons: progress writes
 * are asynchronous (checking inside endLearningSession would read pre-update counts and miss the
 * very word that earned the badge), and some conditions — a streak ticking over at midnight, a
 * level-up from banked XP — aren't tied to a session ending at all.
 */
export function useBadgeTracking() {
  const store = useStore();
  const grammarStore = useGrammarStore();

  // Longest combo of the session that just ended. Lives in state rather than a ref because the
  // snapshot below has to be re-evaluated when it changes.
  const [lastBestCombo, setLastBestCombo] = useState(0);
  // Which badges were already unlocked when the current session/test began. Everything unlocked
  // since is what the summary celebrates — captured at start rather than accumulated as the session
  // runs, so "new" stays a pure comparison against a fixed point instead of state that has to be
  // appended to and cleared at exactly the right moments.
  const [baseline, setBaseline] = useState<ReadonlySet<string>>(() => new Set());

  const badgesEarnedNow = useMemo(() => {
    if (!store.ready || !grammarStore.ready) return [];
    const snapshot = buildBadgeSnapshot({
      words: store.words,
      blockedWordIds: store.blockedWordIds,
      rules: grammarStore.rules,
      blockedRuleIds: grammarStore.blockedRuleIds,
      sessionHistory: store.sessionHistory,
      grammarSessionHistory: grammarStore.sessionHistory,
      testHistory: store.testHistory,
      xp: store.xp,
      bestCombo: lastBestCombo,
    });
    return newlyEarnedBadges(snapshot, store.badgeIds);
  }, [
    store.ready,
    grammarStore.ready,
    store.words,
    store.blockedWordIds,
    store.badgeIds,
    store.xp,
    store.sessionHistory,
    store.testHistory,
    grammarStore.rules,
    grammarStore.blockedRuleIds,
    grammarStore.sessionHistory,
    lastBestCombo,
  ]);

  // Persisting is the only side effect here; what the summary shows is derived from the store
  // below, so this effect neither owns nor duplicates that list.
  const unlockBadges = store.unlockBadges;
  useEffect(() => {
    if (badgesEarnedNow.length === 0) return;
    unlockBadges(badgesEarnedNow.map((b) => b.id));
  }, [badgesEarnedNow, unlockBadges]);

  /** Badges unlocked since the current session/test started — what the summary/result celebrates. */
  const newBadges: Badge[] = useMemo(
    () => [...store.badgeIds].filter((id) => !baseline.has(id)).map((id) => BADGES_BY_ID[id]).filter(Boolean),
    [store.badgeIds, baseline]
  );

  /** Called by every "start something" path: freezes the baseline so the run that follows can
   * report exactly what it earned. */
  const beginRun = useCallback(() => {
    setBaseline(new Set(store.badgeIds));
  }, [store.badgeIds]);

  return { newBadges, beginRun, setLastBestCombo };
}
