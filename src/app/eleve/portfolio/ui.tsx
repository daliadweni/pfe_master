"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  kind: string;
  description: string | null;
  createdAt: string;
};

const kindLabel: Record<string, string> = {
  SCHEMA: "مخطط",
  AUDIO: "صوت",
  AUTRE: "أخرى",
};

const kindIcon: Record<string, string> = {
  SCHEMA: "📐",
  AUDIO: "🎙️",
  AUTRE: "📎",
};

export function PortfolioClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("SCHEMA");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/portfolio");
    if (res.ok) {
      const data = (await res.json()) as { items: Item[] };
      setItems(data.items);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, kind, description }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setShowForm(false);
      void load();
    }
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20";

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-teal-500" />
        جاري التحميل…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add button / form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-teal-700 dark:hover:text-teal-300"
        >
          <span className="text-lg">+</span> إضافة عمل جديد
        </button>
      ) : (
        <form
          onSubmit={(e) => void add(e)}
          className="animate-scale-in rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">إضافة عمل</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">العنوان</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">النوع</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
                <option value="SCHEMA">مخطط</option>
                <option value="AUDIO">تسجيل صوتي</option>
                <option value="AUTRE">أخرى</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:shadow-xl"
            >
              إضافة إلى المعرض
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it, idx) => (
          <article
            key={it.id}
            className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)} group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{kindIcon[it.kind] ?? "📎"}</span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {kindLabel[it.kind] ?? it.kind}
              </span>
            </div>
            <h3 className="mt-3 font-bold text-zinc-800 dark:text-zinc-100">
              {it.title}
            </h3>
            {it.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {it.description}
              </p>
            )}
          </article>
        ))}
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 py-10 dark:border-zinc-700">
            <span className="text-3xl">🎨</span>
            <p className="text-sm text-zinc-500">لا توجد أعمال بعد. ابدأ بإضافة عملك الأول!</p>
          </div>
        )}
      </div>
    </div>
  );
}
