"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

const TOOLBAR_ACTIONS = [
  { cmd: "bold", icon: "𝐁", title: "غامق" },
  { cmd: "italic", icon: "𝐼", title: "مائل" },
  { cmd: "underline", icon: "U̲", title: "تسطير" },
  { cmd: "insertUnorderedList", icon: "•", title: "قائمة نقطية" },
  { cmd: "insertOrderedList", icon: "1.", title: "قائمة مرقمة" },
] as const;

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && !node.innerHTML && value) {
        node.innerHTML = value;
      }
    },
    [value],
  );

  function execCmd(cmd: string) {
    document.execCommand(cmd, false);
  }

  return (
    <div className="mt-1.5 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex flex-wrap gap-1 border-b border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/80">
        {TOOLBAR_ACTIONS.map((a) => (
          <button
            key={a.cmd}
            type="button"
            title={a.title}
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd(a.cmd);
            }}
            className="rounded-lg px-2.5 py-1 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {a.icon}
          </button>
        ))}
        <div className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
        <button
          type="button"
          title="عنوان"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("formatBlock", false, "h3");
          }}
          className="rounded-lg px-2.5 py-1 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          H
        </button>
        <button
          type="button"
          title="فقرة"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("formatBlock", false, "p");
          }}
          className="rounded-lg px-2.5 py-1 text-sm text-zinc-600 transition hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          ¶
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        dir="rtl"
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose prose-sm prose-zinc min-h-[120px] max-w-none p-4 text-sm focus:outline-none dark:prose-invert dark:text-zinc-100"
      />
    </div>
  );
}

export function NewLessonForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<"SCIENCE" | "MATH">("SCIENCE");
  const [description, setDescription] = useState("");
  const [courseHtml, setCourseHtml] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sequenceOrder, setSequenceOrder] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false);

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
          videoUrl,
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
      setVideoUrl("");
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

            {/* Video URL */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                🎥 رابط الفيديو (يوتيوب أو رابط مباشر — اختياري)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className={inputCls}
                dir="ltr"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {videoUrl && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  ✓ سيظهر الفيديو في صفحة الدرس
                </p>
              )}
            </div>

            {/* Rich Text Editor */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  محتوى الدرس
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {previewHtml ? "محرر مرئي" : "عرض HTML"}
                </button>
              </div>
              {previewHtml ? (
                <textarea
                  value={courseHtml}
                  onChange={(e) => setCourseHtml(e.target.value)}
                  rows={6}
                  className={`${inputCls} font-mono text-xs`}
                  dir="ltr"
                />
              ) : (
                <RichTextEditor value={courseHtml} onChange={setCourseHtml} />
              )}
            </div>
          </div>
          {msg && (
            <div
              className={`animate-scale-in rounded-xl border p-3 text-sm ${
                msg.includes("خطأ")
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              }`}
            >
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
