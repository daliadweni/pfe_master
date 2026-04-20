"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Linked = { id: string; name: string; email: string } | null;

export function ParentPairingClient({ linkedStudent }: { linkedStudent: Linked }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function link(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/pairing/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = (await res.json()) as { error?: string; student?: { name: string } };
      if (!res.ok) {
        setErr(data.error ?? "رمز غير صالح");
        return;
      }
      setOk(`تم الربط بنجاح مع ${data.student?.name ?? ""}`);
      setCode("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    if (!confirm("هل تريد فعلاً إلغاء الربط؟")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/pairing/link", { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (linkedStudent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">الحساب المرتبط</p>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{linkedStudent.name}</p>
            <p className="text-xs text-zinc-500" dir="ltr">{linkedStudent.email}</p>
          </div>
          <button
            onClick={() => void unlink()}
            disabled={busy}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            إلغاء الربط
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void link(e)}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">رمز الربط</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          placeholder="XXXXXXXX"
          dir="ltr"
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.3em] transition focus:border-rose-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
      {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
      {ok && <p className="text-sm text-emerald-600 dark:text-emerald-400">{ok}</p>}
      <button
        type="submit"
        disabled={busy || code.length < 4}
        className="rounded-xl bg-gradient-to-l from-rose-600 to-rose-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
      >
        {busy ? "جاري…" : "ربط"}
      </button>
    </form>
  );
}
