"use client";

import type { User } from "@supabase/supabase-js";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "./supabase";

interface AuthApi {
  ready: boolean;
  user: User | null;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Best-effort read of the session Supabase's own client already persists in localStorage
 * (key `sb-<project-ref>-auth-token`). Used only when we're offline and `getSession()` fails
 * trying to refresh an expired token over the network — a fresh cold boot with no connection
 * would otherwise dead-end on the login screen despite a perfectly usable cached session. */
function readCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { user?: User };
      if (parsed?.user) return parsed.user;
    }
  } catch {
    // Malformed or absent cache — fall through to the normal error path.
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!!supabaseConfigError);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(supabaseConfigError);

  useEffect(() => {
    if (supabaseConfigError) return;
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            const cachedUser = readCachedUser();
            if (cachedUser) {
              setUser(cachedUser);
              setReady(true);
              return;
            }
          }
          setError(err.message);
        }
        setUser(data.session?.user ?? null);
        setReady(true);
      })
      .catch((e) => {
        if (cancelled) return;
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const cachedUser = readCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
            setReady(true);
            return;
          }
        }
        setError(e instanceof Error ? e.message : "Could not connect to Supabase.");
        setReady(true);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) throw err;
    // If the project requires email confirmation, signUp succeeds but returns no session yet.
    return { needsEmailConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) throw err;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const api: AuthApi = { ready, user, error, signUp, signIn, signOut };
  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
