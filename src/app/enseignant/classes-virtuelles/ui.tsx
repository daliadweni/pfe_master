"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LiveClass = {
  id: string;
  title: string;
  summary: string | null;
  subject: "SCIENCE" | "MATH";
  startAt: string;
  durationMinutes: number;
  meetUrl: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ar-TN", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export function LiveClassesManager({ initial }: { initial: LiveClass[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [subject, setSubject] = useState<"SCIENCE" | "MATH">("SCIENCE");
  const [startAt, setStartAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetUrl, setMeetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          subject,
          startAt: new Date(startAt).toISOString(),
          durationMinutes,
          meetUrl: meetUrl.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { liveClass?: LiveClass; error?: string };
      if (!res.ok || !data.liveClass) {
        setMsg(data.error ?? "خطأ");
        return;
      }
      setItems((p) => [data.liveClass!, ...p]);
      setTitle("");
      setSummary("");
      setStartAt("");
      setMeetUrl("");
      setMsg("تم إنشاء الحصة.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("حذف هذه الحصة؟")) return;
    const res = await fetch(`/api/live-classes?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((x) => x.id !== id));
  }

  const input =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800";

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void create(e)}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
          برمجة حصة جديدة
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">العنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">المادة</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value as "SCIENCE" | "MATH")} className={input}>
              <option value="SCIENCE">الإيقاظ العلمي</option>
              <option value="MATH">الرياضيات</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">المدة (دقائق)</label>
            <input type="number" value={durationMinutes} min={15} max={180} onChange={(e) => setDurationMinutes(Number(e.target.value))} className={input} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الموعد</label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required className={input} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">ملخص</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              رابط Jitsi/Meet (اختياري — إن تُرك فارغًا أُنشئ رابط Jitsi جديد)
            </label>
            <input value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)} className={input} dir="ltr" placeholder="https://meet.jit.si/..." />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-l from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60">
            {loading ? "جاري…" : "برمجة"}
          </button>
          {msg && <span className="text-sm text-emerald-600 dark:text-emerald-400">{msg}</span>}
        </div>
      </form>

      <ul className="space-y-3">
        {items.map((c) => {
          const past = new Date(c.startAt).getTime() + c.durationMinutes * 60_000 < Date.now();
          return (
            <li key={c.id} className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900 ${past ? "border-zinc-200 dark:border-zinc-800 opacity-60" : "border-violet-200 dark:border-violet-900"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.subject === "SCIENCE" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"}`}>
                      {c.subject === "SCIENCE" ? "إيقاظ علمي" : "رياضيات"}
                    </span>
                    <span className="text-xs text-zinc-500">{c.durationMinutes} د</span>
                    {past && <span className="text-xs font-semibold text-zinc-400">(منقضية)</span>}
                  </div>
                  <h3 className="mt-2 font-bold text-zinc-900 dark:text-zinc-100">{c.title}</h3>
                  {c.summary && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{c.summary}</p>}
                  <p className="mt-2 text-xs text-zinc-500">{formatDate(c.startAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <a href={c.meetUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700">
                    فتح الحصة
                  </a>
                  <button onClick={() => void remove(c.id)} className="text-xs text-red-600 hover:underline">حذف</button>
                </div>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-zinc-200 p-8 text-center text-zinc-500 dark:border-zinc-700">
            لا توجد حصص مُبرمجة.
          </li>
        )}
      </ul>
    </div>
  );
}
