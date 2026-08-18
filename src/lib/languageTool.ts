"use client";

/** Thin client for the public LanguageTool API — real grammar and spelling checking,
 * no API key required for normal (non-bulk) use. https://languagetool.org/http-api/ */

export interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: string[];
  ruleCategory: string;
  issueType: string;
}

export interface LanguageToolResult {
  matches: LanguageToolMatch[];
}

interface RawMatch {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements?: { value: string }[];
  rule?: { category?: { name?: string }; issueType?: string };
}

export class LanguageToolError extends Error {}

export async function checkText(text: string): Promise<LanguageToolResult> {
  let res: Response;
  try {
    res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ text, language: "en-US" }),
    });
  } catch {
    throw new LanguageToolError("Could not reach the checker. Check your internet connection and try again.");
  }
  if (!res.ok) {
    throw new LanguageToolError(`The check failed (${res.status}). Please try again in a few seconds.`);
  }
  const data = await res.json();
  const matches: LanguageToolMatch[] = (data.matches || []).map((m: RawMatch) => ({
    message: m.message,
    shortMessage: m.shortMessage || m.message,
    offset: m.offset,
    length: m.length,
    replacements: (m.replacements || []).slice(0, 3).map((r) => r.value),
    ruleCategory: m.rule?.category?.name || "Grammar",
    issueType: m.rule?.issueType || "other",
  }));
  return { matches };
}
