import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function EveilScientifiquePage() {
  const session = await getSession();
  const lessons = await prisma.lesson.findMany({
    where: { subject: "SCIENCE" },
    orderBy: { sequenceOrder: "asc" },
    include: {
      progress: { where: { userId: session!.sub }, take: 1 },
    },
  });

  const completedCount = lessons.filter(
    (l) => l.progress[0]?.coursDone && l.progress[0]?.exercicesDone && l.progress[0]?.evaluationDone,
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="animate-fade-in-up overflow-hidden rounded-2xl bg-gradient-to-l from-teal-600 to-teal-700 p-7 text-white shadow-lg shadow-teal-700/20 dark:from-teal-800 dark:to-teal-900">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔬</span>
          <div>
            <h1 className="text-2xl font-bold">الإيقاظ العلمي</h1>
            <p className="mt-1 max-w-xl text-sm text-teal-100">
              فضاء للاستكشاف: جرّب المفاهيم في المختبر الافتراضي، ثم ثبّت تعلّمك.
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-teal-200">
            <span>{completedCount} من {lessons.length} مكتملة</span>
            <span>{lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-teal-900/40">
            <div
              className="h-full rounded-full bg-white/80 transition-all"
              style={{ width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <ul className="space-y-3">
        {lessons.map((l, idx) => {
          const p = l.progress[0];
          const doneCount = [p?.coursDone, p?.exercicesDone, p?.evaluationDone].filter(Boolean).length;
          return (
            <li key={l.id} className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)}`}>
              <Link
                href={`/eleve/lecon/${l.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-700"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700 transition group-hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300">
                  {l.sequenceOrder}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">{l.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{l.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {doneCount > 0 && (
                    <div className="flex gap-1">
                      {[p?.coursDone, p?.exercicesDone, p?.evaluationDone].map((done, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            done
                              ? "bg-teal-500"
                              : "bg-zinc-200 dark:bg-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 rotate-180 text-zinc-300 transition group-hover:text-teal-500 dark:text-zinc-600">
                    <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
