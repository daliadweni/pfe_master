import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={
      "h-5 w-5 rotate-180 text-zinc-300 transition "
      + "group-hover:text-indigo-500 dark:text-zinc-600"
    }
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d={
        "M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 "
        + "3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 "
        + "0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
      }
    />
  </svg>
);

export default async function MathematiquesPage() {
  const session = await getSession();
  const lessons = await prisma.lesson.findMany({
    where: { subject: "MATH" },
    orderBy: { sequenceOrder: "asc" },
    include: {
      progress: { where: { userId: session!.sub }, take: 1 },
    },
  });

  const completedCount = lessons.filter(
    (l) =>
      l.progress[0]?.coursDone &&
      l.progress[0]?.exercicesDone &&
      l.progress[0]?.evaluationDone,
  ).length;

  const pct =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className={
        "animate-fade-in-up relative overflow-hidden rounded-2xl "
        + "bg-gradient-to-l from-indigo-600 to-indigo-700 p-7 "
        + "text-white shadow-lg shadow-indigo-700/20 "
        + "dark:from-indigo-800 dark:to-indigo-900"
      }>
        <div className={
          "pointer-events-none absolute -left-16 -top-16 "
          + "h-48 w-48 rounded-full bg-white/5 blur-3xl"
        } />
        <div className="relative flex items-center gap-3">
          <span className="text-3xl">🔢</span>
          <div>
            <h1 className="text-2xl font-bold">الرياضيات</h1>
            <p className="mt-1 max-w-xl text-sm text-indigo-100">
              حل المسائل والتلاعب الهندسي: تصوّر الكسور
              والمساحات والحجوم.
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="relative mt-5">
          <div className={
            "flex items-center justify-between "
            + "text-xs text-indigo-200"
          }>
            <span>
              {completedCount} من {lessons.length} مكتملة
            </span>
            <span>{pct}%</span>
          </div>
          <div className={
            "mt-1.5 h-2.5 overflow-hidden "
            + "rounded-full bg-indigo-900/40"
          }>
            <div
              className={
                "animate-progress-fill h-full "
                + "rounded-full bg-white/80"
              }
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <ul className="space-y-3">
        {lessons.map((l, idx) => {
          const p = l.progress[0];
          const doneArr = [
            p?.coursDone,
            p?.exercicesDone,
            p?.evaluationDone,
          ];
          const doneCount = doneArr.filter(Boolean).length;
          const isComplete = doneCount === 3;
          const labels = ["الدرس", "التمارين", "التقييم"];
          const stagger = Math.min(idx + 1, 4);
          return (
            <li
              key={l.id}
              className={`animate-fade-in-up stagger-${stagger}`}
            >
              <Link
                href={`/eleve/lecon/${l.id}`}
                className={
                  "card-hover group flex items-center gap-4 "
                  + "rounded-2xl border bg-white p-5 shadow-sm "
                  + "transition-all dark:bg-zinc-900 "
                  + (isComplete
                    ? "border-emerald-200 "
                      + "dark:border-emerald-900/60"
                    : "border-zinc-200 hover:border-indigo-300 "
                      + "dark:border-zinc-800 "
                      + "dark:hover:border-indigo-700")
                }
              >
                <div
                  className={
                    "flex h-11 w-11 shrink-0 items-center "
                    + "justify-center rounded-xl text-sm "
                    + "font-bold transition "
                    + (isComplete
                      ? "bg-emerald-100 text-emerald-700 "
                        + "dark:bg-emerald-900/50 "
                        + "dark:text-emerald-300"
                      : "bg-indigo-50 text-indigo-700 "
                        + "group-hover:bg-indigo-100 "
                        + "dark:bg-indigo-950/40 "
                        + "dark:text-indigo-300")
                  }
                >
                  {isComplete ? "✓" : l.sequenceOrder}
                </div>
                <div className="flex-1">
                  <p className={
                    "font-semibold text-zinc-800 "
                    + "dark:text-zinc-100"
                  }>
                    {l.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {l.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {labels.map((label, i) => {
                      const done = doneArr[i];
                      return (
                        <div
                          key={label}
                          className={
                            "flex flex-col items-center gap-1"
                          }
                        >
                          <span
                            className={
                              "h-2.5 w-2.5 rounded-full "
                              + "transition-all "
                              + (done
                                ? "bg-indigo-500 shadow-sm "
                                  + "shadow-indigo-500/30"
                                : "bg-zinc-200 dark:bg-zinc-700")
                            }
                          />
                          <span className={
                            "hidden text-[9px] "
                            + "text-zinc-400 sm:block"
                          }>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <ChevronIcon />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {lessons.length === 0 && (
        <div className={
          "flex flex-col items-center gap-3 rounded-2xl "
          + "border-2 border-dashed border-zinc-200 py-12 "
          + "dark:border-zinc-700"
        }>
          <span className="text-4xl">📚</span>
          <p className="text-zinc-500">لا توجد دروس حاليًا.</p>
        </div>
      )}
    </div>
  );
}
