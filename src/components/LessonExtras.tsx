"use client";

import { useEffect, useState } from "react";

type ResourceKind = "PDF" | "H5P" | "VIDEO" | "AUDIO" | "IMAGE" | "YOUTUBE" | "LINK" | "DOC";

type Resource = {
  id: string;
  title: string;
  kind: ResourceKind;
  url: string;
  sizeBytes: number | null;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; role: "TEACHER" | "STUDENT" | "PARENT" };
};

const KIND_ICON: Record<ResourceKind, string> = {
  PDF: "📄",
  H5P: "🎮",
  VIDEO: "🎞️",
  AUDIO: "🎧",
  IMAGE: "🖼️",
  YOUTUBE: "▶️",
  LINK: "🔗",
  DOC: "📝",
};

const KIND_LABEL: Record<ResourceKind, string> = {
  PDF: "PDF",
  H5P: "H5P",
  VIDEO: "فيديو",
  AUDIO: "صوت",
  IMAGE: "صورة",
  YOUTUBE: "يوتيوب",
  LINK: "رابط",
  DOC: "مستند",
};

const ROLE_LABEL: Record<Comment["user"]["role"], string> = {
  TEACHER: "المعلّم",
  STUDENT: "التلميذ",
  PARENT: "وليّ الأمر",
};

const ROLE_COLOR: Record<Comment["user"]["role"], string> = {
  TEACHER: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  STUDENT: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  PARENT: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

function Stars({ value, onClick, readOnly }: { value: number; onClick?: (v: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onClick?.(n)}
          className={`text-2xl transition ${n <= value ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"} ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function LessonExtras({
  lessonId,
  me,
}: {
  lessonId: string;
  me: { id: string; role: "TEACHER" | "STUDENT" | "PARENT" };
}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [rating, setRating] = useState({ avg: 0, count: 0, mine: 0 });
  const [newComment, setNewComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [r, c, rt] = await Promise.all([
        fetch(`/api/lessons/${lessonId}/resources`).then((x) => x.json() as Promise<{ resources: Resource[] }>),
        fetch(`/api/lessons/${lessonId}/comments`).then((x) => x.json() as Promise<{ comments: Comment[] }>),
        fetch(`/api/lessons/${lessonId}/rating`).then((x) => x.json() as Promise<{ avg: number; count: number; mine: number }>),
      ]);
      if (!mounted) return;
      setResources(r.resources ?? []);
      setComments(c.comments ?? []);
      setRating({ avg: rt.avg ?? 0, count: rt.count ?? 0, mine: rt.mine ?? 0 });
      setLoaded(true);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [lessonId]);

  async function rate(value: number) {
    const res = await fetch(`/api/lessons/${lessonId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const data = (await res.json()) as { avg: number; count: number; mine: number };
      setRating({ avg: data.avg, count: data.count, mine: data.mine });
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { comment: Comment };
        setComments((p) => [...p, data.comment]);
        setNewComment("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(id: string) {
    if (!confirm("حذف هذا التعليق؟")) return;
    const res = await fetch(`/api/lessons/${lessonId}/comments?commentId=${id}`, { method: "DELETE" });
    if (res.ok) setComments((p) => p.filter((c) => c.id !== id));
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
        جاري التحميل…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resources */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span>📚</span> موارد الدرس
        </h2>
        <ul className="mt-3 space-y-2">
          {resources.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="text-xl">{KIND_ICON[r.kind]}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{r.title}</p>
                <p className="text-[10px] text-zinc-500">{KIND_LABEL[r.kind]}</p>
              </div>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700"
              >
                فتح
              </a>
            </li>
          ))}
          {resources.length === 0 && (
            <li className="text-xs text-zinc-400">لم يُضف المعلّم موارد بعد.</li>
          )}
        </ul>
      </section>

      {/* Rating */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span>⭐</span> تقييم الدرس
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">متوسط التقييم</p>
            <div className="flex items-center gap-2">
              <Stars value={Math.round(rating.avg)} readOnly />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {rating.avg.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-500">({rating.count})</span>
            </div>
          </div>
          {me.role === "STUDENT" && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">تقييمي</p>
              <Stars value={rating.mine} onClick={(v) => void rate(v)} />
            </div>
          )}
        </div>
      </section>

      {/* Triangular comments */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span>💬</span> وساطة ثلاثيّة — تعليقات
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          يتحاور فيها المعلّم والتلميذ ووليّ الأمر حول هذه الوحدة.
        </p>

        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_COLOR[c.user.role]}`}
                  >
                    {ROLE_LABEL[c.user.role]}
                  </span>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {c.user.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400" dir="ltr">
                    {new Date(c.createdAt).toLocaleString("ar-TN", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  {c.user.id === me.id && (
                    <button onClick={() => void removeComment(c.id)} className="text-[10px] text-red-600 hover:underline">
                      حذف
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{c.content}</p>
            </li>
          ))}
          {comments.length === 0 && (
            <li className="text-xs text-zinc-400">لا تعليقات بعد. كن أوّل من يفتح النقاش.</li>
          )}
        </ul>

        <form onSubmit={(e) => void postComment(e)} className="mt-4 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            placeholder="أضف تعليقًا…"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={busy || !newComment.trim()}
            className="rounded-xl bg-gradient-to-l from-indigo-600 to-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-lg disabled:opacity-60"
          >
            {busy ? "جاري…" : "نشر"}
          </button>
        </form>
      </section>
    </div>
  );
}
