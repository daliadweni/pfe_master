"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) {
        setError(data.error ?? "خطأ في الاتصال");
        return;
      }
      if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-400/5" />
        <div className="absolute -bottom-20 left-1/4 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-400/5" />
      </div>

      {/* Theme toggle */}
      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>

      <div className="animate-scale-in relative w-full max-w-md space-y-8">
        {/* Logo area */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
            ج
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            جلولي
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            منصة تعلّم تفاعلية للعلوم والرياضيات
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            تسجيل الدخول
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            ادخل إلى بوابة المعلّم أو التلميذ أو ولي الأمر.
          </p>

          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-start text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800 dark:focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-start text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800 dark:focus:ring-indigo-500/20"
                required
              />
            </div>
            {error && (
              <div className="animate-scale-in rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300" role="alert">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-l from-teal-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-60 dark:from-teal-500 dark:to-indigo-500"
            >
              {loading ? "جاري الدخول…" : "دخول"}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="animate-fade-in-up stagger-2 rounded-2xl border border-zinc-200 bg-white/60 p-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            حسابات تجريبية
          </p>
          <div className="mt-3 space-y-2" dir="ltr">
            {[
              { label: "المعلّم", email: "enseignant@demo.fr", color: "violet" },
              { label: "التلميذ", email: "eleve@demo.fr", color: "teal" },
              { label: "ولي الأمر", email: "parent@demo.fr", color: "rose" },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword("demo123");
                }}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-start text-xs transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {acc.email}
                </span>
                <span
                  dir="rtl"
                  className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  {acc.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
