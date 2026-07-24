"use client";

import type { CumulativePoint, AccuracyPoint } from "@/lib/chartData";

const CHART_H = 100;
const CHART_W = 300;
const PAD_Y = 8;

/** Cumulative "learned over time" trend — a smooth line with a soft gradient fill beneath, since
 * this metric is monotonically non-decreasing by construction. */
export function TrendLineChart({ points, gradFrom, gradTo }: { points: CumulativePoint[]; gradFrom: string; gradTo: string }) {
  const gradId = `trend-line-${gradFrom.replace("#", "")}`;
  const counts = points.map((p) => p.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * CHART_W : CHART_W / 2;
    const y = PAD_Y + (1 - (p.count - min) / range) * (CHART_H - PAD_Y * 2);
    return { x, y, p };
  });

  const linePath = coords.map((c, i) => (i === 0 ? "M" : "L") + c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" ");
  const areaPath = linePath + ` L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  const flat = max === min;

  return (
    <div>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-[100px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradFrom} stopOpacity="0.35" />
            <stop offset="100%" stopColor={gradFrom} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={gradId + "-line"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gradFrom} />
            <stop offset="100%" stopColor={gradTo} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={`url(#${gradId}-line)`} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3.5 : 0} fill={gradTo}>
            <title>
              {c.p.label}: {c.p.count}
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[10.5px] text-ink-faint mt-1">
        <span>{points[0]?.label}</span>
        {flat && <span className="text-ink-faint">{max} insgesamt, unverändert</span>}
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Daily accuracy bars — discrete per-day comparison, since accuracy swings day to day in a way a
 * smooth line would misleadingly imply continuity for. Days with no sessions render as a faint
 * empty slot, distinct from a real 0%. */
export function TrendBarChart({ points, from, to }: { points: AccuracyPoint[]; from: string; to: string }) {
  const barW = CHART_W / points.length;
  return (
    <div>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-[100px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={to} />
            <stop offset="100%" stopColor={from} />
          </linearGradient>
        </defs>
        {points.map((p, i) => {
          const x = i * barW + barW * 0.15;
          const w = barW * 0.7;
          if (p.accuracy === null) {
            return <rect key={i} x={x} y={CHART_H - 6} width={w} height={6} rx={2} fill="var(--line-soft)" />;
          }
          const h = Math.max(4, (p.accuracy / 100) * (CHART_H - PAD_Y));
          return (
            <rect key={i} x={x} y={CHART_H - h} width={w} height={h} rx={2} fill="url(#bar-grad)">
              <title>
                {p.label}: {p.accuracy}% ({p.total} Fragen)
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10.5px] text-ink-faint mt-1">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
