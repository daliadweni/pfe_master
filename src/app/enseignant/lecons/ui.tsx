"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewLessonForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<"SCIENCE" | "MATH">("SCIENCE");
  const [description, setDescription] = useState("");
  const [courseHtml, setCourseHtml] = useState("");
  const [sequenceOrder, setSequenceOrder] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          description,
          courseHtml,
          sequenceOrder,
        }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setMsg(d.error ?? "خطأ");
        return;
      }
      setTitle("");
      setDescription("");
      setCourseHtml("");
      setMsg("تم إنشاء الدرس.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-violet-500 dark:focus:bg-zinc-800 dark:focus:ring-violet-500/20";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 p-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-sm dark:bg-violet-900/50">✏️</span>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">درس جديد</h2>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {expanded && (
        <form
          onSubmit={(e) => void submit(e)}
          className="animate-fade-in-up space-y-4 border-t border-zinc-100 p-5 dark:border-zinc-800"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                العنوان
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                المادة
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as "SCIENCE" | "MATH")}
                className={inputCls}
              >
                <option value="SCIENCE">الإيقاظ العلمي</option>
                <option value="MATH">الرياضيات</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ترتيب الحصة
              </label>
              <input
                type="number"
                value={sequenceOrder}
                onChange={(e) => setSequenceOrder(Number(e.target.value))}
                className={inputCls}
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                محتوى الدرس (HTML بسيط)
              </label>
              <textarea
                value={courseHtml}
                onChange={(e) => setCourseHtml(e.target.value)}
                rows={4}
                className={`${inputCls} font-mono`}
                placeholder="<p>نص، قوائم…</p>"
                dir="ltr"
              />
            </div>
          </div>
          {msg && (
            <div className="animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              {msg}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-l from-violet-600 to-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-60"
          >
            {loading ? "جاري النشر…" : "نشر الدرس"}
          </button>
        </form>
      )}
    </div>
  );
}
