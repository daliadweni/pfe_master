import Link from "next/link";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const kindLabel: Record<string, string> = {
  SCHEMA: "مخطط",
  AUDIO: "صوت",
  AUTRE: "أخرى",
};

const kindIcon: Record<string, string> = {
  SCHEMA: "📐",
  AUDIO: "🎤",
  AUTRE: "📎",
};

export default async function ParentAccueil() {
  const session = await getSession();
  if (!session) return null;

  const parent = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      linkedStudent: {
        include: {
          progress: { include: { lesson: true } },
          portfolio: { orderBy: { createdAt: "desc" }, take: 6 },
          userBadges: { include: { badge: true } },
        },
      },
    },
  });

  const child = parent?.linkedStudent;

  // Calculate summary stats
  const totalSteps = child
    ? child.progress.reduce(
        (acc, p) =>
          acc +
          (p.coursDone ? 1 : 0) +
          (p.exercicesDone ? 1 : 0) +
          (p.evaluationDone ? 1 : 0),
        0,
      )
    : 0;
  const fullyCompleted = child
    ? child.progress.filter(
        (p) => p.coursDone && p.exercicesDone && p.evaluationDone,
      ).length
    : 0;
  const scored = child
    ? child.progress.filter((p) => p.evaluationScore != null)
    : [];
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, p) => sum + (p.evaluationScore ?? 0), 0) /
            scored.length,
        )
      : null;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          متابعة الطفل
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          استعرض النتائج والإنتاجات وإشعارات الوساطة.
        </p>
      </div>

      <NotificationsPanel />

      {!child ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 py-12 dark:border-zinc-700">
          <span className="text-4xl">👤</span>
          <p className="text-zinc-500">لا يوجد تلميذ مرتبط بهذا الحساب.</p>
        </div>
      ) : (
        <>
          {/* Child hero card */}
          <section className="animate-fade-in-up stagger-1 relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-l from-rose-500 to-rose-600 p-6 text-white shadow-lg shadow-rose-600/20 dark:border-rose-900/60 dark:from-rose-800 dark:to-rose-900">
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold backdrop-blur-sm">
                {child.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{child.name}</h2>
                <p className="text-sm text-rose-100" dir="ltr">
                  {child.email}
                </p>
              </div>
            </div>

            {/* Summary stats */}
            <div className="relative mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">{totalSteps}</p>
                <p className="text-[10px] text-rose-200">خطوات مكتملة</p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">{fullyCompleted}</p>
                <p className="text-[10px] text-rose-200">دروس مكتملة</p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">
                  {avgScore != null ? `${avgScore}%` : "—"}
                </p>
                <p className="text-[10px] text-rose-200">متوسط الدرجات</p>
              </div>
            </div>
          </section>

          {/* Badges */}
          {child.userBadges.length > 0 && (
            <section className="animate-fade-in-up stagger-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <span>🏆</span> الشارات
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {child.userBadges.map((ub) => (
                  <span
                    key={ub.id}
                    className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    🏆 {ub.badge.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Progress table */}
          <section className="animate-fade-in-up stagger-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              التقدّم التفصيلي
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b-2 border-zinc-100 dark:border-zinc-800">
                    <th className="px-3 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                      الدرس
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      المحتوى
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      التمارين
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      التقييم
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      الدرجة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {child.progress.map((p) => {
                    const allDone =
                      p.coursDone && p.exercicesDone && p.evaluationDone;
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
                          allDone ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                        }`}
                      >
                        <td className="px-3 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                          <div className="flex items-center gap-2">
                            {allDone && (
                              <span className="text-emerald-500">✓</span>
                            )}
                            {p.lesson.title}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {p.coursDone ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              ✓
                            </span>
                          ) : (
                            <span className="text-zinc-300 dark:text-zinc-600">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {p.exercicesDone ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              ✓
                            </span>
                          ) : (
                            <span className="text-zinc-300 dark:text-zinc-600">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {p.evaluationDone ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              ✓
                            </span>
                          ) : (
                            <span className="text-zinc-300 dark:text-zinc-600">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center" dir="ltr">
                          {p.evaluationScore != null ? (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                p.evaluationScore >= 70
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                  : p.evaluationScore >= 50
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                              }`}
                            >
                              {p.evaluationScore}%
                            </span>
                          ) : (
                            <span className="text-zinc-300 dark:text-zinc-600">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {child.progress.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-zinc-400"
                      >
                        لا يوجد تقدم مسجّل بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent works */}
          <section className="animate-fade-in-up stagger-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                أعمال حديثة
              </h2>
              <Link
                href="/parent/portfolio"
                className="text-sm font-medium text-rose-600 hover:text-rose-800 dark:text-rose-400"
              >
                كل الأعمال
              </Link>
            </div>
            {child.portfolio.length === 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-8 dark:border-zinc-700">
                <span className="text-2xl opacity-40">🎨</span>
                <p className="text-xs text-zinc-400">
                  لا توجد أعمال في المعرض بعد.
                </p>
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {child.portfolio.map((it) => (
                  <li
                    key={it.id}
                    className="card-hover rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {kindIcon[it.kind] ?? "📎"}
                      </span>
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        {kindLabel[it.kind] ?? it.kind}
                      </span>
                    </div>
                    <p className="mt-2 font-medium text-zinc-800 dark:text-zinc-200">
                      {it.title}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
