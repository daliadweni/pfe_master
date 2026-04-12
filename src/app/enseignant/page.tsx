import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function EnseignantAccueil() {
  const session = await getSession();

  const [lessonCount, studentCount, examCount, recentProgress] =
    await Promise.all([
      prisma.lesson.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.exam.count(),
      prisma.progress.findMany({
        orderBy: { id: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          lesson: { select: { title: true } },
        },
      }),
    ]);

  const progressStats = await prisma.progress.findMany({
    where: { evaluationScore: { not: null } },
  });
  const avgScore =
    progressStats.length > 0
      ? Math.round(
          progressStats.reduce(
            (sum, p) => sum + (p.evaluationScore ?? 0),
            0,
          ) / progressStats.length,
        )
      : null;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          مرحبًا، {session?.name}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          لوحة التحكم
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          إدارة المحتوى والتمارين ومتابعة التلاميذ. كل وحدة مبنية على أربعة
          محاور: الدرس، التمارين، التقييم، التفاعل.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up stagger-1 card-hover rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm dark:border-violet-900/60 dark:from-violet-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-900/50">
              📚
            </span>
            <div>
              <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                الدروس
              </p>
              <p className="text-2xl font-bold text-violet-950 dark:text-violet-50">
                {lessonCount}
              </p>
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up stagger-2 card-hover rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm dark:border-teal-900/60 dark:from-teal-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-lg dark:bg-teal-900/50">
              👨‍🎓
            </span>
            <div>
              <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                التلاميذ
              </p>
              <p className="text-2xl font-bold text-teal-950 dark:text-teal-50">
                {studentCount}
              </p>
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up stagger-3 card-hover rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-900/60 dark:from-amber-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-900/50">
              🧩
            </span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                الاختبارات
              </p>
              <p className="text-2xl font-bold text-amber-950 dark:text-amber-50">
                {examCount}
              </p>
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up stagger-4 card-hover rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900/50">
              📊
            </span>
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                متوسط الدرجات
              </p>
              <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Link
          href="/enseignant/lecons"
          className="animate-fade-in-up stagger-1 group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-violet-100/50 blur-2xl transition-all group-hover:bg-violet-200/50 dark:bg-violet-900/20" />
          <div className="relative">
            <span className="text-2xl">📚</span>
            <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">
              إدارة المحتوى
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              رفع وتنظيم التسلسلات التعليمية.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
              فتح
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 rotate-180 transition group-hover:-translate-x-1"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </Link>
        <Link
          href="/enseignant/questions"
          className="animate-fade-in-up stagger-2 group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-amber-100/50 blur-2xl transition-all group-hover:bg-amber-200/50 dark:bg-amber-900/20" />
          <div className="relative">
            <span className="text-2xl">🧩</span>
            <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">
              بنك الاختبارات
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              إنشاء اختبارات متنوعة (اختيار من متعدد، صواب/خطأ، ملء فراغ،
              ترتيب، توصيل).
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
              فتح
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 rotate-180 transition group-hover:-translate-x-1"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </Link>
        <Link
          href="/enseignant/suivi"
          className="animate-fade-in-up stagger-3 group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl transition-all group-hover:bg-emerald-200/50 dark:bg-emerald-900/20" />
          <div className="relative">
            <span className="text-2xl">📊</span>
            <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">
              إحصائيات التقدم
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              تحليل تقدم كل تلميذ بالتفصيل.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              فتح
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 rotate-180 transition group-hover:-translate-x-1"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      {recentProgress.length > 0 && (
        <section className="animate-fade-in-up stagger-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            آخر النشاطات
          </h2>
          <ul className="mt-4 space-y-3">
            {recentProgress.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  {p.user.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {p.user.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {p.lesson.title}
                    {p.evaluationScore != null && (
                      <span
                        className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.evaluationScore >= 70
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        }`}
                      >
                        {p.evaluationScore}%
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[p.coursDone, p.exercicesDone, p.evaluationDone].map(
                    (done, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          done
                            ? "bg-violet-500"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ),
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
