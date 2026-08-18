"use client";

import { useMemo } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { DAY_MS } from "@/lib/progressStats";
import { levelProgress } from "@/lib/gamification";

/**
 * The building blocks both home screens are made of.
 *
 * These used to live as private functions inside HomeScreen.tsx, which meant the Finance home had
 * to reimplement look-alikes and the two drifted apart on every change. Sharing the literal
 * components is what keeps "Mathematics looks like Vocabulary" true by construction rather than by
 * a designer remembering to update both.
 */

export function ProgressRing({
  pct,
  from,
  to,
  size = 92,
  stroke = 9,
  gradientId = "home-ring-grad",
  children,
}: {
  pct: number;
  from: string;
  to: string;
  size?: number;
  stroke?: number;
  /** Must be unique per ring rendered on the same page — two <defs> with one id collide. */
  gradientId?: string;
  children: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function StatRow({ icon, value, label, tint }: { icon: React.ReactNode; value: string | number; label: string; tint: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={"w-7 h-7 rounded-full flex items-center justify-center shrink-0 " + tint}>{icon}</span>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[15px] font-bold tracking-tight tabular-nums">{value}</span>
        <span className="text-[11.5px] text-ink-faint truncate">{label}</span>
      </div>
    </div>
  );
}

export function StatChip({ icon, value, label, tint }: { icon: React.ReactNode; value: string | number; label: string; tint: string }) {
  return (
    <div className="bg-card border border-line-soft rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
      <span className={"w-7 h-7 rounded-full flex items-center justify-center shrink-0 " + tint}>{icon}</span>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[15px] font-bold tracking-tight tabular-nums">{value}</span>
        <span className="text-[11.5px] text-ink-faint truncate">{label}</span>
      </div>
    </div>
  );
}

/** A labelled progress bar. `inProgress` renders as a translucent second segment, so work that is
 * started but not yet mastered is visible instead of the bar sitting at zero. */
export function MiniBar({
  label,
  learned,
  total,
  grad,
  inProgress = 0,
  onClick,
  trailing,
}: {
  label: string;
  learned: number;
  total: number;
  grad: string;
  inProgress?: number;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  const pendingPct = total ? Math.round((inProgress / total) * 100) : 0;
  const body = (
    <>
      <div className="flex justify-between items-baseline mb-1.5 text-[11.5px] gap-2">
        <span className="text-ink-soft font-semibold truncate">{label}</span>
        <span className="text-ink-faint tabular-nums shrink-0 flex items-center gap-1.5">
          {trailing}
          {learned}/{total}
        </span>
      </div>
      <div className="h-1.5 bg-line-soft rounded-full overflow-hidden flex">
        <div className={"h-full bg-gradient-to-r transition-[width] duration-500 " + grad} style={{ width: pct + "%" }} />
        {pendingPct > 0 && (
          <div className={"h-full bg-gradient-to-r opacity-30 transition-[width] duration-500 " + grad} style={{ width: pendingPct + "%" }} />
        )}
      </div>
    </>
  );

  if (!onClick) return <div className="bg-card border border-line-soft rounded-xl px-3.5 py-2.5">{body}</div>;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-line-soft rounded-xl px-3.5 py-2.5 transition-all hover:border-line hover:-translate-y-0.5 hover:shadow-sm"
    >
      {body}
    </button>
  );
}

export function LevelCard({ xp, badgesEarned }: { xp: number; badgesEarned: number }) {
  const p = levelProgress(xp);
  return (
    <div className="bg-gradient-to-br from-ink to-ink/80 text-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-[17px] font-extrabold tabular-nums">
          {p.level}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold truncate">{p.title}</div>
          <div className="text-[11.5px] text-white/70 tabular-nums">{xp} XP total</div>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-white/85 shrink-0">
          <Trophy size={13} /> {badgesEarned}
        </div>
      </div>
      <div className="mt-3">
        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: p.pct + "%" }} />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-white/60 tabular-nums">
          <span className="flex items-center gap-1">
            <Sparkles size={10} /> {p.intoLevel} / {p.levelSpan} XP
          </span>
          <span>
            {p.remaining} to level {p.level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ChipRow<T extends string | number | boolean | null>({
  options,
  value,
  onChange,
}: {
  options: { val: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.val)}
          onClick={() => onChange(o.val)}
          className={
            "flex-1 text-[12.5px] font-semibold px-2 py-1.5 rounded-full border transition-colors " +
            (value === o.val ? "bg-ink text-white border-ink" : "border-line bg-bg text-ink-soft hover:bg-line-soft")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function buildActivityCells(dates: number[]): { day: number; count: number }[] {
  const days = 14;
  const today = Math.floor(Date.now() / DAY_MS);
  const counts: Record<number, number> = {};
  dates.forEach((d) => {
    const day = Math.floor(d / DAY_MS);
    counts[day] = (counts[day] || 0) + 1;
  });
  const result: { day: number; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = today - i;
    result.push({ day, count: counts[day] || 0 });
  }
  return result;
}

export function ActivityStrip({ dates }: { dates: number[] }) {
  const cells = useMemo(() => buildActivityCells(dates), [dates]);
  return (
    <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm">
      <div className="text-[13px] font-semibold text-ink mb-3">Last 14 days</div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => (
          <div
            key={c.day}
            title={`${new Date(c.day * DAY_MS).toLocaleDateString("en-GB")}: ${c.count} session(s)`}
            className={
              "aspect-square rounded-md " +
              (c.count === 0 ? "bg-line-soft" : c.count === 1 ? "bg-blue/45" : c.count === 2 ? "bg-blue/75" : "bg-gradient-to-br from-blue to-purple")
            }
          />
        ))}
      </div>
    </div>
  );
}

export function formatRelativeDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / DAY_MS);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
}

/** The mode-tab grid shared by both home screens. */
export function ModeTabs<T extends string>({
  modes,
  active,
  onChange,
  columns,
}: {
  modes: { val: T; label: string; icon: React.ComponentType<{ size?: number }>; grad: string; tint: string; glow: string }[];
  active: T;
  onChange: (val: T) => void;
  /** Tailwind grid-cols classes, e.g. "grid-cols-4 sm:grid-cols-7". */
  columns: string;
}) {
  return (
    <div className={"grid gap-2 mb-5 mt-1 " + columns}>
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = active === m.val;
        return (
          <button
            key={m.val}
            onClick={() => onChange(m.val)}
            className={
              "flex flex-col items-center gap-1.5 rounded-2xl px-1.5 py-3.5 text-center transition-all duration-200 " +
              (isActive
                ? `bg-gradient-to-br ${m.grad} text-white ${m.glow} scale-[1.02]`
                : "bg-card border border-line-soft text-ink-soft hover:border-line hover:-translate-y-0.5 hover:shadow-md")
            }
          >
            <span className={"w-8 h-8 rounded-full flex items-center justify-center transition-colors " + (isActive ? "bg-white/20" : m.tint)}>
              <Icon size={16} />
            </span>
            <span className="text-[11.5px] font-semibold">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** The sticky bottom action bar both home screens end with. */
export function StickyActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 pt-4 pb-2 -mx-5 px-5 bg-gradient-to-t from-bg from-65% to-transparent flex flex-col gap-2 lg:flex-row lg:gap-3">
      {children}
    </div>
  );
}

/** The primary "Start" button used at the bottom of both home screens. */
export function StartButton({
  onClick,
  children,
  grad = "from-blue to-blue-dark",
}: {
  onClick: () => void;
  children: React.ReactNode;
  grad?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full lg:flex-1 rounded-full text-white font-bold py-3.5 text-[16px] transition-all active:scale-[0.98] hover:brightness-110 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.45)] bg-gradient-to-r " +
        grad
      }
    >
      {children}
    </button>
  );
}
