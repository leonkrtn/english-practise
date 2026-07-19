"use client";

import { StoreProvider, useStore } from "@/lib/store";
import AppShell from "@/components/AppShell";

function Boot() {
  const store = useStore();

  if (store.error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3 bg-bg px-6 text-center">
        <div className="text-ink font-semibold">Could not connect to Supabase</div>
        <div className="text-ink-faint text-sm max-w-sm">{store.error}</div>
      </div>
    );
  }

  if (!store.ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3 bg-bg">
        <div className="w-7 h-7 rounded-full border-[3px] border-line border-t-blue animate-spin-slow" />
        <div className="text-sm text-ink-faint">Loading your progress…</div>
      </div>
    );
  }

  return <AppShell />;
}

export default function Home() {
  return (
    <StoreProvider>
      <Boot />
    </StoreProvider>
  );
}
