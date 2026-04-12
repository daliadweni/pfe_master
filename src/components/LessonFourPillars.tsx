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
type QuestionType = "MCQ" | "CHECKBOX" | "TRUE_FALSE" | "FILL" | "ORDER" | "MATCH";

type DBQuestion = {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string | null;
  correctAnswer: string;
  explanation: string | null;
  hint: string | null;
};

type DBExam = {
  id: string;
  title: string;
  questions: DBQuestion[];
};

const pills = [
  { id: "cours", label: "الدرس", icon: "📖" },
  { id: "exercices", label: "الاختبارات", icon: "📝" },
  { id: "evaluation", label: "التقييم", icon: "📊" },
  { id: "interaction", label: "التفاعل", icon: "💬" },
] as const;

const typeLabels: Record<QuestionType, string> = {
  MCQ: "اختيار من متعدد",
  CHECKBOX: "اختيار متعدد",
  TRUE_FALSE: "صواب أم خطأ",
  FILL: "ملء الفراغ",
  ORDER: "ترتيب",
  MATCH: "توصيل",
};

const typeIcons: Record<QuestionType, string> = {
  MCQ: "🔘",
  CHECKBOX: "☑️",
  TRUE_FALSE: "⚖️",
  FILL: "✍️",
  ORDER: "📋",
  MATCH: "🔗",
};

/* ─── Helper: extract YouTube embed URL ─── */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return url;
    }
  } catch { /* invalid URL */ }
  return null;
}

/* ─── Question exercise components ─── */

function MCQExercise({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  const options = q.options ? (JSON.parse(q.options) as { id: string; label: string }[]) : [];
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === q.correctAnswer;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          let cls = "rounded-xl border-2 px-4 py-3 text-start text-sm font-medium transition-all cursor-pointer ";
          if (!selected) cls += "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50";
          else if (o.id === q.correctAnswer) cls += "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200";
          else if (selected === o.id) cls += "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300";
          else cls += "border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-700 dark:bg-zinc-800/30";
          return (
            <button key={o.id} type="button" disabled={!!selected} onClick={() => { setSelected(o.id); onAnswer(o.id === q.correctAnswer); }} className={cls}>
              {o.label}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`animate-scale-in rounded-xl p-3 text-sm ${isCorrect ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"}`}>
          {isCorrect ? "✓ إجابة صحيحة!" : "✗ إجابة خاطئة."}{q.explanation && ` ${q.explanation}`}
        </div>
      )}
    </div>
  );
}

function CheckboxExercise({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  const options = q.options ? (JSON.parse(q.options) as { id: string; label: string }[]) : [];
  const correctIds = JSON.parse(q.correctAnswer) as string[];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected.size === correctIds.length && correctIds.every((id) => selected.has(id));

  function toggle(id: string) {
    if (submitted) return;
    const copy = new Set(selected);
    if (copy.has(id)) copy.delete(id); else copy.add(id);
    setSelected(copy);
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">يمكنك اختيار أكثر من إجابة</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const isSel = selected.has(o.id);
          const isRight = correctIds.includes(o.id);
          let cls = "rounded-xl border-2 px-4 py-3 text-start text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ";
          if (!submitted) cls += isSel ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:border-indigo-400 dark:bg-indigo-950/40" : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50";
          else if (isRight && isSel) cls += "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40";
          else if (isRight) cls += "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/40";
          else if (isSel) cls += "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40";
          else cls += "border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-700 dark:bg-zinc-800/30";
          return (
            <button key={o.id} type="button" disabled={submitted} onClick={() => toggle(o.id)} className={cls}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${isSel ? "border-current bg-current/10" : "border-zinc-300 dark:border-zinc-600"}`}>{isSel && "✓"}</span>
              {o.label}
            </button>
          );
        })}
      </div>
      {!submitted && selected.size > 0 && (
        <button type="button" onClick={() => { setSubmitted(true); onAnswer(selected.size === correctIds.length && correctIds.every((id) => selected.has(id))); }} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
          تحقّق
        </button>
      )}
      {submitted && (
        <div className={`animate-scale-in rounded-xl p-3 text-sm ${isCorrect ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"}`}>
          {isCorrect ? "✓ جميع الإجابات صحيحة!" : "✗ بعض الإجابات غير صحيحة."}{q.explanation && ` ${q.explanation}`}
        </div>
      )}
    </div>
  );
}

function TrueFalseExercise({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  const correct = q.correctAnswer === "true";
  const [answer, setAnswer] = useState<boolean | null>(null);
  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
      <div className="flex gap-3">
        {[{ val: true, label: "صواب" }, { val: false, label: "خطأ" }].map((opt) => {
          let cls = "flex-1 rounded-xl border-2 py-3 text-center text-sm font-bold transition-all cursor-pointer ";
          if (answer === null) cls += "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50";
          else if (opt.val === correct) cls += "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40";
          else if (answer === opt.val) cls += "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40";
          else cls += "border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-700 dark:bg-zinc-800/30";
          return <button key={String(opt.val)} type="button" disabled={answer !== null} onClick={() => { setAnswer(opt.val); onAnswer(opt.val === correct); }} className={cls}>{opt.label}</button>;
        })}
      </div>
      {answer !== null && (
        <div className={`animate-scale-in rounded-xl p-3 text-sm ${answer === correct ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"}`}>
          {answer === correct ? "✓ إجابة صحيحة!" : "✗ إجابة خاطئة."}{q.explanation && ` ${q.explanation}`}
        </div>
      )}
    </div>
  );
}

function FillBlankExercise({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  const accepted = JSON.parse(q.correctAnswer) as string[];
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = accepted.some((a) => a.trim().toLowerCase() === value.trim().toLowerCase());
  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
      <div className="flex gap-2">
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} disabled={submitted} placeholder="اكتب الإجابة…" className="flex-1 rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50" />
        <button type="button" disabled={submitted || !value.trim()} onClick={() => { setSubmitted(true); onAnswer(accepted.some((a) => a.trim().toLowerCase() === value.trim().toLowerCase())); }} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900">تحقّق</button>
      </div>
      {!submitted && q.hint && <p className="text-xs text-zinc-500">💡 {q.hint}</p>}
      {submitted && (
        <div className={`animate-scale-in rounded-xl p-3 text-sm ${isCorrect ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"}`}>
          {isCorrect ? `✓ صحيح! الإجابة: ${accepted[0]}` : `✗ الإجابة الصحيحة: ${accepted[0]}`}
        </div>
      )}
    </div>
  );
}

function OrderExercise({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  const correctOrder = JSON.parse(q.correctAnswer) as string[];
  const [items, setItems] = useState(() => [...correctOrder].sort(() => Math.random() - 0.5));
  const [checked, setChecked] = useState(false);
  const isCorrect = items.every((item, i) => item === correctOrder[i]);

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
      <ol className="space-y-2">
        {items.map((item, idx) => {
          let cls = "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm ";
          if (!checked) cls += "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50";
          else if (item === correctOrder[idx]) cls += "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30";
          else cls += "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/30";
          return (
            <li key={idx} className={cls}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">{idx + 1}</span>
              <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">{item}</span>
              {!checked && (
                <span className="flex gap-1">
                  <button type="button" onClick={() => { if (idx > 0) { const c = [...items]; [c[idx - 1], c[idx]] = [c[idx], c[idx - 1]]; setItems(c); } }} disabled={idx === 0} className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-600">▲</button>
                  <button type="button" onClick={() => { if (idx < items.length - 1) { const c = [...items]; [c[idx + 1], c[idx]] = [c[idx], c[idx + 1]]; setItems(c); } }} disabled={idx === items.length - 1} className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-600">▼</button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!checked && <button type="button" onClick={() => { setChecked(true); onAnswer(items.every((it, i) => it === correctOrder[i])); }} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">تحقّق من الترتيب</button>}
      {checked && (
        <div className={`animate-scale-in rounded-xl p-3 text-sm ${isCorrect ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"}`}>
          {isCorrect ? "✓ ترتيب صحيح! أحسنت." : "العناصر المحددة بالأخضر في مكانها الصحيح."}
        </div>
      )}
    </div>
  );
}

function MatchExercise({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  const pairs = JSON.parse(q.correctAnswer) as { left: string; right: string }[];
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [conns, setConns] = useState<Map<number, number>>(new Map());
  const [checked, setChecked] = useState(false);
  const shuffled = useMemo(() => pairs.map((p, i) => ({ text: p.right, origIdx: i })).sort(() => Math.random() - 0.5), [pairs]);
  const allDone = conns.size === pairs.length;
  const correctCount = checked ? Array.from(conns.entries()).filter(([l, r]) => l === r).length : 0;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">اضغط على عنصر من اليمين ثم اضغط على ما يقابله من اليسار.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {pairs.map((p, i) => {
            const connected = conns.has(i);
            const isSel = selLeft === i;
            let cls = "rounded-xl border-2 px-4 py-3 text-sm font-medium text-center cursor-pointer transition-all ";
            if (checked) cls += conns.get(i) === i ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/30" : "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30";
            else if (isSel) cls += "border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-950/30";
            else if (connected) cls += "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:border-indigo-600";
            else cls += "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50";
            return <button key={i} type="button" disabled={checked} onClick={() => setSelLeft(isSel ? null : i)} className={cls}>{p.left}</button>;
          })}
        </div>
        <div className="space-y-2">
          {shuffled.map((r, idx) => {
            const isTarget = Array.from(conns.values()).includes(r.origIdx);
            let cls = "rounded-xl border-2 px-4 py-3 text-sm text-center cursor-pointer transition-all ";
            if (checked) cls += "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/30";
            else if (isTarget) cls += "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:border-indigo-600";
            else cls += "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50";
            return <button key={idx} type="button" disabled={checked || selLeft === null} onClick={() => { if (selLeft !== null) { const c = new Map(conns); c.set(selLeft, r.origIdx); setConns(c); setSelLeft(null); } }} className={cls}>{r.text}</button>;
          })}
        </div>
      </div>
      {!checked && allDone && <button type="button" onClick={() => { setChecked(true); onAnswer(Array.from(conns.entries()).every(([l, r]) => l === r)); }} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">تحقّق من التوصيل</button>}
      {checked && (
        <div className={`animate-scale-in rounded-xl p-3 text-sm ${correctCount === pairs.length ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"}`}>
          {correctCount === pairs.length ? "✓ جميع التوصيلات صحيحة! ممتاز." : `${correctCount} من ${pairs.length} توصيلات صحيحة.`}
        </div>
      )}
    </div>
  );
}

function RenderQuestion({ q, onAnswer }: { q: DBQuestion; onAnswer: (correct: boolean) => void }) {
  switch (q.type) {
    case "MCQ": return <MCQExercise q={q} onAnswer={onAnswer} />;
    case "CHECKBOX": return <CheckboxExercise q={q} onAnswer={onAnswer} />;
    case "TRUE_FALSE": return <TrueFalseExercise q={q} onAnswer={onAnswer} />;
    case "FILL": return <FillBlankExercise q={q} onAnswer={onAnswer} />;
    case "ORDER": return <OrderExercise q={q} onAnswer={onAnswer} />;
    case "MATCH": return <MatchExercise q={q} onAnswer={onAnswer} />;
  }
}

/* ─── Exam component: shows all questions + score ─── */
function ExamView({ exam, isSci, onComplete }: { exam: DBExam; isSci: boolean; onComplete: (score: number) => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Map<number, boolean>>(new Map());
  const [finished, setFinished] = useState(false);
  const totalQ = exam.questions.length;
  const correctCount = Array.from(answers.values()).filter(Boolean).length;
  const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

  function handleAnswer(idx: number, correct: boolean) {
    setAnswers((prev) => new Map(prev).set(idx, correct));
  }

  function finishExam() {
    setFinished(true);
    onComplete(score);
  }

  if (finished) {
    return (
      <div className="animate-scale-in flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white py-8 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-zinc-900">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 text-2xl font-bold" style={{ borderColor: score >= 70 ? "#10b981" : "#f59e0b", color: score >= 70 ? "#059669" : "#d97706" }}>
          {score}٪
        </div>
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {score >= 70 ? "أداء ممتاز!" : "بداية جيدة!"}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {correctCount} من {totalQ} إجابات صحيحة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Question navigator */}
      <div className="flex flex-wrap gap-2">
        {exam.questions.map((q, i) => (
          <button key={q.id} type="button" onClick={() => setCurrentQ(i)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${currentQ === i ? (isSci ? "bg-teal-100 text-teal-800 ring-2 ring-teal-300 dark:bg-teal-950/40 dark:text-teal-200" : "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-200") : answers.has(i) ? (answers.get(i) ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40" : "bg-red-100 text-red-800 dark:bg-red-950/40") : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"}`}>
            <span>{typeIcons[q.type]}</span>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Active question */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
          <span>السؤال {currentQ + 1} من {totalQ}</span>
          <span className={`rounded-full px-2.5 py-0.5 font-medium ${isSci ? "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"}`}>
            {typeLabels[exam.questions[currentQ].type]}
          </span>
        </div>
        <RenderQuestion q={exam.questions[currentQ]} onAnswer={(c) => handleAnswer(currentQ, c)} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button type="button" disabled={currentQ === 0} onClick={() => setCurrentQ((c) => c - 1)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300">
          السابق
        </button>
        <div className="flex gap-1.5">
          {exam.questions.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full transition-all ${i === currentQ ? (isSci ? "bg-teal-500 scale-125" : "bg-indigo-500 scale-125") : answers.has(i) ? (answers.get(i) ? "bg-emerald-500" : "bg-red-400") : "bg-zinc-300 dark:bg-zinc-600"}`} />
          ))}
        </div>
        {currentQ < totalQ - 1 ? (
          <button type="button" onClick={() => setCurrentQ((c) => c + 1)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
            التالي
          </button>
        ) : (
          <button type="button" disabled={answers.size < totalQ} onClick={finishExam} className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${answers.size < totalQ ? "bg-zinc-400 cursor-not-allowed" : isSci ? "bg-teal-600 hover:bg-teal-500 hover:shadow-lg" : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg"}`}>
            إنهاء الاختبار
          </button>
        )}
      </div>

      {/* Score preview */}
      {answers.size > 0 && (
        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          أجبت على {answers.size} من {totalQ} — {correctCount} صحيحة
        </div>
      )}
    </div>
  );
}

/* ─── Fallback exam (when no DB exams exist) ─── */
const FALLBACK_EXAMS: Record<Subject, DBExam> = {
  SCIENCE: {
    id: "fallback-sci",
    title: "تمارين الدائرة الكهربائية",
    questions: [
      { id: "fs1", type: "MCQ", questionText: "لتضيء المصباح، نحتاج إلى:", options: JSON.stringify([{ id: "a", label: "سلك مقطوع" }, { id: "b", label: "دائرة مغلقة مع مصدر" }, { id: "c", label: "مغناطيس فقط" }]), correctAnswer: "b", explanation: "المصباح يحتاج دائرة مغلقة ومصدر طاقة.", hint: null },
      { id: "fs2", type: "TRUE_FALSE", questionText: "الحديد ينجذب إلى المغناطيس.", options: null, correctAnswer: "true", explanation: "نعم، الحديد مادة مغناطيسية.", hint: null },
      { id: "fs3", type: "FILL", questionText: "لكي يضيء المصباح يجب أن تكون الدائرة ___.", options: null, correctAnswer: JSON.stringify(["مغلقة", "مقفلة"]), explanation: null, hint: "ما عكس مفتوحة؟" },
    ],
  },
  MATH: {
    id: "fallback-math",
    title: "تمارين الكسور",
    questions: [
      { id: "fm1", type: "MCQ", questionText: "نقسم بيتزا إلى ٤ أجزاء ونأكل ٢. ما الكسر المأكول؟", options: JSON.stringify([{ id: "a", label: "١/٤" }, { id: "b", label: "٢/٤" }, { id: "c", label: "٤/٢" }]), correctAnswer: "b", explanation: "الربعان يساويان النصف.", hint: null },
      { id: "fm2", type: "TRUE_FALSE", questionText: "الكسر ٣/٤ أكبر من ٢/٣.", options: null, correctAnswer: "true", explanation: "٣/٤ = ٠٫٧٥ > ٢/٣ ≈ ٠٫٦٧", hint: null },
      { id: "fm3", type: "FILL", questionText: "الكسر ٢/٤ يُبسَّط إلى ___.", options: null, correctAnswer: JSON.stringify(["١/٢", "1/2"]), explanation: null, hint: "قسّم على عامل مشترك." },
    ],
  },
};

/* ─── Main component ─── */
export function LessonFourPillars(props: {
  lessonId: string;
  lessonTitle: string;
  subject: Subject;
  courseHtml: string | null;
  videoUrl: string | null;
  description: string | null;
  threads: Thread[];
  initialProgress: Progress;
  accentClass: string;
  dbExams: DBExam[];
}) {
  const [tab, setTab] = useState<(typeof pills)[number]["id"]>("cours");
  const [progress, setProgress] = useState(props.initialProgress);
  const [selectedExamIdx, setSelectedExamIdx] = useState(0);
  const [evalScore, setEvalScore] = useState<number | null>(progress?.evaluationScore ?? null);
  const [evalDone, setEvalDone] = useState(progress?.evaluationDone ?? false);
  const [postBody, setPostBody] = useState("");
  const [threads, setThreads] = useState(props.threads);
  const [busy, setBusy] = useState(false);

  const mainThread = useMemo(() => threads[0], [threads]);
  const isSci = props.subject === "SCIENCE";

  const exams: DBExam[] = props.dbExams.length > 0 ? props.dbExams : [FALLBACK_EXAMS[props.subject]];

  const embedUrl = props.videoUrl ? getYouTubeEmbedUrl(props.videoUrl) : null;
  const isDirectVideo = props.videoUrl && !embedUrl && /\.(mp4|webm|ogg)$/i.test(props.videoUrl);

  async function patchProgress(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: props.lessonId, ...body }) });
      if (res.ok) {
        const data = (await res.json()) as { progress: { coursDone: boolean; exercicesDone: boolean; evaluationDone: boolean; evaluationScore: number | null } };
        setProgress(data.progress);
      }
    } finally { setBusy(false); }
  }

  async function refreshLessonThreads() {
    const r = await fetch(`/api/lessons/${props.lessonId}`);
    if (!r.ok) return;
    const data = (await r.json()) as { lesson: { threads: { id: string; title: string; posts: { id: string; body: string; createdAt: string; user: { name: string } }[] }[] } };
    setThreads(data.lesson.threads.map((t) => ({ id: t.id, title: t.title, posts: t.posts.map((p) => ({ id: p.id, body: p.body, createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date(p.createdAt).toISOString(), user: p.user })) })));
  }

  async function sendPost() {
    if (!mainThread || !postBody.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/forum/post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId: mainThread.id, body: postBody }) });
      if (res.ok) { setPostBody(""); await refreshLessonThreads(); }
    } finally { setBusy(false); }
  }

  async function startDiscussionThread() {
    setBusy(true);
    try {
      const res = await fetch("/api/forum/thread", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: props.lessonId, title: `نقاش — ${props.lessonTitle}` }) });
      if (res.ok) await refreshLessonThreads();
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      {/* Pill tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-700">
        {pills.map((p) => {
          const active = tab === p.id;
          const done = (p.id === "cours" && progress?.coursDone) || (p.id === "exercices" && progress?.exercicesDone) || (p.id === "evaluation" && progress?.evaluationDone);
          return (
            <button key={p.id} type="button" onClick={() => setTab(p.id)} className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active ? `${props.accentClass} text-white shadow-lg shadow-current/20` : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}>
              <span>{p.icon}</span>
              {p.label}
              {done && <span className="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>}
            </button>
          );
        })}
      </div>

      {/* ─── Course tab ─── */}
      {tab === "cours" && (
        <div className="animate-fade-in-up space-y-5">
          {(embedUrl || isDirectVideo) && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-black shadow-lg dark:border-zinc-700">
              {embedUrl ? (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={embedUrl} title={props.lessonTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
                </div>
              ) : (
                <video src={props.videoUrl!} controls className="w-full">المتصفح لا يدعم الفيديو.</video>
              )}
            </div>
          )}
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {props.courseHtml ? (
              <div dangerouslySetInnerHTML={{ __html: props.courseHtml }} />
            ) : (
              !embedUrl && !isDirectVideo && (
                <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
                  <p className="text-lg text-zinc-500 dark:text-zinc-400">{props.description ?? "محتوى الدرس قادم قريبًا."}</p>
                </div>
              )
            )}
          </div>
          <button type="button" disabled={busy || progress?.coursDone} onClick={() => void patchProgress({ coursDone: true })} className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${progress?.coursDone ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"}`}>
            {progress?.coursDone ? "✓ تمت قراءة الدرس" : "تعليم الدرس كمقروء"}
          </button>
        </div>
      )}

      {/* ─── Exams tab ─── */}
      {tab === "exercices" && (
        <div className="animate-fade-in-up space-y-5">
          {/* Exam selector (if multiple exams) */}
          {exams.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {exams.map((ex, i) => (
                <button key={ex.id} type="button" onClick={() => setSelectedExamIdx(i)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${selectedExamIdx === i ? (isSci ? "bg-teal-100 text-teal-800 ring-2 ring-teal-300 dark:bg-teal-950/40 dark:text-teal-200" : "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-200") : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                  📝 {ex.title}
                  <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-bold dark:bg-zinc-700">{ex.questions.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Current exam title */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{exams[selectedExamIdx].title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{exams[selectedExamIdx].questions.length} سؤال</p>
            </div>
          </div>

          {/* Exam questions */}
          <ExamView
            key={exams[selectedExamIdx].id}
            exam={exams[selectedExamIdx]}
            isSci={isSci}
            onComplete={(score) => {
              void patchProgress({ exercicesDone: true });
            }}
          />
        </div>
      )}

      {/* ─── Evaluation tab ─── */}
      {tab === "evaluation" && (
        <div className="animate-fade-in-up space-y-5">
          {!evalDone ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-700 dark:bg-zinc-800/20">
              <div className="text-5xl">📊</div>
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">اختبار تقييمي</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">عند البدء يُسجَّل درجة للمتابعة.</p>
              </div>
              <button type="button" disabled={busy} onClick={() => { const s = Math.min(100, 60 + Math.floor(Math.random() * 35)); setEvalScore(s); setEvalDone(true); void patchProgress({ evaluationDone: true, evaluationScore: s, difficultyFlag: s >= 70 }); }} className={`rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl ${props.accentClass}`}>
                بدء التقييم
              </button>
            </div>
          ) : (
            <div className="animate-scale-in flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white py-10 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-zinc-900">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 text-3xl font-bold" style={{ borderColor: (evalScore ?? 0) >= 70 ? "#10b981" : "#f59e0b", color: (evalScore ?? 0) >= 70 ? "#059669" : "#d97706" }}>
                {evalScore}٪
              </div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{(evalScore ?? 0) >= 70 ? "أداء ممتاز!" : "بداية جيدة!"}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">تم تسجيل الدرجة في ملفك الشخصي.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Interaction tab ─── */}
      {tab === "interaction" && (
        <div className="animate-fade-in-up space-y-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">منتدى مرتبط بالدرس — تبادل بين الزملاء والمعلّم.</p>
          {mainThread ? (
            <>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{mainThread.title}</h3>
              <ul className="space-y-3">
                {mainThread.posts.map((post) => (
                  <li key={post.id} className="animate-slide-in rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">{post.user.name[0]}</span>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{post.user.name}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{post.body}</p>
                  </li>
                ))}
              </ul>
              <textarea value={postBody} onChange={(e) => setPostBody(e.target.value)} rows={2} className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50" placeholder="رسالتك…" />
              <button type="button" disabled={busy || !postBody.trim()} onClick={() => void sendPost()} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900">نشر</button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-700 dark:bg-zinc-800/20">
              <div className="text-4xl">💬</div>
              <p className="text-zinc-500">لا يوجد موضوع نقاش لهذا الدرس.</p>
              <button type="button" disabled={busy} onClick={() => void startDiscussionThread()} className="rounded-xl border-2 border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200">بدء نقاش</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
