"use client";

import { CloudOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Small badge next to the logo whenever progress is waiting in the local offline outbox — gone
 * again once everything has been replayed to Supabase. */
export default function SyncStatus({ pendingSync }: { pendingSync: number }) {
  if (pendingSync <= 0) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="flex items-center gap-1 shrink-0 rounded-full bg-amber-light text-amber-dark px-2 py-0.5 text-[11px] font-semibold" />
        }
      >
        <CloudOff size={12} />
        {pendingSync}
      </TooltipTrigger>
      <TooltipContent>Offline — Fortschritt wird synchronisiert, sobald du wieder online bist</TooltipContent>
    </Tooltip>
  );
}
