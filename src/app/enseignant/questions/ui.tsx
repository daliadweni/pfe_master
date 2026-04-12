"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type QuestionType = "MCQ" | "CHECKBOX" | "TRUE_FALSE" | "FILL" | "ORDER" | "MATCH";
type Subject = "SCIENCE" | "MATH";

type LessonRef = { id: string; title: string; subject: Subject };

type QuestionRow = {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string | null;
  correctAnswer: string;
  explanation: string | null;
  hint: string | null;
  displayOrder: number;
  createdAt: string;
};

type ExamRow = {
  id: string;
  title: string;
  subject: Subject;
  lessonId: string | null;
  lesson: { id: string; title: string } | null;
  questions: QuestionRow[];
  _count: { questions: number };
  createdAt: string;
};

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "اختيار من متعدد",
  CHECKBOX: "اختيار متعدد (خانات)",
  TRUE_FALSE: "صواب أم خطأ",
  FILL: "ملء الفراغ",
  ORDER: "ترتيب",
  MATCH: "توصيل",
};

const TYPE_ICONS: Record<QuestionType, string> = {
  MCQ: "🔘",
  CHECKBOX: "☑️",
  TRUE_FALSE: "⚖️",
  FILL: "✍️",
  ORDER: "📋",
  MATCH: "🔗",
};

const ALL_TYPES: QuestionType[] = ["MCQ", "CHECKBOX", "TRUE_FALSE", "FILL", "ORDER", "MATCH"];

const inputCls =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-amber-500 dark:focus:bg-zinc-800 dark:focus:ring-amber-500/20";

type EditableQuestion = {
  key: string;
  type: QuestionType;
  questionText: string;
  options: { id: string; label: string }[];
  correctId: string;
  correctIds: string[];
  tfAnswer: boolean;
  acceptedAnswers: string[];
  orderItems: string[];
  matchPairs: { left: string; right: string }[];
  explanation: string;
  hint: string;
};

function emptyQuestion(): EditableQuestion {
  return {
    key: crypto.randomUUID(),
    type: "MCQ",
    questionText: "",
    options: [
      { id: "a", label: "" },
      { id: "b", label: "" },
    ],
    correctId: "a",
    correctIds: [],
    tfAnswer: true,
    acceptedAnswers: [""],
    orderItems: [""],
    matchPairs: [{ left: "", right: "" }],
    explanation: "",
    hint: "",
  };
}

function questionToPayload(q: EditableQuestion) {
  let options: string | null = null;
  let correctAnswer = "";

  switch (q.type) {
    case "MCQ":
      options = JSON.stringify(q.options.filter((o) => o.label.trim()));
      correctAnswer = q.correctId;
      break;
    case "CHECKBOX":
      options = JSON.stringify(q.options.filter((o) => o.label.trim()));
      correctAnswer = JSON.stringify(q.correctIds);
      break;
    case "TRUE_FALSE":
      correctAnswer = String(q.tfAnswer);
      break;
    case "FILL":
      correctAnswer = JSON.stringify(q.acceptedAnswers.filter((a) => a.trim()));
      break;
    case "ORDER":
      correctAnswer = JSON.stringify(q.orderItems.filter((i) => i.trim()));
      break;
    case "MATCH":
      correctAnswer = JSON.stringify(q.matchPairs.filter((p) => p.left.trim() && p.right.trim()));
      break;
  }

  return {
    type: q.type,
    questionText: q.questionText,
    options,
    correctAnswer,
    explanation: q.explanation || null,
    hint: q.hint || null,
  };
}

function dbToEditable(q: QuestionRow): EditableQuestion {
  const base = emptyQuestion();
  base.type = q.type;
  base.questionText = q.questionText;
  base.explanation = q.explanation || "";
  base.hint = q.hint || "";

  if (q.type === "MCQ" || q.type === "CHECKBOX") {
    base.options = q.options ? (JSON.parse(q.options) as { id: string; label: string }[]) : base.options;
    if (q.type === "MCQ") base.correctId = q.correctAnswer;
    else base.correctIds = JSON.parse(q.correctAnswer) as string[];
  } else if (q.type === "TRUE_FALSE") {
    base.tfAnswer = q.correctAnswer === "true";
  } else if (q.type === "FILL") {
    base.acceptedAnswers = JSON.parse(q.correctAnswer) as string[];
  } else if (q.type === "ORDER") {
    base.orderItems = JSON.parse(q.correctAnswer) as string[];
  } else if (q.type === "MATCH") {
    base.matchPairs = JSON.parse(q.correctAnswer) as { left: string; right: string }[];
  }

  return base;
}

/* ─── Single question editor ─── */
function QuestionEditor({
  q,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  q: EditableQuestion;
  index: number;
  onChange: (updated: EditableQuestion) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  function update(partial: Partial<EditableQuestion>) {
    onChange({ ...q, ...partial });
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/20">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            {index + 1}
          </span>
          السؤال {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={q.type}
            onChange={(e) => update({ type: e.target.value as QuestionType })}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
          >
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_ICONS[t]} {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
            >
              حذف
            </button>
          )}
        </div>
      </div>

      <textarea
        value={q.questionText}
        onChange={(e) => update({ questionText: e.target.value })}
        rows={2}
        placeholder="نص السؤال"
        className={inputCls}
      />

      {/* MCQ / CHECKBOX options */}
      {(q.type === "MCQ" || q.type === "CHECKBOX") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">الخيارات</span>
            <button
              type="button"
              onClick={() => {
                const id = String.fromCharCode(97 + q.options.length);
                update({ options: [...q.options, { id, label: "" }] });
              }}
              className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
            >
              + خيار
            </button>
          </div>
          {q.options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              {q.type === "MCQ" ? (
                <input
                  type="radio"
                  name={`correct-${q.key}`}
                  checked={q.correctId === opt.id}
                  onChange={() => update({ correctId: opt.id })}
                  className="h-3.5 w-3.5 accent-amber-500"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={q.correctIds.includes(opt.id)}
                  onChange={(e) => {
                    const ids = e.target.checked
                      ? [...q.correctIds, opt.id]
                      : q.correctIds.filter((id) => id !== opt.id);
                    update({ correctIds: ids });
                  }}
                  className="h-3.5 w-3.5 accent-amber-500"
                />
              )}
              <input
                type="text"
                value={opt.label}
                onChange={(e) => {
                  const copy = [...q.options];
                  copy[i] = { ...copy[i], label: e.target.value };
                  update({ options: copy });
                }}
                placeholder={`الخيار ${i + 1}`}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
              />
              {q.options.length > 2 && (
                <button type="button" onClick={() => update({ options: q.options.filter((_, j) => j !== i) })} className="text-xs text-red-500">✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TRUE_FALSE */}
      {q.type === "TRUE_FALSE" && (
        <div className="flex gap-3">
          {[
            { val: true, label: "صواب" },
            { val: false, label: "خطأ" },
          ].map((opt) => (
            <label key={String(opt.val)} className="flex items-center gap-1.5 text-xs">
              <input type="radio" name={`tf-${q.key}`} checked={q.tfAnswer === opt.val} onChange={() => update({ tfAnswer: opt.val })} className="accent-amber-500" />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {/* FILL */}
      {q.type === "FILL" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">الإجابات المقبولة</span>
            <button type="button" onClick={() => update({ acceptedAnswers: [...q.acceptedAnswers, ""] })} className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">+ إجابة</button>
          </div>
          {q.acceptedAnswers.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={a} onChange={(e) => { const c = [...q.acceptedAnswers]; c[i] = e.target.value; update({ acceptedAnswers: c }); }} placeholder={`إجابة ${i + 1}`} className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
              {q.acceptedAnswers.length > 1 && <button type="button" onClick={() => update({ acceptedAnswers: q.acceptedAnswers.filter((_, j) => j !== i) })} className="text-xs text-red-500">✕</button>}
            </div>
          ))}
        </div>
      )}

      {/* ORDER */}
      {q.type === "ORDER" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">العناصر (بالترتيب الصحيح)</span>
            <button type="button" onClick={() => update({ orderItems: [...q.orderItems, ""] })} className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">+ عنصر</button>
          </div>
          {q.orderItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500">{i + 1}.</span>
              <input type="text" value={item} onChange={(e) => { const c = [...q.orderItems]; c[i] = e.target.value; update({ orderItems: c }); }} placeholder={`العنصر ${i + 1}`} className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
              {q.orderItems.length > 1 && <button type="button" onClick={() => update({ orderItems: q.orderItems.filter((_, j) => j !== i) })} className="text-xs text-red-500">✕</button>}
            </div>
          ))}
        </div>
      )}

      {/* MATCH */}
      {q.type === "MATCH" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">أزواج التوصيل</span>
            <button type="button" onClick={() => update({ matchPairs: [...q.matchPairs, { left: "", right: "" }] })} className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">+ زوج</button>
          </div>
          {q.matchPairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={pair.left} onChange={(e) => { const c = [...q.matchPairs]; c[i] = { ...c[i], left: e.target.value }; update({ matchPairs: c }); }} placeholder="العنصر" className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
              <span className="text-zinc-400 text-xs">↔</span>
              <input type="text" value={pair.right} onChange={(e) => { const c = [...q.matchPairs]; c[i] = { ...c[i], right: e.target.value }; update({ matchPairs: c }); }} placeholder="المقابل" className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
              {q.matchPairs.length > 1 && <button type="button" onClick={() => update({ matchPairs: q.matchPairs.filter((_, j) => j !== i) })} className="text-xs text-red-500">✕</button>}
            </div>
          ))}
        </div>
      )}

      {/* Explanation & Hint */}
      <div className="grid gap-3 sm:grid-cols-2">
        <input type="text" value={q.explanation} onChange={(e) => update({ explanation: e.target.value })} placeholder="الشرح (اختياري)" className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
        <input type="text" value={q.hint} onChange={(e) => update({ hint: e.target.value })} placeholder="تلميح (اختياري)" className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function ExamBankUI({
  initialExams,
  lessons,
}: {
  initialExams: ExamRow[];
  lessons: LessonRef[];
}) {
  const router = useRouter();
  const [exams, setExams] = useState(initialExams);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<Subject | "ALL">("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("SCIENCE");
  const [lessonId, setLessonId] = useState("");
  const [questions, setQuestions] = useState<EditableQuestion[]>([emptyQuestion()]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setTitle("");
    setSubject("SCIENCE");
    setLessonId("");
    setQuestions([emptyQuestion()]);
    setEditId(null);
    setMsg(null);
  }

  function loadForEdit(exam: ExamRow) {
    setEditId(exam.id);
    setTitle(exam.title);
    setSubject(exam.subject);
    setLessonId(exam.lessonId || "");
    setQuestions(exam.questions.map(dbToEditable));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const payload = {
        title,
        subject,
        lessonId: lessonId || null,
        questions: questions.map((q, i) => ({ ...questionToPayload(q), displayOrder: i + 1 })),
      };
      const url = editId ? `/api/exams/${editId}` : "/api/exams";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setMsg(d.error ?? "خطأ");
        return;
      }
      setMsg(editId ? "تم تحديث الاختبار." : "تم إنشاء الاختبار.");
      resetForm();
      setShowForm(false);
      router.refresh();
      const listRes = await fetch("/api/exams");
      if (listRes.ok) {
        const data = (await listRes.json()) as { exams: ExamRow[] };
        setExams(data.exams);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/exams/${id}`, { method: "DELETE" });
      setExams((prev) => prev.filter((ex) => ex.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const filtered = exams.filter((ex) => {
    if (filterSubject !== "ALL" && ex.subject !== filterSubject) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30"
        >
          {showForm ? "إغلاق" : "➕ اختبار جديد"}
        </button>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value as Subject | "ALL")}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="ALL">كل المواد</option>
          <option value="SCIENCE">الإيقاظ العلمي</option>
          <option value="MATH">الرياضيات</option>
        </select>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} اختبار</span>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="animate-fade-in-up space-y-5 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {editId ? "تعديل الاختبار" : "اختبار جديد"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">عنوان الاختبار</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">المادة</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className={inputCls}>
                <option value="SCIENCE">الإيقاظ العلمي</option>
                <option value="MATH">الرياضيات</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">ربط بدرس (اختياري)</label>
              <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={inputCls}>
                <option value="">بدون ربط</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.subject === "SCIENCE" ? "علوم" : "رياضيات"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                الأسئلة ({questions.length})
              </h3>
              <button
                type="button"
                onClick={() => setQuestions([...questions, emptyQuestion()])}
                className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200"
              >
                + إضافة سؤال
              </button>
            </div>

            {questions.map((q, i) => (
              <QuestionEditor
                key={q.key}
                q={q}
                index={i}
                onChange={(updated) => {
                  const copy = [...questions];
                  copy[i] = updated;
                  setQuestions(copy);
                }}
                onRemove={() => setQuestions(questions.filter((_, j) => j !== i))}
                canRemove={questions.length > 1}
              />
            ))}
          </div>

          {msg && (
            <div className={`animate-scale-in rounded-xl border p-3 text-sm ${msg.includes("خطأ") ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"}`}>
              {msg}
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl disabled:opacity-60">
              {loading ? "جاري الحفظ…" : editId ? "حفظ التعديلات" : "إنشاء الاختبار"}
            </button>
            {editId && (
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                إلغاء
              </button>
            )}
          </div>
        </form>
      )}

      {/* Exams List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 py-12 dark:border-zinc-700">
            <span className="text-4xl">📝</span>
            <p className="text-zinc-500 dark:text-zinc-400">لا توجد اختبارات بعد.</p>
          </div>
        )}
        {filtered.map((exam, idx) => {
          const isExpanded = expandedExam === exam.id;
          return (
            <div
              key={exam.id}
              className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)} rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900`}
            >
              {/* Exam header */}
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl dark:bg-amber-950/40">
                  📝
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{exam.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${exam.subject === "SCIENCE" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"}`}>
                      {exam.subject === "SCIENCE" ? "علوم" : "رياضيات"}
                    </span>
                    {exam.lesson && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        📖 {exam.lesson.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {exam._count.questions} سؤال — {exam.questions.map((q) => TYPE_ICONS[q.type]).join(" ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {isExpanded ? "إخفاء" : "عرض الأسئلة"}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadForEdit(exam)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    disabled={deleting === exam.id}
                    onClick={() => void handleDelete(exam.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
                  >
                    {deleting === exam.id ? "…" : "حذف"}
                  </button>
                </div>
              </div>

              {/* Expanded questions */}
              {isExpanded && (
                <div className="animate-fade-in-up border-t border-zinc-100 p-5 dark:border-zinc-800">
                  <ul className="space-y-3">
                    {exam.questions.map((q, qi) => (
                      <li key={q.id} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          {qi + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{TYPE_ICONS[q.type]}</span>
                            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                              {TYPE_LABELS[q.type]}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
