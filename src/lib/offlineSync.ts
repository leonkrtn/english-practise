import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * A single queued write, persisted in localStorage and replayed against Supabase once the
 * browser is back online. `dedupeKey` groups writes to the same row: a later write for an
 * already-queued key merges its values into that entry (last value per field wins) instead of
 * piling up duplicate upserts for a word or setting touched repeatedly in one offline session.
 * Ops without a dedupeKey (the two append-only history tables) are never merged — every
 * session/test recorded offline has to survive as its own row.
 */
export interface QueuedWrite {
  table: string;
  mode: "upsert" | "insert";
  values: Record<string, unknown>;
  onConflict?: string;
  dedupeKey?: string;
}

function outboxKey(namespace: string) {
  return `vt:outbox:${namespace}`;
}

function snapshotKey(namespace: string) {
  return `vt:snapshot:${namespace}`;
}

export function loadQueue(namespace: string): QueuedWrite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(outboxKey(namespace));
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(namespace: string, queue: QueuedWrite[]) {
  if (typeof window === "undefined") return;
  try {
    if (queue.length === 0) window.localStorage.removeItem(outboxKey(namespace));
    else window.localStorage.setItem(outboxKey(namespace), JSON.stringify(queue));
  } catch (e) {
    console.error("Could not persist offline queue", e);
  }
}

/** Queues a write that just failed (presumably due to being offline) so it can be retried later. */
export function enqueueWrite(namespace: string, write: QueuedWrite) {
  const queue = loadQueue(namespace);
  const existing = write.dedupeKey ? queue.find((w) => w.table === write.table && w.dedupeKey === write.dedupeKey) : undefined;
  if (existing) {
    existing.values = { ...existing.values, ...write.values };
    existing.mode = write.mode;
    existing.onConflict = write.onConflict;
  } else {
    queue.push(write);
  }
  saveQueue(namespace, queue);
}

export function pendingCount(namespace: string): number {
  return loadQueue(namespace).length;
}

/**
 * Replays the queue against Supabase in order, removing each write as it succeeds. Stops — and
 * leaves the rest queued — at the first failure, since a failure this early almost always means
 * we're offline again and everything behind it would fail too; stopping keeps their relative
 * order intact for the next attempt instead of reshuffling them.
 */
export async function flushQueue(namespace: string, client: SupabaseClient): Promise<{ flushed: number; remaining: number }> {
  const queue = loadQueue(namespace);
  let flushed = 0;
  while (queue.length > 0) {
    const write = queue[0];
    const { error } = await (write.mode === "upsert"
      ? client.from(write.table).upsert(write.values, write.onConflict ? { onConflict: write.onConflict } : undefined)
      : client.from(write.table).insert(write.values));
    if (error) break;
    queue.shift();
    flushed++;
    saveQueue(namespace, queue);
  }
  return { flushed, remaining: queue.length };
}

/** Caches the full loaded store state locally so the app can boot from it when the initial
 * Supabase fetch fails while offline — a plain object, already stripped of Sets/Maps by the
 * caller (JSON can't round-trip those). */
export function saveSnapshot(namespace: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(snapshotKey(namespace), JSON.stringify(data));
  } catch (e) {
    console.error("Could not save offline snapshot", e);
  }
}

export function loadSnapshot<T>(namespace: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(snapshotKey(namespace));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
