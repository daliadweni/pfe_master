"use client";

import Link from "next/link";
import { useState } from "react";

export default function MotDePasseOubliePage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setResetLink(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = (await res.json()) as { error?: string; resetLink?: string };
      if (!res.ok) {
        setMsg(data.error ?? "خطأ");
        return;
      }
      setMsg("إذا كان الحساب موجودًا فسيصلك رابط الاستعادة.");
      if (data.resetLink) setResetLink(data.resetLink);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-xl font-black text-white shadow-lg shadow-indigo-500/25">
            ج
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            استعادة كلمة المرور
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            أدخل بريدك أو معرّفك لإنشاء رابط إعادة تعيين.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80"
        >
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              البريد الإلكتروني أو المعرّف
            </label>
            <input
              dir="ltr"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:focus:bg-zinc-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-l from-teal-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "جاري الإرسال…" : "إنشاء رابط استعادة"}
          </button>
          {msg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              {msg}
            </div>
          )}
          {resetLink && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              <p className="font-semibold">رابط التطوير (للتجربة):</p>
              <Link href={resetLink} className="mt-1 block break-all font-mono underline">
                {resetLink}
              </Link>
            </div>
          )}
        </form>

        <div className="text-center text-sm">
          <Link href="/connexion" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
