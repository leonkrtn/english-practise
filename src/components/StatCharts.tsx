"use client";

import { useMemo } from "react";
import type { CumulativePoint, AccuracyPoint } from "@/lib/chartData";
import { LineChart, Line } from "@/components/charts/line-chart";
import { XAxis } from "@/components/charts/x-axis";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";

const DAY_MS = 86400000;

/** Cumulative "learned over time" trend, rendered with Bklit UI's LineChart — a smooth animated
 * line with hover crosshair/tooltip, since this metric is monotonically non-decreasing by
 * construction. */
export function TrendLineChart({ points, gradFrom, gradTo }: { points: CumulativePoint[]; gradFrom: string; gradTo: string }) {
  const data = useMemo(() => points.map((p) => ({ date: new Date(p.day * DAY_MS), value: p.count, label: p.label })), [points]);
  const counts = points.map((p) => p.count);
  const flat = points.length > 0 && Math.max(...counts) === Math.min(...counts);

  return (
    <div>
      <LineChart data={data} aspectRatio="3 / 1" className="h-[100px]" margin={{ top: 10, right: 6, bottom: 6, left: 6 }}>
        <Line dataKey="value" stroke={gradTo} strokeWidth={2.5} />
        <XAxis numTicks={2} />
        <ChartTooltip
          dotColor={gradTo}
          indicatorColor={gradFrom}
          rows={(point) => [{ color: gradTo, label: "Gelernt", value: point.value as number }]}
        />
      </LineChart>
      <div className="flex justify-between text-[10.5px] text-ink-faint mt-1">
        <span>{points[0]?.label}</span>
        {flat && <span className="text-ink-faint">{counts[0] ?? 0} insgesamt, unverändert</span>}
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Daily accuracy bars, rendered with Bklit UI's BarChart — discrete per-day comparison, since
 * accuracy swings day to day in a way a smooth line would misleadingly imply continuity for. Days
 * with no sessions render at zero height, distinct from a real 0% only via the tooltip. */
export function TrendBarChart({ points, from, to }: { points: AccuracyPoint[]; from: string; to: string }) {
  const data = useMemo(
    () => points.map((p) => ({ label: p.label, accuracy: p.accuracy ?? 0, total: p.total, hasData: p.accuracy !== null })),
    [points]
  );

  return (
    <div>
      <BarChart data={data} xDataKey="label" aspectRatio="3 / 1" className="h-[100px]" margin={{ top: 10, right: 6, bottom: 6, left: 6 }}>
        <Bar dataKey="accuracy" fill={to} lineCap="round" />
        <BarXAxis maxLabels={2} />
        <ChartTooltip
          dotColor={to}
          rows={(point) =>
            point.hasData
              ? [{ color: to, label: `${point.accuracy}% Genauigkeit`, value: `${point.total} Fragen` }]
              : [{ color: from, label: "Keine Session", value: "" }]
          }
        />
      </BarChart>
      <div className="flex justify-between text-[10.5px] text-ink-faint mt-1">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
