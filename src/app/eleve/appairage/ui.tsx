"use client";

import { useState } from "react";

export function PairingCodeClient({ initialCode }: { initialCode: string | null }) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/pairing/generate", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { code: string };
        setCode(data.code);
      }
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {code ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">رمز الربط الخاص بك</p>
          <div className="flex items-center justify-center gap-3">
            <code className="rounded-xl bg-gradient-to-br from-teal-50 to-indigo-50 px-6 py-4 font-mono text-3xl font-black tracking-[0.3em] text-indigo-900 dark:from-teal-950/40 dark:to-indigo-950/40 dark:text-indigo-200">
              {code}
            </code>
            <button
              onClick={() => void copy()}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {copied ? "✓ نُسخ" : "نسخ"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            أعط هذا الرمز لوليّ أمرك ليدخله في صفحة الربط. يُستهلك مرّة واحدة.
          </p>
          <button
            onClick={() => void generate()}
            disabled={busy}
            className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-60 dark:text-indigo-400"
          >
            {busy ? "جاري…" : "توليد رمز جديد"}
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ليس لديك رمز ربط حالي. أنشئ واحدًا الآن.
          </p>
          <button
            onClick={() => void generate()}
            disabled={busy}
            className="rounded-xl bg-gradient-to-l from-teal-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {busy ? "جاري…" : "توليد رمز الربط"}
          </button>
        </div>
      )}
    </div>
  );
}
