"use client";

import { useEffect, useState } from "react";

type Progress = {
  id: string;
  coursDone: boolean;
  exercicesDone: boolean;
  evaluationDone: boolean;
  evaluationScore: number | null;
  updatedAt: string;
  lesson: { id: string; title: string; subject: "SCIENCE" | "MATH" };
};

type Portfolio = {
  id: string;
  title: string;
  kind: string;
  createdAt: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  lesson: { id: string; title: string };
};

type Data = {
  activity: Progress[];
  portfolio: Portfolio[];
  comments: Comment[];
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return `منذ ${Math.floor(h / 24)} ي`;
}

export function ActivityFeed() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetch("/api/parent/activity");
      if (res.ok && mounted) {
        const d = (await res.json()) as Data;
        setData(d);
      }
      if (mounted) setLoading(false);
    }
    void load();
    const id = setInterval(load, 15_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-rose-500" />
        جاري التحميل…
      </div>
    );
  }

  if (!data || (data.activity.length === 0 && data.portfolio.length === 0 && data.comments.length === 0)) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        لا يوجد نشاط بعد. تأكّد من ربط حساب الطفل.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span>📚</span> تقدّم في الدروس
        </h2>
        <ul className="mt-3 space-y-2">
          {data.activity.map((p) => (
            <li key={p.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.lesson.title}</span>
                <span className="text-[10px] text-zinc-500">{timeAgo(p.updatedAt)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                {p.coursDone && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">محتوى ✓</span>}
                {p.exercicesDone && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">تمارين ✓</span>}
                {p.evaluationDone && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">تقييم ✓</span>}
                {p.evaluationScore != null && <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-bold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">{p.evaluationScore}%</span>}
              </div>
            </li>
          ))}
          {data.activity.length === 0 && <li className="text-xs text-zinc-400">لا نشاط حديث.</li>}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span>🎨</span> أعمال حديثة
        </h2>
        <ul className="mt-3 space-y-2">
          {data.portfolio.map((p) => (
            <li key={p.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.title}</span>
                <span className="text-[10px] text-zinc-500">{timeAgo(p.createdAt)}</span>
              </div>
              <span className="mt-1 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">{p.kind}</span>
            </li>
          ))}
          {data.portfolio.length === 0 && <li className="text-xs text-zinc-400">لا توجد أعمال.</li>}
        </ul>

        <h2 className="mt-6 flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span>💬</span> تعليقات حديثة
        </h2>
        <ul className="mt-3 space-y-2">
          {data.comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-500">{c.lesson.title}</span>
                <span className="text-[10px] text-zinc-500">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{c.content}</p>
            </li>
          ))}
          {data.comments.length === 0 && <li className="text-xs text-zinc-400">لا توجد تعليقات.</li>}
        </ul>
      </section>
    </div>
  );
}
