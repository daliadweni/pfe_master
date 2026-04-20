"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type PageProps = { params: Promise<{ token: string }> };

export default function ReinitialiserPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMsg("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "خطأ");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          إعادة تعيين كلمة المرور
        </h1>
        {done ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            تم — جاري التحويل إلى تسجيل الدخول…
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">كلمة المرور الجديدة</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">تأكيد كلمة المرور</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-l from-teal-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60">
              {loading ? "جاري الحفظ…" : "حفظ كلمة المرور"}
            </button>
            {msg && <p className="text-sm text-red-600">{msg}</p>}
          </form>
        )}
        <div className="text-center text-sm">
          <Link href="/connexion" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
