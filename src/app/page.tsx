"use client";

import { AuthProvider, useAuth } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";
import { GrammarStoreProvider, useGrammarStore } from "@/lib/grammarStore";
import AppShell from "@/components/AppShell";
import AuthScreen from "@/components/screens/AuthScreen";

function StoreBoot() {
  const store = useStore();
  const grammarStore = useGrammarStore();

  const error = store.error || grammarStore.error;
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3 bg-bg px-6 text-center">
        <div className="text-ink font-semibold">Could not connect to Supabase</div>
        <div className="text-ink-faint text-sm max-w-sm">{error}</div>
      </div>
    );
  }

  if (!store.ready || !grammarStore.ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3 bg-bg">
        <div className="w-7 h-7 rounded-full border-[3px] border-line border-t-blue animate-spin-slow" />
        <div className="text-sm text-ink-faint">Loading your progress…</div>
      </div>
    );
  }

  return <AppShell />;
}

function AuthGate() {
  const auth = useAuth();

  if (auth.error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3 bg-bg px-6 text-center">
        <div className="text-ink font-semibold">Could not connect to Supabase</div>
        <div className="text-ink-faint text-sm max-w-sm">{auth.error}</div>
      </div>
    );
  }

  if (!auth.ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3 bg-bg">
        <div className="w-7 h-7 rounded-full border-[3px] border-line border-t-blue animate-spin-slow" />
      </div>
    );
  }

  if (!auth.user) {
    return <AuthScreen />;
  }

  return (
    <StoreProvider userId={auth.user.id}>
      <GrammarStoreProvider userId={auth.user.id}>
        <StoreBoot />
      </GrammarStoreProvider>
    </StoreProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
