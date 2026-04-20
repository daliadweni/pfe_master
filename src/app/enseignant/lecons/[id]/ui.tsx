"use client";

import { useRef, useState } from "react";

type ResourceKind = "PDF" | "H5P" | "VIDEO" | "AUDIO" | "IMAGE" | "YOUTUBE" | "LINK" | "DOC";

type Resource = {
  id: string;
  title: string;
  kind: ResourceKind;
  url: string;
  sizeBytes: number | null;
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

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LessonResourcesManager({
  lessonId,
  initial,
}: {
  lessonId: string;
  initial: Resource[];
}) {
  const [items, setItems] = useState<Resource[]>(initial);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<ResourceKind>("LINK");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      let res: Response;
      if (mode === "file") {
        const file = fileRef.current?.files?.[0];
        if (!file) {
          setMsg("اختر ملفًا.");
          return;
        }
        const form = new FormData();
        form.append("file", file);
        form.append("title", title || file.name);
        res = await fetch(`/api/lessons/${lessonId}/resources`, { method: "POST", body: form });
      } else {
        res = await fetch(`/api/lessons/${lessonId}/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, kind, url }),
        });
      }
      const data = (await res.json()) as { resource?: Resource; error?: string };
      if (!res.ok || !data.resource) {
        setMsg(data.error ?? "خطأ");
        return;
      }
      setItems((p) => [...p, data.resource!]);
      setTitle("");
      setUrl("");
      if (fileRef.current) fileRef.current.value = "";
      setMsg("تم الرفع.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا المورد؟")) return;
    const res = await fetch(`/api/lessons/${lessonId}/resources?resourceId=${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((r) => r.id !== id));
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800";

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void upload(e)}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100">إضافة مورد</h2>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              mode === "file"
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            ملف (PDF / H5P / فيديو)
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              mode === "link"
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            رابط خارجي
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">العنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required={mode === "link"} />
          </div>
          {mode === "file" ? (
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الملف</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.h5p,.mp4,.webm,.mp3,.wav,.png,.jpg,.jpeg,.gif,.svg,.doc,.docx,.txt"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">النوع</label>
                <select value={kind} onChange={(e) => setKind(e.target.value as ResourceKind)} className={inputCls}>
                  <option value="LINK">رابط</option>
                  <option value="YOUTUBE">يوتيوب</option>
                  <option value="PDF">PDF</option>
                  <option value="H5P">H5P</option>
                  <option value="VIDEO">فيديو</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الرابط</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} dir="ltr" required />
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-gradient-to-l from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
          >
            {busy ? "جاري…" : "إضافة المورد"}
          </button>
          {msg && <span className="text-sm text-zinc-600 dark:text-zinc-400">{msg}</span>}
        </div>
      </form>

      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">{KIND_ICON[r.kind]}</span>
            <div className="flex-1">
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{r.title}</p>
              <p className="text-xs text-zinc-500">
                {KIND_LABEL[r.kind]} {r.sizeBytes ? `· ${formatSize(r.sizeBytes)}` : ""}
              </p>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-violet-700 hover:underline dark:text-violet-300">
              فتح
            </a>
            <button onClick={() => void remove(r.id)} className="text-xs text-red-600 hover:underline">حذف</button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            لم تُضَف موارد بعد.
          </li>
        )}
      </ul>
    </div>
  );
}
