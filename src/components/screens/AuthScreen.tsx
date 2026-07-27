"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GradientButton from "@/components/kokonutui/gradient-button";

type Mode = "signin" | "signup";

function friendlyError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "E-Mail oder Passwort ist falsch.";
  if (/user already registered/i.test(message)) return "Für diese E-Mail existiert bereits ein Account.";
  if (/password.*at least/i.test(message)) return "Das Passwort ist zu kurz (mindestens 6 Zeichen).";
  if (/email/i.test(message) && /invalid/i.test(message)) return "Bitte gib eine gültige E-Mail-Adresse ein.";
  return message;
}

export default function AuthScreen() {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setConfirmNotice(false);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { needsEmailConfirmation } = await signUp(email, password);
        if (needsEmailConfirmation) {
          setConfirmNotice(true);
        }
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setError(friendlyError(e instanceof Error ? e.message : "Etwas ist schiefgelaufen."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-[9px] h-[9px] rounded-full bg-blue" />
          <span className="font-semibold text-[16px] tracking-tight">Vocab Trainer</span>
        </div>

        <div className="bg-card border border-line-soft rounded-2xl p-6 shadow-sm">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as Mode);
              setError(null);
              setConfirmNotice(false);
            }}
            className="mb-6"
          >
            <TabsList className="w-full h-auto rounded-full bg-bg p-1">
              <TabsTrigger value="signin" className="flex-1 rounded-full py-2 h-auto text-[14px] font-semibold data-active:bg-white data-active:shadow-sm data-active:text-ink text-ink-faint">
                Anmelden
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 rounded-full py-2 h-auto text-[14px] font-semibold data-active:bg-white data-active:shadow-sm data-active:text-ink text-ink-faint">
                Account erstellen
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <h1 className="text-[19px] font-semibold tracking-tight mb-1">
            {mode === "signin" ? "Willkommen zurück" : "Account erstellen"}
          </h1>
          <p className="text-[13.5px] text-ink-faint mb-5 leading-relaxed">
            {mode === "signin"
              ? "Melde dich an, um an deinem Fortschritt weiterzumachen."
              : "Dein Fortschritt wird ab jetzt sicher auf deinem Account gespeichert."}
          </p>

          {confirmNotice ? (
            <div className="bg-blue-light text-blue-dark text-[13.5px] rounded-xl px-4 py-3.5 leading-relaxed">
              Fast geschafft — wir haben dir eine Bestätigungs-E-Mail geschickt. Bestätige deine
              E-Mail-Adresse und melde dich danach an.
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div>
                <Label className="text-[11.5px] uppercase tracking-wide font-bold text-ink-faint mb-1.5 block">
                  E-Mail
                </Label>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@beispiel.de"
                  className="w-full h-auto text-[15px] px-3.5 py-2.5 rounded-xl border-[1.5px] border-line bg-bg focus-visible:bg-white focus-visible:border-blue focus-visible:ring-0"
                />
              </div>
              <div>
                <Label className="text-[11.5px] uppercase tracking-wide font-bold text-ink-faint mb-1.5 block">
                  Passwort
                </Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-auto text-[15px] px-3.5 py-2.5 rounded-xl border-[1.5px] border-line bg-bg focus-visible:bg-white focus-visible:border-blue focus-visible:ring-0"
                />
              </div>

              {error && <div className="text-[13px] text-[#b8271b] bg-red-light rounded-lg px-3 py-2">{error}</div>}

              <GradientButton
                type="submit"
                disabled={busy}
                variant="blue"
                label={busy ? "Einen Moment…" : mode === "signin" ? "Anmelden" : "Account erstellen"}
                className="mt-1 w-full active:scale-[0.97]"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
