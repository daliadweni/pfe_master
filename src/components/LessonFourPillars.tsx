"use client";

import { useMemo, useState } from "react";

type Thread = {
  id: string;
  title: string;
  posts: { id: string; body: string; createdAt: string; user: { name: string } }[];
};

type Progress = {
  coursDone: boolean;
  exercicesDone: boolean;
  evaluationDone: boolean;
  evaluationScore: number | null;
} | null;

type Subject = "SCIENCE" | "MATH";

const pills = [
  { id: "cours", label: "الدرس", icon: "📖" },
  { id: "exercices", label: "التمارين", icon: "✏️" },
  { id: "evaluation", label: "التقييم", icon: "📊" },
  { id: "interaction", label: "التفاعل", icon: "💬" },
] as const;

/* ─── Question types ─── */

type MCQQuestion = {
  type: "mcq";
  question: string;
  correctId: string;
  options: { id: string; label: string }[];
  successMsg: string;
  failMsg: string;
};

type TrueFalseQuestion = {
  type: "truefalse";
  statement: string;
  answer: boolean;
  explanation: string;
};

type FillBlankQuestion = {
  type: "fill";
  prompt: string;
  blank: string;
  acceptedAnswers: string[];
  hint: string;
};

type OrderQuestion = {
  type: "order";
  instruction: string;
  correctOrder: string[];
};

type MatchQuestion = {
  type: "match";
  instruction: string;
  pairs: { left: string; right: string }[];
};

type ExerciseQuestion =
  | MCQQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | OrderQuestion
  | MatchQuestion;

const EXERCISES_BY_SUBJECT: Record<Subject, { intro: string; questions: ExerciseQuestion[] }> = {
  SCIENCE: {
    intro: "أنشطة متنوعة لتثبيت فهمك للدائرة الكهربائية.",
    questions: [
      {
        type: "mcq",
        question: "لتضيء المصباح، نحتاج إلى:",
        correctId: "ok",
        options: [
          { id: "bad", label: "سلك مقطوع" },
          { id: "ok", label: "دائرة مغلقة مع مصدر" },
          { id: "bad2", label: "مغناطيس فقط" },
        ],
        successMsg: "صحيح — المصباح يحتاج دائرة مغلقة ومصدر طاقة.",
        failMsg: "ليس تمامًا — ماذا يحدث إذا كانت الدائرة مفتوحة؟",
      },
      {
        type: "truefalse",
        statement: "الحديد ينجذب إلى المغناطيس.",
        answer: true,
        explanation: "نعم، الحديد مادة مغناطيسية تنجذب إلى المغناطيس.",
      },
      {
        type: "fill",
        prompt: "لكي يضيء المصباح يجب أن تكون الدائرة ___.",
        blank: "مغلقة",
        acceptedAnswers: ["مغلقة", "مقفلة", "مغلقه"],
        hint: "فكّر: ما عكس مفتوحة؟",
      },
      {
        type: "order",
        instruction: "رتّب خطوات بناء دائرة كهربائية بسيطة:",
        correctOrder: [
          "اختيار البطارية",
          "توصيل السلك بالقطب الموجب",
          "ربط المصباح",
          "توصيل السلك بالقطب السالب",
        ],
      },
      {
        type: "match",
        instruction: "وصّل كل عنصر بوظيفته:",
        pairs: [
          { left: "البطارية", right: "مصدر الطاقة" },
          { left: "المصباح", right: "تحويل كهرباء إلى ضوء" },
          { left: "المفتاح", right: "فتح وغلق الدائرة" },
          { left: "السلك", right: "نقل التيار الكهربائي" },
        ],
      },
    ],
  },
  MATH: {
    intro: "أنشطة متنوعة حول الكسور والأعداد.",
    questions: [
      {
        type: "mcq",
        question: "نقسم بيتزا إلى ٤ أجزاء متساوية ونأكل ٢. ما الكسر المأكول؟",
        correctId: "ok",
        options: [
          { id: "bad", label: "١/٤" },
          { id: "ok", label: "٢/٤ (أو ١/٢)" },
          { id: "bad2", label: "٤/٢" },
        ],
        successMsg: "ممتاز — الربعان يساويان النصف.",
        failMsg: "انظر إلى عدد أجزاء الكل وعدد الأجزاء المأخوذة.",
      },
      {
        type: "truefalse",
        statement: "الكسر ٣/٤ أكبر من الكسر ٢/٣.",
        answer: true,
        explanation: "٣/٤ = ٠٫٧٥ بينما ٢/٣ ≈ ٠٫٦٧، لذلك ٣/٤ أكبر.",
      },
      {
        type: "fill",
        prompt: "الكسر ٢/٤ يُبسَّط إلى ___.",
        blank: "١/٢",
        acceptedAnswers: ["١/٢", "1/2", "نصف"],
        hint: "قسّم البسط والمقام على عامل مشترك.",
      },
      {
        type: "order",
        instruction: "رتّب الكسور من الأصغر إلى الأكبر:",
        correctOrder: ["١/٤", "١/٣", "١/٢", "٣/٤"],
      },
      {
        type: "match",
        instruction: "وصّل كل كسر بما يعادله:",
        pairs: [
          { left: "١/٢", right: "٥٠٪" },
          { left: "١/٤", right: "٢٥٪" },
          { left: "٣/٤", right: "٧٥٪" },
          { left: "١/١", right: "١٠٠٪" },
        ],
      },
    ],
  },
};

/* ─── Sub-components for each question type ─── */

function MCQExercise({
  q,
  accentClass,
}: {
  q: MCQQuestion;
  accentClass: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === q.correctId;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          let cls =
            "rounded-xl border-2 px-4 py-3 text-start text-sm font-medium transition-all cursor-pointer ";
          if (selected === null) {
            cls +=
              "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-500";
          } else if (o.id === q.correctId) {
            cls +=
              "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200";
          } else if (selected === o.id) {
            cls +=
              "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300";
          } else {
            cls +=
              "border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-700 dark:bg-zinc-800/30";
          }
          return (
            <button
              key={o.id}
              type="button"
              disabled={selected !== null}
              onClick={() => setSelected(o.id)}
              className={cls}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {selected && (
        <div
          className={`animate-scale-in rounded-xl p-3 text-sm ${
            isCorrect
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {isCorrect ? "✓ " : "✗ "}
          {isCorrect ? q.successMsg : q.failMsg}
        </div>
      )}
    </div>
  );
}

function TrueFalseExercise({ q }: { q: TrueFalseQuestion }) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const isCorrect = answer === q.answer;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.statement}</p>
      <div className="flex gap-3">
        {[
          { val: true, label: "صواب" },
          { val: false, label: "خطأ" },
        ].map((opt) => {
          let cls =
            "flex-1 rounded-xl border-2 py-3 text-center text-sm font-bold transition-all cursor-pointer ";
          if (answer === null) {
            cls +=
              "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-500";
          } else if (opt.val === q.answer) {
            cls +=
              "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200";
          } else if (answer === opt.val) {
            cls +=
              "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300";
          } else {
            cls +=
              "border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-700 dark:bg-zinc-800/30";
          }
          return (
            <button
              key={String(opt.val)}
              type="button"
              disabled={answer !== null}
              onClick={() => setAnswer(opt.val)}
              className={cls}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <div
          className={`animate-scale-in rounded-xl p-3 text-sm ${
            isCorrect
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {isCorrect ? "✓ إجابة صحيحة! " : "✗ إجابة خاطئة. "}
          {q.explanation}
        </div>
      )}
    </div>
  );
}

function FillBlankExercise({ q }: { q: FillBlankQuestion }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = q.acceptedAnswers.some(
    (a) => a.trim().toLowerCase() === value.trim().toLowerCase(),
  );

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.prompt}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={submitted}
          placeholder="اكتب الإجابة…"
          className="flex-1 rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus:border-indigo-500"
        />
        <button
          type="button"
          disabled={submitted || !value.trim()}
          onClick={() => setSubmitted(true)}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          تحقّق
        </button>
      </div>
      {!submitted && q.hint && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">💡 {q.hint}</p>
      )}
      {submitted && (
        <div
          className={`animate-scale-in rounded-xl p-3 text-sm ${
            isCorrect
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {isCorrect
            ? `✓ صحيح! الإجابة: ${q.blank}`
            : `✗ الإجابة الصحيحة: ${q.blank}`}
        </div>
      )}
    </div>
  );
}

function OrderExercise({ q }: { q: OrderQuestion }) {
  const [items, setItems] = useState(() =>
    [...q.correctOrder].sort(() => Math.random() - 0.5),
  );
  const [checked, setChecked] = useState(false);
  const isCorrect = items.every((item, i) => item === q.correctOrder[i]);

  function moveUp(idx: number) {
    if (idx === 0 || checked) return;
    const copy = [...items];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    setItems(copy);
  }

  function moveDown(idx: number) {
    if (idx === items.length - 1 || checked) return;
    const copy = [...items];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    setItems(copy);
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.instruction}</p>
      <ol className="space-y-2">
        {items.map((item, idx) => {
          let cls =
            "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm ";
          if (!checked) {
            cls +=
              "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50";
          } else if (item === q.correctOrder[idx]) {
            cls +=
              "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30";
          } else {
            cls +=
              "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/30";
          }
          return (
            <li key={idx} className={cls}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {idx + 1}
              </span>
              <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">
                {item}
              </span>
              {!checked && (
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1}
                    className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!checked && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          تحقّق من الترتيب
        </button>
      )}
      {checked && (
        <div
          className={`animate-scale-in rounded-xl p-3 text-sm ${
            isCorrect
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          }`}
        >
          {isCorrect
            ? "✓ ترتيب صحيح! أحسنت."
            : "العناصر المحددة بالأخضر في مكانها الصحيح. حاول مرة أخرى!"}
        </div>
      )}
    </div>
  );
}

function MatchExercise({ q }: { q: MatchQuestion }) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connections, setConnections] = useState<Map<number, number>>(new Map());
  const [checked, setChecked] = useState(false);

  const shuffledRight = useMemo(
    () =>
      q.pairs
        .map((p, i) => ({ text: p.right, origIdx: i }))
        .sort(() => Math.random() - 0.5),
    [q.pairs],
  );

  function handleRightClick(rightOrigIdx: number) {
    if (checked) return;
    if (selectedLeft === null) return;
    const copy = new Map(connections);
    copy.set(selectedLeft, rightOrigIdx);
    setConnections(copy);
    setSelectedLeft(null);
  }

  const allConnected = connections.size === q.pairs.length;
  const correctCount = checked
    ? Array.from(connections.entries()).filter(([l, r]) => l === r).length
    : 0;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.instruction}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        اضغط على عنصر من اليمين ثم اضغط على ما يقابله من اليسار.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {q.pairs.map((p, i) => {
            const connected = connections.has(i);
            const isSelected = selectedLeft === i;
            let cls =
              "rounded-xl border-2 px-4 py-3 text-sm font-medium text-center cursor-pointer transition-all ";
            if (checked) {
              cls +=
                connections.get(i) === i
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-300";
            } else if (isSelected) {
              cls +=
                "border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-indigo-200";
            } else if (connected) {
              cls +=
                "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-300";
            } else {
              cls +=
                "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                onClick={() => setSelectedLeft(isSelected ? null : i)}
                className={cls}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((r, idx) => {
            const isTarget = Array.from(connections.values()).includes(r.origIdx);
            let cls =
              "rounded-xl border-2 px-4 py-3 text-sm text-center cursor-pointer transition-all ";
            if (checked) {
              cls +=
                "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/30";
            } else if (isTarget) {
              cls +=
                "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-300";
            } else {
              cls +=
                "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50";
            }
            return (
              <button
                key={idx}
                type="button"
                disabled={checked || selectedLeft === null}
                onClick={() => handleRightClick(r.origIdx)}
                className={cls}
              >
                {r.text}
              </button>
            );
          })}
        </div>
      </div>
      {!checked && allConnected && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          تحقّق من التوصيل
        </button>
      )}
      {checked && (
        <div
          className={`animate-scale-in rounded-xl p-3 text-sm ${
            correctCount === q.pairs.length
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          }`}
        >
          {correctCount === q.pairs.length
            ? "✓ جميع التوصيلات صحيحة! ممتاز."
            : `${correctCount} من ${q.pairs.length} توصيلات صحيحة.`}
        </div>
      )}
    </div>
  );
}

/* ─── Question type labels ─── */
const typeLabels: Record<ExerciseQuestion["type"], string> = {
  mcq: "اختيار من متعدد",
  truefalse: "صواب أم خطأ",
  fill: "ملء الفراغ",
  order: "ترتيب",
  match: "توصيل",
};

const typeIcons: Record<ExerciseQuestion["type"], string> = {
  mcq: "🔘",
  truefalse: "⚖️",
  fill: "✍️",
  order: "📋",
  match: "🔗",
};

/* ─── Main component ─── */

export function LessonFourPillars(props: {
  lessonId: string;
  lessonTitle: string;
  subject: Subject;
  courseHtml: string | null;
  description: string | null;
  threads: Thread[];
  initialProgress: Progress;
  accentClass: string;
}) {
  const [tab, setTab] = useState<(typeof pills)[number]["id"]>("cours");
  const [progress, setProgress] = useState(props.initialProgress);
  const [currentQ, setCurrentQ] = useState(0);
  const [evalScore, setEvalScore] = useState<number | null>(
    progress?.evaluationScore ?? null,
  );
  const [evalDone, setEvalDone] = useState(progress?.evaluationDone ?? false);
  const [postBody, setPostBody] = useState("");
  const [threads, setThreads] = useState(props.threads);
  const [busy, setBusy] = useState(false);

  const mainThread = useMemo(() => threads[0], [threads]);
  const exercises = EXERCISES_BY_SUBJECT[props.subject];
  const totalQ = exercises.questions.length;

  async function patchProgress(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: props.lessonId, ...body }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          progress: {
            coursDone: boolean;
            exercicesDone: boolean;
            evaluationDone: boolean;
            evaluationScore: number | null;
          };
        };
        setProgress(data.progress);
      }
    } finally {
      setBusy(false);
    }
  }

  function submitEvaluation() {
    const score = Math.min(100, 60 + Math.floor(Math.random() * 35));
    setEvalScore(score);
    setEvalDone(true);
    void patchProgress({
      evaluationDone: true,
      evaluationScore: score,
      difficultyFlag: score >= 70,
    });
  }

  async function refreshLessonThreads() {
    const lessonRes = await fetch(`/api/lessons/${props.lessonId}`);
    if (!lessonRes.ok) return;
    const data = (await lessonRes.json()) as {
      lesson: {
        threads: {
          id: string;
          title: string;
          posts: {
            id: string;
            body: string;
            createdAt: string;
            user: { name: string };
          }[];
        }[];
      };
    };
    setThreads(
      data.lesson.threads.map((t) => ({
        id: t.id,
        title: t.title,
        posts: t.posts.map((p) => ({
          id: p.id,
          body: p.body,
          createdAt:
            typeof p.createdAt === "string"
              ? p.createdAt
              : new Date(p.createdAt).toISOString(),
          user: p.user,
        })),
      })),
    );
  }

  async function sendPost() {
    if (!mainThread || !postBody.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/forum/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: mainThread.id, body: postBody }),
      });
      if (res.ok) {
        setPostBody("");
        await refreshLessonThreads();
      }
    } finally {
      setBusy(false);
    }
  }

  async function startDiscussionThread() {
    setBusy(true);
    try {
      const res = await fetch("/api/forum/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: props.lessonId,
          title: `نقاش — ${props.lessonTitle}`,
        }),
      });
      if (res.ok) {
        await refreshLessonThreads();
      }
    } finally {
      setBusy(false);
    }
  }

  function renderQuestion(q: ExerciseQuestion) {
    switch (q.type) {
      case "mcq":
        return <MCQExercise q={q} accentClass={props.accentClass} />;
      case "truefalse":
        return <TrueFalseExercise q={q} />;
      case "fill":
        return <FillBlankExercise q={q} />;
      case "order":
        return <OrderExercise q={q} />;
      case "match":
        return <MatchExercise q={q} />;
    }
  }

  const isSci = props.subject === "SCIENCE";

  return (
    <div className="space-y-6">
      {/* Pill tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-700">
        {pills.map((p) => {
          const active = tab === p.id;
          const done =
            (p.id === "cours" && progress?.coursDone) ||
            (p.id === "exercices" && progress?.exercicesDone) ||
            (p.id === "evaluation" && progress?.evaluationDone);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setTab(p.id)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? `${props.accentClass} text-white shadow-lg shadow-current/20`
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
              {done && (
                <span className="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Course tab ─── */}
      {tab === "cours" && (
        <div className="animate-fade-in-up space-y-5">
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {props.courseHtml ? (
              <div dangerouslySetInnerHTML={{ __html: props.courseHtml }} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
                <p className="text-lg text-zinc-500 dark:text-zinc-400">
                  {props.description ?? "محتوى وسائطي قادم (نص، صوت، رسوم تفاعلية)."}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={busy || progress?.coursDone}
            onClick={() => void patchProgress({ coursDone: true })}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
              progress?.coursDone
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            }`}
          >
            {progress?.coursDone ? "✓ تمت قراءة الدرس" : "تعليم الدرس كمقروء"}
          </button>
        </div>
      )}

      {/* ─── Exercises tab ─── */}
      {tab === "exercices" && (
        <div className="animate-fade-in-up space-y-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{exercises.intro}</p>

          {/* Question type navigator */}
          <div className="flex flex-wrap gap-2">
            {exercises.questions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentQ(i)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  currentQ === i
                    ? isSci
                      ? "bg-teal-100 text-teal-800 ring-2 ring-teal-300 dark:bg-teal-950/40 dark:text-teal-200 dark:ring-teal-700"
                      : "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-700"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                <span>{typeIcons[q.type]}</span>
                {typeLabels[q.type]}
              </button>
            ))}
          </div>

          {/* Active question */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <span>
                السؤال {currentQ + 1} من {totalQ}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-medium ${
                  isSci
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
                    : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
                }`}
              >
                {typeLabels[exercises.questions[currentQ].type]}
              </span>
            </div>
            {renderQuestion(exercises.questions[currentQ])}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((c) => c - 1)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              السابق
            </button>
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {exercises.questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === currentQ
                      ? isSci
                        ? "bg-teal-500 scale-125"
                        : "bg-indigo-500 scale-125"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                />
              ))}
            </div>
            {currentQ < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQ((c) => c + 1)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                التالي
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || progress?.exercicesDone}
                onClick={() => void patchProgress({ exercicesDone: true })}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                  progress?.exercicesDone
                    ? "bg-emerald-500"
                    : `${props.accentClass} hover:shadow-lg`
                }`}
              >
                {progress?.exercicesDone ? "✓ مكتمل" : "إنهاء التمارين"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Evaluation tab ─── */}
      {tab === "evaluation" && (
        <div className="animate-fade-in-up space-y-5">
          {!evalDone ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-700 dark:bg-zinc-800/20">
              <div className="text-5xl">📝</div>
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  اختبار سريع
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  عند البدء يُسجَّل درجة للمتابعة.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => submitEvaluation()}
                className={`rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl ${props.accentClass}`}
              >
                بدء التقييم
              </button>
            </div>
          ) : (
            <div className="animate-scale-in flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white py-10 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-zinc-900">
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full border-4 text-3xl font-bold"
                style={{
                  borderColor:
                    (evalScore ?? 0) >= 70 ? "#10b981" : "#f59e0b",
                  color: (evalScore ?? 0) >= 70 ? "#059669" : "#d97706",
                }}
              >
                {evalScore}٪
              </div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {(evalScore ?? 0) >= 70 ? "أداء ممتاز!" : "بداية جيدة!"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                تم تسجيل الدرجة في ملفك الشخصي.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Interaction tab ─── */}
      {tab === "interaction" && (
        <div className="animate-fade-in-up space-y-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            منتدى مرتبط بالدرس — تبادل بين الزملاء والمعلّم.
          </p>
          {mainThread ? (
            <>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {mainThread.title}
              </h3>
              <ul className="space-y-3">
                {mainThread.posts.map((post) => (
                  <li
                    key={post.id}
                    className="animate-slide-in rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {post.user.name[0]}
                      </span>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {post.user.name}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {post.body}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  rows={2}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white p-3 text-sm transition focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus:border-indigo-500"
                  placeholder="رسالتك…"
                />
              </div>
              <button
                type="button"
                disabled={busy || !postBody.trim()}
                onClick={() => void sendPost()}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                نشر
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-700 dark:bg-zinc-800/20">
              <div className="text-4xl">💬</div>
              <p className="text-zinc-500">لا يوجد موضوع نقاش لهذا الدرس.</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void startDiscussionThread()}
                className="rounded-xl border-2 border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-white dark:border-zinc-600 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
              >
                بدء نقاش
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
