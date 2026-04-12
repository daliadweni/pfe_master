"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  subject: "SCIENCE" | "MATH";
}

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = (await res.json()) as { lessons: SearchResult[] };
          setResults(data.lessons ?? []);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function goToLesson(id: string) {
    router.push(`/eleve/lecon/${id}`);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-400 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden sm:inline">بحث…</span>
        <kbd className="hidden rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 sm:inline">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm dark:bg-black/60"
        onClick={() => setOpen(false)}
      />

      {/* Search panel */}
      <div className="animate-scale-in relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-zinc-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن درس…"
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
          <kbd
            className="cursor-pointer rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-400 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500"
            onClick={() => setOpen(false)}
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-400">
              لا توجد نتائج لـ &quot;{query}&quot;
            </div>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => goToLesson(r.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm ${
                    r.subject === "SCIENCE"
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                      : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                  }`}
                >
                  {r.subject === "SCIENCE" ? "🔬" : "🔢"}
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {r.title}
                  </p>
                  {r.description && (
                    <p className="truncate text-xs text-zinc-500">
                      {r.description}
                    </p>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 rotate-180 text-zinc-300 dark:text-zinc-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ))}
          {!query && (
            <div className="py-8 text-center text-sm text-zinc-400">
              اكتب اسم الدرس للبحث
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
