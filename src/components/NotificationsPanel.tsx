"use client";

import { useEffect, useState } from "react";

type N = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsPanel() {
  const [list, setList] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = (await res.json()) as { notifications: N[] };
      setList(data.notifications);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    void load();
  }

  if (loading) return null;

  const unread = list.filter((n) => !n.read);
  if (list.length === 0) return null;

  return (
    <section className="animate-fade-in-up rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-900/60 dark:from-amber-950/30 dark:to-zinc-900">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <h2 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm dark:bg-amber-900/50">🔔</span>
          الإشعارات
          {unread.length > 0 && (
            <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              {unread.length}
            </span>
          )}
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 text-amber-600 transition-transform dark:text-amber-400 ${expanded ? "rotate-180" : ""}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {expanded && (
        <ul className="mt-4 space-y-2">
          {list.slice(0, 5).map((n) => (
            <li
              key={n.id}
              className={`animate-slide-in rounded-xl border p-4 text-sm ${
                n.read
                  ? "border-amber-100 bg-white/60 dark:border-amber-900/30 dark:bg-zinc-800/30"
                  : "border-amber-300 bg-white shadow-sm dark:border-amber-700 dark:bg-zinc-800"
              }`}
            >
              <p className="font-semibold text-zinc-800 dark:text-zinc-100">{n.title}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{n.body}</p>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => void markRead(n.id)}
                  className="mt-2 rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900/70"
                >
                  تعليم كمقروء
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
