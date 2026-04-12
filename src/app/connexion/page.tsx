"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
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

  const demoAccounts = [
    { label: "المعلّم", email: "enseignant@demo.fr", icon: "👨‍🏫", color: "violet" },
    { label: "التلميذ", email: "eleve@demo.fr", icon: "👨‍🎓", color: "teal" },
    { label: "ولي الأمر", email: "parent@demo.fr", icon: "👨‍👧", color: "rose" },
  ];

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-400/5" />
        <div className="absolute -bottom-20 left-1/4 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-400/5" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 rounded-full bg-violet-400/5 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>

      <div className="animate-scale-in relative w-full max-w-md space-y-8">
        {/* Logo area */}
        <div className="text-center">
          <div className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
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

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد@مثال.كوم"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pr-4 pl-10 text-start text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800 dark:focus:ring-indigo-500/20"
                  required
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                >
                  <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                  <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                </svg>
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pr-10 pl-10 text-start text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800 dark:focus:ring-indigo-500/20"
                  required
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                    clipRule="evenodd"
                  />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div
                className="animate-scale-in flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                role="alert"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-l from-teal-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-60 dark:from-teal-500 dark:to-indigo-500"
            >
              {loading && (
                <span className="shimmer-bg absolute inset-0" />
              )}
              <span className="relative">
                {loading ? "جاري الدخول…" : "دخول"}
              </span>
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="animate-fade-in-up stagger-2 rounded-2xl border border-zinc-200 bg-white/60 p-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            حسابات تجريبية — اضغط للملء التلقائي
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3" dir="ltr">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword("demo123");
                }}
                className="card-hover flex flex-col items-center gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3 text-center transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                <span className="text-xl">{acc.icon}</span>
                <span
                  dir="rtl"
                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  {acc.label}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {acc.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
